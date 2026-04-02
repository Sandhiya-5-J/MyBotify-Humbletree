import asyncio
import json
from app.api.chat.utils.persistence import get_checkpointer

async def dump_checkpoints():
    checkpointer = await get_checkpointer()
    conn = await checkpointer.conn.acquire()
    try:
        # Langgraph PostgreSQL checkpointer creates tables `checkpoints` and `checkpoint_writes`
        # Let's see what's in checkpoint_writes which usually holds the raw tool messages
        records = await conn.fetch("SELECT task_id, channel, value FROM checkpoint_writes ORDER BY task_id DESC LIMIT 500")
        for rec in records:
            task_id, channel, val = rec
            try:
                # the payload is usually json or pickle encoded. For Postgres defaults it might be bytea.
                if isinstance(val, (bytes, bytearray)):
                    text_val = val.decode('utf-8', errors='ignore')
                else:
                    text_val = str(val)
                if 'test@example.com' in text_val or 'test12345' in text_val:
                    print("-----------------------------")
                    print(f"MATCH IN TASK {task_id} CHANNEL {channel}")
                    # truncate print to avoid massive output
                    idx = text_val.find('test@example.com')
                    if idx == -1: idx = text_val.find('test12345')
                    print(text_val[max(0, idx-100):min(len(text_val), idx+200)])
            except Exception as e:
                print(f"Error decoding: {e}")
                
    finally:
        await checkpointer.conn.release(conn)

if __name__ == "__main__":
    asyncio.run(dump_checkpoints())
