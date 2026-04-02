import requests
import uuid
import sys
import time
import json

BASE = 'http://localhost:8000'

print("=" * 60)
print("TEST: Signup with missing details")
print("=" * 60)
conv_id = str(uuid.uuid4())

payload = {
    'message': 'can help me to sign up',
    'conversation_id': conv_id
}
print(f"Conversation: {conv_id}")
print(f"Sending request...")
sys.stdout.flush()

start = time.time()
try:
    resp = requests.post(f'{BASE}/api/chat/conversation', json=payload, timeout=60)
    elapsed = time.time() - start
    print(f"\nStatus: {resp.status_code} ({elapsed:.1f}s)")
    try:
        data = resp.json()
        print(f"Response: {data.get('data', {}).get('message', '')}")
    except:
        print(f"Raw body: {resp.text}")
except Exception as e:
    elapsed = time.time() - start
    print(f"ERROR after {elapsed:.1f}s: {e}")
