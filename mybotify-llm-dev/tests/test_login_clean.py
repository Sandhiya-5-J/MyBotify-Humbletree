import requests
import uuid
import time
import sys
import json

BASE = 'http://localhost:8000'

print("=" * 60)
print("TEST: Login via AI chat")
print("=" * 60)
conv_id = str(uuid.uuid4())
login_email = f"testuser_98dc70@example.com"

payload = {
    'message': f'Please log me in. My email is {login_email} and password is mypassword123',
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
    sys.stdout.flush()
    # Write the full response to a file for reading
    with open("test_login_response.txt", "w", encoding="utf-8") as f:
        f.write(f"Status: {resp.status_code}\n")
        f.write(f"Time: {elapsed:.1f}s\n")
        f.write(f"Body: {resp.text}\n")
    print(f"Response saved to test_login_response.txt")
except Exception as e:
    elapsed = time.time() - start
    print(f"ERROR after {elapsed:.1f}s: {e}")
