from fastapi.testclient import TestClient
from main import app

client = TestClient(app)
try:
    response = client.post('/api/user/login', json={'email':'test@test.com', 'password':'password'})
    print('STATUS CODE:', response.status_code)
    print('RESPONSE:', response.text)
except Exception as e:
    import traceback
    traceback.print_exc()
