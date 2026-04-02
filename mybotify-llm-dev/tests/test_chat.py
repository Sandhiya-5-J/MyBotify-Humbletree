import asyncio
import sys
import traceback
import os

if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

async def test_llm_directly():
    """Test 1: Does the LLM itself work?"""
    print("=" * 60)
    print("TEST 1: Direct LLM call (no LangGraph)")
    print("=" * 60)
    try:
        from langchain.chat_models import init_chat_model
        from app.api.chat.utils.config import ChatSettings
        config = ChatSettings()
        print(f"  Provider: {config.PROVIDER}")
        print(f"  Model:    {config.MODEL}")
        print(f"  API Key:  {config.API_KEY[:10]}...")
        model = init_chat_model(f'{config.PROVIDER}:{config.MODEL}', api_key=config.API_KEY)
        res = await model.ainvoke('Hello, say just one word back.')
        print(f"  SUCCESS: {res.content}")
        return True
    except Exception as e:
        print(f"  FAILED: {type(e).__name__}: {e}")
        traceback.print_exc()
        return False

async def test_db_pool():
    """Test 2: Does the database pool work?"""
    print("\n" + "=" * 60)
    print("TEST 2: Database pool connection")
    print("=" * 60)
    try:
        from app.core.database import pool
        await pool.open(timeout=5)
        print("  SUCCESS: Pool opened")
        await pool.close()
        return True
    except Exception as e:
        print(f"  FAILED: {type(e).__name__}: {e}")
        traceback.print_exc()
        return False

async def test_graph_invoke():
    """Test 3: Does the full LangGraph work?"""
    print("\n" + "=" * 60)
    print("TEST 3: Full LangGraph ainvoke")
    print("=" * 60)
    try:
        from app.core.database import pool
        await pool.open(timeout=5)
        
        from langchain_core.messages import HumanMessage
        from app.api.chat.conversation import _get_app
        app = await _get_app()
        config = {'configurable': {'thread_id': 'debug-test-99'}}
        state = {'messages': [HumanMessage(content='Sign me up with name John, email john@test.com, password pass1234')]}
        print("  Invoking graph...")
        async for output in app.astream(state, config, stream_mode="updates"):
            for key, value in output.items():
                print(f"  [{key}]: {value}")
        await pool.close()
        return True
    except Exception as e:
        print(f"  FAILED: {type(e).__name__}: {e}")
        traceback.print_exc()
        return False

async def main():
    llm_ok = await test_llm_directly()
    if not llm_ok:
        print("\n>>> LLM itself is broken. Fix your API key / provider first!")
        return
    
    await test_graph_invoke()

# Use a loop that doesn't close prematurely on Windows
loop = asyncio.new_event_loop()
asyncio.set_event_loop(loop)
try:
    loop.run_until_complete(main())
finally:
    # Properly clean up pending tasks
    pending = asyncio.all_tasks(loop)
    for task in pending:
        task.cancel()
    loop.run_until_complete(asyncio.gather(*pending, return_exceptions=True))
    loop.close()
    print("\nDone.")
