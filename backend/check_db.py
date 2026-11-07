import sqlite3

con = sqlite3.connect("backend/regive.db")
cur = con.cursor()
tables = [r[0] for r in cur.execute("SELECT name FROM sqlite_master WHERE type='table'")]
print("Tables in SQLite database:", tables)
for t in tables:
    count = cur.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0]
    print(f" - {t}: {count} records")
con.close()
