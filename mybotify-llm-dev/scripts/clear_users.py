import psycopg2

conn = psycopg2.connect("postgresql://postgres:postgres123@localhost:5432/mybotify")
cur = conn.cursor()

# Check count before
cur.execute('SELECT count(*) FROM "users"')
print("Users before:", cur.fetchone()[0])

# Delete all users
cur.execute('TRUNCATE TABLE "users" CASCADE')
conn.commit()

# Check count after
cur.execute('SELECT count(*) FROM "users"')
print("Users after:", cur.fetchone()[0])

cur.close()
conn.close()
print("Done! All users deleted.")
