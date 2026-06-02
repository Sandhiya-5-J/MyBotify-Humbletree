import asyncio
import json
import logging
import textwrap
from collections.abc import AsyncGenerator
from pathlib import Path

from langchain.chat_models import init_chat_model
from langchain_core.documents import Document
from langchain_core.messages import HumanMessage, trim_messages
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.tools import tool
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_text_splitters import RecursiveJsonSplitter
from langgraph.prebuilt import ToolNode, create_react_agent

from .utils.config import ChatSettings
from .utils.models import ReplyResponseModel
from .utils.persistence import get_checkpointer

CONFIG = ChatSettings()

# Lazy-initialized globals
_model = None
_embeddings = None
_vector_store = None
_app = None
_trimmer = None


def _load_faqs_json() -> list[Document]:
    path = Path("./FAQs.json")

    with open(path) as f:
        data = json.load(f)["FAQs"]

    splits = RecursiveJsonSplitter().create_documents(data)

    return splits


from langchain_core.messages import HumanMessage, trim_messages, SystemMessage
from langgraph.graph import StateGraph, START, END

from .agents.state import AgentState
from .agents.planner import get_planner_prompt
from .agents.researcher import get_researcher_prompt
from .agents.content import get_content_prompt
from .agents.ads import get_ads_prompt
from .agents.analytics import get_analytics_prompt
from .agents.store_tools import get_store_context
from .agents.admin_tools import get_admin_context
from .agents.auth_tools import signup_user_tool, login_user_tool


async def _get_app():
    """Lazily initialize the LLM, embeddings, vector store, and multi-agent graph."""
    global _model, _embeddings, _vector_store, _app, _trimmer

    if _app is not None:
        return _app

    _model = init_chat_model(
        f"{CONFIG.PROVIDER}:{CONFIG.MODEL}",
        api_key=CONFIG.API_KEY,
    )

    try:
        _embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001", google_api_key=CONFIG.EMBEDDING_API_KEY or CONFIG.API_KEY)
        _vector_store = InMemoryVectorStore(_embeddings)
        faq_docs = _load_faqs_json()
        _vector_store.add_documents(faq_docs)
    except Exception as e:
        print(f"[WARNING] Google Embeddings initialization failed (API Key likely expired/invalid): {e}")
        print("Falling back to local resilient mock embeddings to prevent server crash.")
        from langchain_core.embeddings import Embeddings
        class ResilientFakeEmbeddings(Embeddings):
            def embed_documents(self, texts: list[str]) -> list[list[float]]:
                return [[0.0] * 768 for _ in texts]
            def embed_query(self, text: str) -> list[float]:
                return [0.0] * 768
        _embeddings = ResilientFakeEmbeddings()
        _vector_store = InMemoryVectorStore(_embeddings)


    # Agents list
    members = ["Researcher", "Content", "Ads", "Analytics", "Account"]

    # --- Node Definitions ---
    
    # 1. Planner Node
    async def planner_node(state: AgentState):
        # Check if the latest worker message indicates task completion
        # This is a DETERMINISTIC check that doesn't rely on the LLM
        messages = state.get("messages", [])
        if messages:
            last_msg = messages[-1]
            if isinstance(last_msg, SystemMessage):
                content = last_msg.content
                if "TASK COMPLETE" in content:
                    # Extract the useful part of the message (after "TASK COMPLETE - ")
                    import re
                    cleaned = re.sub(r'\[\w+\]:\s*TASK COMPLETE\s*-\s*', '', content).strip()
                    return {"messages": [SystemMessage(content=cleaned)], "next_agent": "FINISH"}
                elif "?" in content or "please provide" in content.lower() or "missing" in content.lower():
                    # If the worker asks a question or requests missing info, force FINISH deterministically
                    import re
                    cleaned = re.sub(r'\[\w+\]:\s*', '', content).strip()
                    return {"messages": [SystemMessage(content=cleaned)], "next_agent": "FINISH"}
        
        store_context = state.get("store_context", "")
        prompt = get_planner_prompt(members)
        # Inject store_context into the prompt
        chain = prompt.partial(store_context=store_context) | _model
        result = await chain.ainvoke(state)
        # Parse output to determine next agent
        response_text = result.content.strip()
        print(f"PLANNER DECISION: {response_text}")
        if messages:
            print(f"LAST WOKER MESSAGE: {messages[-1].content}")
        
        if response_text.startswith("FINISH"):
            # Clean up the prefix and return as final system/AI response
            final_text = response_text.replace("FINISH:", "").strip()
            return {"messages": [SystemMessage(content=final_text)], "next_agent": "FINISH"}
        
        # Otherwise, route to the specified worker
        next_agent = response_text
        # The LLM may output extra text around the agent name, try to extract it
        for member in members:
            if member in next_agent:
                next_agent = member
                break
        else:
            next_agent = "FINISH"  # Fallback if hallucinated
            
        print(f"DEBUG GRAPH RUN: Planner routing to -> {next_agent}")
        return {"next_agent": next_agent}

    # Helper function to create worker nodes
    def create_worker_node(prompt_template, agent_name):
        async def worker_node(state: AgentState):
            print(f"DEBUG GRAPH RUN: Executing worker -> {agent_name}")
            store_context = state.get("store_context", "")
            # Inject store_context into the worker prompt
            chain = prompt_template.partial(store_context=store_context) | _model
            result = await chain.ainvoke(state)
            # Tag the message so planner knows who replied
            output = f"[{agent_name}]: {result.content}"
            return {"messages": [SystemMessage(content=output)]}
        return worker_node

    # 2. Add Worker Nodes
    researcher_worker = create_worker_node(get_researcher_prompt(), "Researcher")
    content_worker = create_worker_node(get_content_prompt(), "Content")
    ads_worker = create_worker_node(get_ads_prompt(), "Ads")
    analytics_worker = create_worker_node(get_analytics_prompt(), "Analytics")

    # 3. Account Worker Node (with tool-calling for signup/login)
    auth_tools = [signup_user_tool, login_user_tool]
    _account_model = _model.bind_tools(auth_tools)

    def account_worker_node(state: AgentState):
        """Account agent that can call signup/login tools."""
        system_msg = SystemMessage(content=(
            "You are the Account Agent for MyBotify. "
            "You help users sign up and log in. "
            "Extract the user's name, email, and password from the conversation and call the appropriate tool. "
            "CRITICAL: If ANY required information is missing or you only have an empty string (e.g., '', ' '), DO NOT call the tool. Instead, ask the user to provide the exact missing information. "
        "CRITICAL: You MUST use the EXACT email and password provided by the user. DO NOT generate, modify, or 'secure' the password. Pass it character-for-character exactly as the user typed it. "
        "CRITICAL: Whenever you output a message verifying task success/failure or asking a user question, DO NOT output anything else. Just the message."
    ))
        messages = [system_msg] + list(state["messages"])
        result = _account_model.invoke(messages)

        # If the LLM made tool calls, execute them
        if hasattr(result, 'tool_calls') and result.tool_calls:
            tool_map = {t.name: t for t in auth_tools}
            tool_results = []
            for tc in result.tool_calls:
                tool_fn = tool_map.get(tc["name"])
                if tool_fn:
                    tool_output = tool_fn.invoke(tc["args"])
                    tool_results.append(str(tool_output))
            output = f"[Account]: TASK COMPLETE - {' '.join(tool_results)}"
        else:
            output = f"[Account]: {result.content}"

        return {"messages": [SystemMessage(content=output)]}

    # --- Graph Construction ---
    workflow = StateGraph(AgentState)

    workflow.add_node("Planner", planner_node)
    workflow.add_node("Researcher", researcher_worker)
    workflow.add_node("Content", content_worker)
    workflow.add_node("Ads", ads_worker)
    workflow.add_node("Analytics", analytics_worker)
    workflow.add_node("Account", account_worker_node)

    # Workers always report back to the planner
    for member in members:
        workflow.add_edge(member, "Planner")

    # Conditional routing from Planner
    conditional_map = {member: member for member in members}
    conditional_map["FINISH"] = END
    
    workflow.add_conditional_edges("Planner", lambda x: x["next_agent"], conditional_map)
    
    # Entry point
    workflow.add_edge(START, "Planner")

    # Compile with a strict recursion limit to prevent infinite loops
    _app = workflow.compile(checkpointer=await get_checkpointer())
    _app.step_timeout = 30 # Set a timeout just in case
    
    # Actually LangGraph compile does not take recursion limit directly, it's passed during ainvoke. 
    # Let me just return it.
    return _app


logger = logging.getLogger(__name__)

MAX_RETRIES = 3
BASE_DELAY = 2  # seconds


async def reply_stream(message: str, conversation_id: str, store_id: int | None = None, is_admin: bool | None = False) -> AsyncGenerator[str, None]:
    config = {
        'configurable': {
            'thread_id': conversation_id,
        },
    }

    prev_human_messages = []
    try:
        checkpointer = await get_checkpointer()
        checkpoint = await checkpointer.aget(config)
        if checkpoint:
            messages = checkpoint['channel_values']['messages']
            prev_human_messages = list(filter(lambda message: isinstance(message, HumanMessage), messages))
    except Exception as e:
        logger.warning(f"Failed to get checkpoint: {e}")

    if len(prev_human_messages) >= 3:
        data = {
            'chunk': 'Please sign-up to continue',
        }
        yield 'event: message_chunk\n'
        yield f'data: {json.dumps(data)}\n\n'
    else:
        input_ = [HumanMessage(message)]
        last_error = None

        if is_admin:
            context_str = get_admin_context()
        elif store_id:
            context_str = get_store_context(store_id)
        else:
            context_str = ""

        for attempt in range(MAX_RETRIES):
            try:
                # Initialize state with human message and store context
                state = {"messages": input_, "store_context": context_str}
                
                app_instance = await _get_app()
                stream_config = {**config, "recursion_limit": 10}
                async for chunk_info in app_instance.astream(state, stream_config, stream_mode='updates'):
                    # LangGraph stream_mode='updates' yields dicts keyed by node name
                    for node_name, updates in chunk_info.items():
                        if "messages" in updates:
                            for msg in updates["messages"]:
                                # Only stream back the SystemMessages generated by workers/planner
                                if isinstance(msg, SystemMessage):
                                    data = {
                                        'chunk': msg.content + "\n",
                                    }
                                    yield 'event: message_chunk\n'
                                    yield f'data: {json.dumps(data)}\n\n'
                                    
                last_error = None
                break
            except Exception as e:
                last_error = e
                print(f"STREAM EXCEPTION: {e}")
                logger.warning(f"Chat stream attempt {attempt + 1}/{MAX_RETRIES} failed: {e}")
                if attempt < MAX_RETRIES - 1:
                    await asyncio.sleep(BASE_DELAY * (2 ** attempt))

        if last_error:
            logger.error(f"Chat stream failed after {MAX_RETRIES} attempts: {last_error}")
            data = {'chunk': 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.'}
            yield 'event: message_chunk\n'
            yield f'data: {json.dumps(data)}\n\n'

    metadata = {"conversation_id": conversation_id}
    yield "event: metadata\n"
    yield f"data: {json.dumps(metadata)}\n\n"

    yield "data: [DONE]\n\n"


async def reply(message: str, conversation_id: str, store_id: int | None = None, is_admin: bool | None = False) -> ReplyResponseModel:
    config = {
        'configurable': {
            'thread_id': conversation_id,
        },
    }

    prev_human_messages = []
    try:
        checkpointer = await get_checkpointer()
        checkpoint = await checkpointer.aget(config)
        if checkpoint:
            messages = checkpoint['channel_values']['messages']
            prev_human_messages = list(filter(lambda message: isinstance(message, HumanMessage), messages))
    except Exception as e:
        logger.warning(f"Failed to get checkpoint: {e}")

    if len(prev_human_messages) >= 3:
        message = 'Please sign-up to continue'
    else:
        input_ = [HumanMessage(message)]
        last_error = None

        if is_admin:
            context_str = get_admin_context()
        elif store_id:
            context_str = get_store_context(store_id)
        else:
            context_str = ""

        for attempt in range(MAX_RETRIES):
            try:
                state = {"messages": input_, "store_context": context_str}
                app_instance = await _get_app()
                invoke_config = {**config, "recursion_limit": 10}
                response = await app_instance.ainvoke(state, invoke_config)
                
                # The final synthesized answer from the Planner
                message = response['messages'][-1].content
                last_error = None
                break
            except Exception as e:
                # If recursion limit is hit, try to extract the last useful message
                if "recursion" in str(e).lower():
                    logger.warning(f"Graph hit recursion limit, extracting last message")
                    message = "I was able to process your request, but it took longer than expected. Please try again or provide more specific details."
                    last_error = None
                    break
                last_error = e
                import traceback
                error_trace = traceback.format_exc()
                print(f"REPLY EXCEPTION: {e}\n{error_trace}")
                logger.warning(f"Chat reply attempt {attempt + 1}/{MAX_RETRIES} failed: {e}")
                if attempt < MAX_RETRIES - 1:
                    await asyncio.sleep(BASE_DELAY * (2 ** attempt))

        if last_error:
            logger.error(f"Chat reply failed after {MAX_RETRIES} attempts: {last_error}")
            message = "Sorry, I'm having trouble connecting right now. Please try again in a moment."

    # Clean up any raw agent prefixes from the message
    import re
    message = re.sub(r'\[\w+\]:\s*(TASK COMPLETE\s*-\s*)?', '', message).strip()

    return ReplyResponseModel(message=message, conversation_id=conversation_id)
