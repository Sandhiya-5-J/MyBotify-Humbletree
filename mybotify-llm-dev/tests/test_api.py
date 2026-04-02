import requests
import json
import uuid

# Test 1: Signup via chat
print("=" * 60)
print("TEST 1: Signup via AI chat")
print("=" * 60)
conv_id = str(uuid.uuid4())
r = requests.post('http://localhost:8000/api/chat/conversation', json={
    'message': 'Sign me up with name Test User, email testuser99@example.com, password testpass123',
    'conversation_id': conv_id
})
print(f"Status: {r.status_code}")
print(f"Response: {json.dumps(r.json(), indent=2)}")

# Test 2: Login via chat (different conversation)
print("\n" + "=" * 60)
print("TEST 2: Login via AI chat")
print("=" * 60)
conv_id2 = str(uuid.uuid4())
r = requests.post('http://localhost:8000/api/chat/conversation', json={
    'message': 'Login with email testuser99@example.com and password testpass123',
    'conversation_id': conv_id2
})
print(f"Status: {r.status_code}")
print(f"Response: {json.dumps(r.json(), indent=2)}")
