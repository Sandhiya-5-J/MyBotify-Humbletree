import psycopg

def kill_connections():
    print('Connecting directly (SYNC)...')
    with psycopg.connect('postgresql://postgres:postgres123@localhost:5432/postgres') as conn:
        print('Connected. Executing kill query...')
        with conn.cursor() as cur:
            cur.execute("""
                SELECT pg_terminate_backend(pid)
                FROM pg_stat_activity
                WHERE pid <> pg_backend_pid();
            """)
        conn.commit()
    print('Cleared all other locks and connections!')

kill_connections()
