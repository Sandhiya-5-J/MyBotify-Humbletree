import requests
import uuid
import sys

conv_id = str(uuid.uuid4())
print(f"Testing chat stream... conv_id {conv_id}")

try:
    with requests.post('http://localhost:8000/api/chat/conversation', json={
        'message': 'Sign me up with name Test User, email ssetest@example.com, password testpass123',
        'conversation_id': conv_id
    }, stream=True) as r:
        print(f"Connected, status {r.status_code}")
        for line in r.iter_lines():
            if line:
                print(line.decode('utf-8'))
except Exception as e:
    print(f"Error: {e}")
