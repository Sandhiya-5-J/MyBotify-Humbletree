import psycopg2

conn = psycopg2.connect("postgresql://postgres:postgres123@localhost:5432/mybotify")
cur = conn.cursor()

# Check if user exists
cur.execute("SELECT id, name, email, role FROM users WHERE email = %s", ("niranjannivash0@gmail.com",))
row = cur.fetchone()

if row:
    print(f"Found user: id={row[0]}, name={row[1]}, email={row[2]}, role={row[3]}")
    # Update role to admin
    cur.execute("UPDATE users SET role = 'ADMIN' WHERE email = %s", ("niranjannivash0@gmail.com",))
    conn.commit()
    print("Updated role to ADMIN!")
else:
    print("User not found — needs to sign up first at /signup")

cur.close()
conn.close()
