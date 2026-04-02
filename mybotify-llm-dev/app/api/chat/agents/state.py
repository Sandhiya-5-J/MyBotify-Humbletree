import operator
from typing import Annotated, Sequence, TypedDict

from langchain_core.messages import BaseMessage


class AgentState(TypedDict):
    """
    The state of the multi-agent graph.
    - messages: Holds the conversation history.
    - next_agent: A string indicating the next node to execute.
    - store_context: Pre-fetched store data summary for agents.
    """
    messages: Annotated[Sequence[BaseMessage], operator.add]
    next_agent: str
    store_context: str
