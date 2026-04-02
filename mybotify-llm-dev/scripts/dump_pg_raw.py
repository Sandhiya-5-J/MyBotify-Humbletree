import psycopg
import sys

URL = "postgresql://postgres:postgres123@localhost:5432/mybotify"

try:
    with psycopg.connect(URL) as conn:
        with conn.cursor() as cur:
            # Query all rows where the checkpoint or writes contain the email
            # We'll check the checkpoint_writes table first
            cur.execute("SELECT task_id, value FROM checkpoint_writes ORDER BY task_id DESC LIMIT 500")
            rows = cur.fetchall()
            found = False
            for r in rows:
                tid, val = r
                if val:
                    # depending on encoding it could be a memoryview or bytes
                    if isinstance(val, memoryview):
                        val_str = val.tobytes().decode('utf-8', errors='ignore')
                    elif isinstance(val, (bytes, bytearray)):
                        val_str = val.decode('utf-8', errors='ignore')
                    else:
                        val_str = str(val)
                        
                    if 'test@example.com' in val_str or 'test12345' in val_str:
                        found = True
                        print(f"--- MATCH IN TASK {tid} ---")
                        idx = val_str.find('test@example.com')
                        if idx == -1: idx = val_str.find('test12345')
                        print(val_str[max(0, idx-100):min(len(val_str), idx+200)])
            if not found:
                print("No mentions found in checkpoint_writes.")
                
            cur.execute("SELECT thread_id, checkpoint FROM checkpoints LIMIT 50")
            c_rows = cur.fetchall()
            for r in c_rows:
                tid, val = r
                if val:
                    if isinstance(val, memoryview):
                        val_str = val.tobytes().decode('utf-8', errors='ignore')
                    elif isinstance(val, (bytes, bytearray)):
                        val_str = val.decode('utf-8', errors='ignore')
                    else:
                        val_str = str(val)
                    if 'test@example.com' in val_str or 'test12345' in val_str:
                        print(f"--- MATCH IN CHECKPOINT {tid} ---")
                        idx = val_str.find('test@example.com')
                        if idx == -1: idx = val_str.find('test12345')
                        print(val_str[max(0, idx-100):min(len(val_str), idx+200)])
except Exception as e:
    print("Database error:", e)
