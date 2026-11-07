# ReGiVe Platform — Database Migration & Schema Report
## Phase 01 Migration: Users, Sessions, and Profile Linkages

**Document Version:** 1.0.0  
**Migration ID:** `001_create_users_and_sessions`  
**Target Database:** `backend/regive.db`  
**Backup Path:** `backend/regive.db.backup`  
**Execution Date:** 7 November 2026  
**Status:** **Applied & 100% Verified**

---

## 1. Migration Overview

To eliminate hardcoded account-switching and establish secure, database-driven authentication with Role-Based Access Control (RBAC), Phase 01 introduces two dedicated entities without altering existing business records:
1. `users`: Holds normalized credentials, Argon2id password hashes, user roles, account flags, and foreign key pointers to business profiles (`donors.id` or `partners.id`).
2. `user_sessions`: Manages server-side sessions with cryptographically random tokens, expiration timestamps, IP/agent metadata, and explicit revocation flags.

---

## 2. Backup Verification

Prior to applying any DDL statements, a physical byte-for-byte copy of the live database was generated and verified:
- **Primary Database:** `backend/regive.db` (SHA verified)
- **Backup Copy:** `backend/regive.db.backup`
- **Existing Record Counts Confirmed:**
  - `donors`: 1 record (`usr-elena-01`)
  - `partners`: 12 verified organizations (`prt-ngo-01` through `prt-rec-06`)
  - `donations`: 15 persisted records
  - `ai_analyses`: 15 neural analyses
  - `donation_matches`: 15 semantic match scores
  - `donation_events`: 75 physical lifecycle events

---

## 3. Applied DDL & Database Schema

The migration was packaged in [`backend/migrations/migration_001_create_users_and_sessions.py`](file:///c:/Users/pvenk/Downloads/Excel_Project/backend/migrations/migration_001_create_users_and_sessions.py).

### 3.1 `users` Table Schema
```sql
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) NOT NULL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL, -- 'donor', 'ngo', 'recycler', 'admin'
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

CREATE UNIQUE INDEX IF NOT EXISTS ix_users_email ON users(email);
CREATE INDEX IF NOT EXISTS ix_users_role ON users(role);
CREATE INDEX IF NOT EXISTS ix_users_donor_id ON users(donor_id);
CREATE INDEX IF NOT EXISTS ix_users_partner_id ON users(partner_id);
```

### 3.2 `user_sessions` Table Schema
```sql
CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(128) NOT NULL PRIMARY KEY, -- 64-character token hex
    user_id VARCHAR(64) NOT NULL,
    created_at DATETIME NOT NULL,
    expires_at DATETIME NOT NULL,
    last_activity_at DATETIME NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_revoked BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ix_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS ix_user_sessions_expires_at ON user_sessions(expires_at);
```

---

## 4. Entity-Relationship Model (SQLAlchemy ORM)

The SQLAlchemy 2.0 ORM models in [`backend/models.py`](file:///c:/Users/pvenk/Downloads/Excel_Project/backend/models.py) were updated to establish bidirectional relationships:

```
+-----------------------------------------------------------+
|                          User                             |
+-----------------------------------------------------------+
| id: String (PK)                                           |
| email: String (Unique, Indexed)                           |
| password_hash: String                                     |
| role: String (Indexed)                                    |
| donor_id: String (FK -> donors.id)                        |
| partner_id: String (FK -> partners.id)                    |
| is_active: Boolean                                        |
| is_verified: Boolean                                      |
+-----------------------------------------------------------+
      | 1                     | 1                     | 1
      |                       |                       |
      v 0..1                  v 0..1                  v 0..*
+--------------------+  +--------------------+  +----------------------+
|       Donor        |  |      Partner       |  |     UserSession      |
+--------------------+  +--------------------+  +----------------------+
| id (PK)            |  | id (PK)            |  | id: String (PK)      |
| name: String       |  | name: String       |  | user_id: String (FK) |
| email: String      |  | org_type: String   |  | expires_at: DateTime |
| phone: String      |  | stream: String     |  | is_revoked: Boolean  |
+--------------------+  +--------------------+  +----------------------+
```

- `User.donor` <-> `Donor.user` (1-to-1 relationship)
- `User.partner` <-> `Partner.user` (1-to-1 relationship)
- `User.sessions` <-> `UserSession.user` (1-to-many relationship with cascade delete)

---

## 5. Verification & Test Execution Results

1. **Pre-flight Sandbox Test:**
   - Script was first tested on a temporary sandbox database copy (`backend/regive_migration_test.db`).
   - Verified that tables created cleanly and foreign keys bound properly.
2. **Live Execution Test:**
   - Applied migration to `backend/regive.db`.
   - Verified table presence via SQLite master table introspection:
     `['users', 'user_sessions']` registered with full index constraints.
3. **SQLAlchemy ORM Model Introspection Test:**
   - Executed ORM session test via `backend.database.SessionLocal`.
   - Queried all 7 database models:
     - `Users`: 0
     - `UserSessions`: 0
     - `Donors`: 1
     - `Partners`: 12
     - `Donations`: 15
   - Return code: `0` (Success, no errors or warnings).

---

## 6. Phase 01 Completion Checklist

- [x] Physical database backup created at `backend/regive.db.backup`.
- [x] Repeatable migration script implemented in `backend/migrations/migration_001_create_users_and_sessions.py`.
- [x] Tested safely on database copy before live application.
- [x] Live SQLite database migrated with `users` and `user_sessions` tables.
- [x] SQLAlchemy models updated with bidirectional relationships in `backend/models.py`.
- [x] Zero existing records deleted or damaged.
- [x] Verified via ORM query tests.
- [x] Migration report published in `docs/DATABASE_MIGRATION_REPORT.md`.
