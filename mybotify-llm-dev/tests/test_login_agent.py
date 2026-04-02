import requests
import uuid
import sys
import time

BASE = 'http://localhost:8000'

print("=" * 60)
print("TEST: Agent Login parsing")
print("=" * 60)
conv_id = f"test-login-{uuid.uuid4().hex[:6]}"

payload = {
    'message': 'Login with email test_login_x1@example.com and password password123',
    'conversation_id': conv_id
}
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
