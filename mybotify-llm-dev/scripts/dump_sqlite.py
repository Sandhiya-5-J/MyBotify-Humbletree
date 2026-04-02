import sqlite3
import json
conn = sqlite3.connect('checkpoints.sqlite')
c = conn.cursor()
c.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = c.fetchall()
print("Tables:", [t[0] for t in tables])

for t in tables:
    table_name = t[0]
    if table_name == 'checkpoints':
        c.execute("SELECT checkpoint FROM checkpoints ORDER BY thread_id DESC LIMIT 50")
        rows = c.fetchall()
        for row in rows:
            data = row[0]
            if isinstance(data, bytes):
                data = data.decode('utf-8')
            if 'test12345' in data or 'test@example.com' in data:
                print("FOUND RELEVANT CHECKPOINT!")
                # We can't easily parse the pickle object or json dict directly if it's binary, but we can search for the adjacent string.
                idx = data.find('test@example.com')
                print(data[max(0, idx-50):min(len(data), idx+150)])
