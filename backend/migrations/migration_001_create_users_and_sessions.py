"""
Migration: 001_create_users_and_sessions.py
Description: Creates 'users' and 'user_sessions' tables in SQLite database with foreign keys to donors and partners.
Preserves all existing tables and records.
"""

import sqlite3
import os
import sys

def apply_migration(db_path: str):
    print(f"Applying migration 001_create_users_and_sessions to: {db_path}")
    if not os.path.exists(db_path):
        raise FileNotFoundError(f"Database file not found: {db_path}")

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Enable foreign keys
    cursor.execute("PRAGMA foreign_keys = ON;")

    # 1. Create 'users' table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) NOT NULL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(32) NOT NULL,
        donor_id VARCHAR(64),
        partner_id VARCHAR(64),
        is_active BOOLEAN NOT NULL DEFAULT 1,
        is_verified BOOLEAN NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        last_login_at DATETIME,
        FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE SET NULL,
        FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE SET NULL
    );
    """)

    cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_email ON users(email);")
    cursor.execute("CREATE INDEX IF NOT EXISTS ix_users_role ON users(role);")
    cursor.execute("CREATE INDEX IF NOT EXISTS ix_users_donor_id ON users(donor_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS ix_users_partner_id ON users(partner_id);")

    # 2. Create 'user_sessions' table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_sessions (
        id VARCHAR(128) NOT NULL PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        created_at DATETIME NOT NULL,
        expires_at DATETIME NOT NULL,
        last_activity_at DATETIME NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        is_revoked BOOLEAN NOT NULL DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    cursor.execute("CREATE INDEX IF NOT EXISTS ix_user_sessions_user_id ON user_sessions(user_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS ix_user_sessions_expires_at ON user_sessions(expires_at);")

    conn.commit()

    # Verification
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('users', 'user_sessions');")
    tables = [row[0] for row in cursor.fetchall()]
    print(f"Verified migrated tables: {tables}")

    conn.close()
    return tables

if __name__ == "__main__":
    target_db = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.dirname(__file__)), "regive.db")
    apply_migration(target_db)
