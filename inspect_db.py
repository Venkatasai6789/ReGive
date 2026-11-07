import sqlite3
import json

conn = sqlite3.connect('backend/regive.db')
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

print('=== SQLITE DATABASE AUDIT: backend/regive.db ===\n')

cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = [r[0] for r in cursor.fetchall()]
print(f"Tables ({len(tables)}): {', '.join(tables)}")

cursor.execute('SELECT count(*) FROM donations')
print(f"Total Donations: {cursor.fetchone()[0]}")

cursor.execute('SELECT count(*) FROM ai_analyses')
print(f"Total AI Analyses: {cursor.fetchone()[0]}")

cursor.execute('SELECT count(*) FROM partners')
print(f"Total Verified Partners: {cursor.fetchone()[0]}")

print('\n--- RECENT DONATIONS IN SQLITE ---')
cursor.execute('SELECT id, title, category, food_type, status, quantity, unit, created_at FROM donations ORDER BY created_at DESC LIMIT 5')
for row in cursor.fetchall():
    print(dict(row))

print('\n--- RECENT AI ANALYSES IN SQLITE ---')
cursor.execute('SELECT donation_id, caption, detected_food_type, edibility_score, safety_status FROM ai_analyses ORDER BY id DESC LIMIT 5')
for row in cursor.fetchall():
    print(dict(row))

print('\n--- RECENT PARTNER MATCHES IN SQLITE ---')
cursor.execute('SELECT donation_id, partner_id, similarity_score, final_score, rank, distance_km FROM donation_matches ORDER BY id DESC LIMIT 5')
for row in cursor.fetchall():
    print(dict(row))

conn.close()
