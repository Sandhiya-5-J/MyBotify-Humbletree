import requests
import uuid
import time
import sys

BASE = 'http://localhost:8000'

print("=" * 60)
print("TEST: Signup via AI chat (fresh email)")
print("=" * 60)
conv_id = str(uuid.uuid4())
new_email = f"testuser_{uuid.uuid4().hex[:6]}@example.com"

payload = {
    'message': f'Please sign me up. My name is Test User, email is {new_email}, password is mypassword123',
    'conversation_id': conv_id
}
print(f"Conversation: {conv_id}")
print(f"Email: {new_email}")
print(f"Sending request...")
sys.stdout.flush()

start = time.time()
try:
    resp = requests.post(f'{BASE}/api/chat/conversation', json=payload, timeout=120)
    elapsed = time.time() - start
    print(f"\nStatus: {resp.status_code} ({elapsed:.1f}s)")
    sys.stdout.flush()
    # Write the full response to a file for reading
    with open("test_signup_response.txt", "w", encoding="utf-8") as f:
        f.write(f"Status: {resp.status_code}\n")
        f.write(f"Time: {elapsed:.1f}s\n")
        f.write(f"Headers: {dict(resp.headers)}\n")
        f.write(f"Body: {resp.text}\n")
    print(f"Response saved to test_signup_response.txt")
except requests.exceptions.Timeout:
    elapsed = time.time() - start
    print(f"TIMEOUT after {elapsed:.1f}s")
except Exception as e:
    elapsed = time.time() - start
    print(f"ERROR after {elapsed:.1f}s: {e}")
