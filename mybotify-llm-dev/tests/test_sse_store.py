import httpx
import uuid
import json
import asyncio

async def test_stream():
    conv_id = f"test-stream-{uuid.uuid4().hex[:6]}"
    url = "http://localhost:8000/api/chat/conversation/stream"
    payload = {
        "message": "analyze my store",
        "conversation_id": conv_id,
        "store_id": 1
    }
    print(f"Connecting to SSE endpoint... {conv_id}")
    
    async with httpx.AsyncClient() as client:
        try:
            async with client.stream("POST", url, json=payload, timeout=60.0) as response:
                print(f"Connected! Status: {response.status_code}")
                async for line in response.aiter_lines():
                    if line:
                        print(f"CHUNK: {line}")
        except Exception as e:
            print(f"ERROR: {e}")

if __name__ == "__main__":
    asyncio.run(test_stream())
