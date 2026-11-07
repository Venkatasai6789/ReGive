# ReGiVe Platform — Secure Authentication & Multi-Account Architecture Audit
## Phase 00 Technical Inspection & Security Audit

**Document Version:** 1.0.0  
**Audit Date:** 7 November 2026  
**Auditor / Roles:** Principal Software Architect, Application Security Engineer, Database Architect, Senior Full-Stack Engineer  
**Scope:** ReGiVe AI Food Resource Circulation Loop (Frontend, Backend, ML Services, SQLite Schema)  
**Status:** **Phase 00 Completed — Ready for Phase 01**

---

## 1. Executive Summary & Existing Architecture

The ReGiVe platform operates as an AI-powered physical resource circulation loop diverting surplus food and organic resources from landfill waste streams into verified nonprofit programs (Food Banks, Shelters, Community Kitchens) and bio-recycling processing hubs (Composting, Biogas, Animal Feed).

### 1.1 Existing Technology Stack
- **Frontend:** React 19 (`react: ^19.0.0`, `react-dom: ^19.0.0`), Vite 6, Tailwind CSS v4, Lucide React icons.
- **Backend:** Python 3.14+, FastAPI 0.136+, Uvicorn 0.48+, SQLAlchemy 2.0.50, Pydantic 2.13+.
- **AI / ML Pipeline:** PyTorch 2.12+, Hugging Face Transformers (`OpenAI CLIP ViT-B/32`, `Salesforce BLIP-Base`), MiniLM-L6-v2 384-dimensional sentence embeddings, FAISS vector index, deterministic food safety validation rules (4h/24h perishable protocols).
- **Persistence:** SQLite (`backend/regive.db`), SQLAlchemy ORM models.
- **Current Runtime Status:**
  - Vite dev server running on `http://localhost:5173/` (background task `task-124`).
  - FastAPI server running on `http://127.0.0.1:8000/` (background task `task-1271`).
  - SQLite database seeded with 1 donor profile (`usr-elena-01`), 12 partner organizations (`prt-ngo-01` to `prt-rec-06`), 15 persisted donations, 15 AI analyses, matching scores, and 75+ lifecycle timeline events.

---

## 2. Existing Account-Switching Implementation Audit

Currently, user identity and portal navigation rely on **hardcoded frontend state and unauthenticated query parameters**:

### 2.1 Frontend State Management (`src/App.tsx`)
```typescript
// Current App.tsx state:
const [portalMode, setPortalMode] = useState<'donor' | 'partner'>('donor');
const [activePartnerId, setActivePartnerId] = useState<string>('prt-ngo-01');
const [currentDonorScreen, setCurrentDonorScreen] = useState<ScreenType>('home');
```
- **Vulnerability:** Role and organization switching are driven entirely by React client-side state without server-side identity verification.
- **Account-Switching Functions:**
  - `handleSwitchToPartner(partnerId)` sets `portalMode = 'partner'` and loads data for that ID.
  - `handleSwitchToDonor()` sets `portalMode = 'donor'`.
  - `handleSwitchPartnerOrg(newPartnerId)` changes `activePartnerId` to any arbitrary partner ID without authorization.
  - `handlePartnerLogout()` merely resets client-side state to `'donor'` without invalidating any server session.

### 2.2 Hardcoded Identity Footprint in Frontend Components
1. **`src/components/layout/DonorHeader.tsx`:**
   - **Line 142:** Hardcoded profile initials avatar: `ER`.
   - **Line 146:** Hardcoded display name: `Elena`.
   - **Lines 154–156:** Hardcoded user card: `Elena Rostova`, `elena.rostova@university.edu`.
   - **Lines 170–198:** "SWITCH TO PARTNER PORTAL" menu allowing immediate impersonation of `prt-ngo-01` (Annapoorna Trust) or `prt-rec-03` (Green Earth Compost).
2. **`src/components/partner/PartnerHeader.tsx`:**
   - **Lines 163–208:** Profile menu containing direct buttons:
     - `Switch to Donor Portal (Elena)`
     - `Annapoorna Trust (Food NGO)`
     - `Green Earth Compost (Recycler)`
3. **`src/components/home/DonationOverview.tsx`:**
   - **Lines 25–27:** Hardcoded header: `Elena Rostova • Personal Contributions`.
4. **`src/pages/CreateDonation.tsx` & `src/services/donationService.ts`:**
   - Hardcoded donor ID fallback: `donor_id = 'usr-elena-01'`.
5. **`backend/routes/donations.py` & `backend/schemas.py`:**
   - Endpoint `GET /api/donations`: `donor_id: str = Query("usr-elena-01")`.
   - Schema `DonationCreateRequest`: `donor_id: str = "usr-elena-01"`.

---

## 3. Existing Profile Components Audit

| Component | Current Implementation | Issues Identified |
| :--- | :--- | :--- |
| **`DonorHeader.tsx`** | Renders static `ER` avatar and hardcoded Elena Rostova menu | No connection to an auth session; displays hardcoded name even if another user were logged in. |
| **`PartnerHeader.tsx`** | Shows initials based on `partner.name.substring(0, 2)` | Switches partners on click without credentials. |
| **`HeroSection.tsx`** | Contains CTAs: `Start Donating`, `Explore Donations`, `Upload an item photo to begin` | CTAs immediately route to `create` or `donations` without checking authentication. |
| **`DonationOverview.tsx`** | Displays personal donation statistics | Hardcoded to Elena Rostova. |
| **`PartnerDonationDetailsDrawer.tsx`** | Displays donor information in Section B | Reads `donation.donor_name`, `email`, `phone`, but does not verify caller session. |

---

## 4. Existing Database Relationships & Schema (`backend/regive.db`)

### 4.1 Master Table Inspection
```sql
-- Existing 'donors' table:
CREATE TABLE donors (
    id VARCHAR NOT NULL PRIMARY KEY,
    name VARCHAR NOT NULL,
    email VARCHAR NOT NULL UNIQUE,
    phone VARCHAR,
    role VARCHAR,
    created_at DATETIME
);

-- Existing 'partners' table:
CREATE TABLE partners (
    id VARCHAR NOT NULL PRIMARY KEY,
    name VARCHAR NOT NULL,
    organization_type VARCHAR NOT NULL,
    stream VARCHAR,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    service_radius_km FLOAT,
    capacity INTEGER,
    description TEXT NOT NULL,
    contact_email VARCHAR,
    contact_phone VARCHAR,
    operating_hours VARCHAR,
    address VARCHAR,
    rating FLOAT
);

-- Existing 'donations' table:
CREATE TABLE donations (
    id VARCHAR NOT NULL PRIMARY KEY,
    donor_id VARCHAR NOT NULL REFERENCES donors(id),
    image_path VARCHAR,
    category VARCHAR,
    food_type VARCHAR,
    title VARCHAR NOT NULL,
    description TEXT,
    quantity FLOAT,
    unit VARCHAR,
    condition VARCHAR,
    storage_condition VARCHAR,
    hours_since_cooked FLOAT,
    expiry_date VARCHAR,
    pickup_location VARCHAR NOT NULL,
    status VARCHAR,
    selected_partner_id VARCHAR REFERENCES partners(id),
    created_at DATETIME,
    updated_at DATETIME
);
```

### 4.2 Deficiencies in Existing Database Design
1. **Missing Authentication Entity:** No `users` table exists.
2. **Missing Credential Storage:** No password hashes, salts, or authentication secrets exist.
3. **Missing Session Management:** No table or cache tracks active server-side sessions, refresh tokens, or revoked sessions.
4. **Decoupled Identity:** `donors` and `partners` exist as business entities, but have no authentication credentials or relationship to a login identity.

---

## 5. Required Database Changes

To preserve existing business entities while establishing production-grade authentication, we will introduce two new tables:

### 5.1 New Table: `users`
```sql
CREATE TABLE users (
    id VARCHAR(64) NOT NULL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL, -- 'donor', 'ngo', 'recycler', 'admin'
    donor_id VARCHAR(64) REFERENCES donors(id),
    partner_id VARCHAR(64) REFERENCES partners(id),
    is_active BOOLEAN NOT NULL DEFAULT 1,
    is_verified BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    last_login_at DATETIME
);
CREATE INDEX ix_users_email ON users(email);
CREATE INDEX ix_users_role ON users(role);
```

### 5.2 New Table: `user_sessions`
```sql
CREATE TABLE user_sessions (
    id VARCHAR(128) NOT NULL PRIMARY KEY, -- Cryptographically secure token (64-char hex)
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at DATETIME NOT NULL,
    expires_at DATETIME NOT NULL,
    last_activity_at DATETIME NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_revoked BOOLEAN NOT NULL DEFAULT 0
);
CREATE INDEX ix_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX ix_user_sessions_expires_at ON user_sessions(expires_at);
```

### 5.3 Preservation Strategy
- The existing `donors` table and primary keys (`usr-elena-01`) are preserved.
- The existing `partners` table and primary keys (`prt-ngo-01` to `prt-rec-06`) are preserved.
- All 15 existing `donations`, `ai_analyses`, `donation_matches`, and `donation_events` remain 100% intact.

---

## 6. Required API Changes

### 6.1 Authentication Endpoints (New Router: `backend/routes/auth.py`)
- `POST /api/auth/login`:
  - Request: `{ email: str, password: str }`
  - Validation: Lowercase/normalize email, verify password with **Argon2id** (`pwdlib`), rate-limit failed attempts.
  - Response: Set `regive_session` HttpOnly cookie, return `{ id, email, display_name, role, linked_profile_id, organization_type }`.
- `POST /api/auth/logout`:
  - Reads cookie, marks session `is_revoked = True` in `user_sessions`, deletes cookie.
- `GET /api/auth/me`:
  - Validates session cookie, returns current authenticated user and linked profile.
- `GET /api/auth/status`:
  - Lightweight session probe returning `{ authenticated: bool, user?: UserResponse }`.

### 6.2 Modifications to Existing Endpoints
- **`backend/routes/donations.py`:**
  - `GET /api/donations`: Extract `donor_id` from the authenticated session (rejecting unauthenticated callers or cross-donor queries).
  - `POST /api/donations`: Derive `donor_id` from the authenticated session, ignoring client-tampered IDs.
- **`backend/routes/partners.py`:**
  - `GET /api/partners/{partner_id}/dashboard` & `/donations`: Verify that `authenticated_user.partner_id == partner_id`. Return HTTP `403 Forbidden` if mismatched.

---

## 7. Required Frontend Changes

### 7.1 New State & Auth Provider (`src/context/AuthContext.tsx`)
- Provides `user`, `role`, `isAuthenticated`, `isLoading`, `login()`, `logout()`, `refreshUser()`.
- On application mount: queries `GET /api/auth/me` to restore valid sessions seamlessly.

### 7.2 Route Guards & Redirection (`src/components/auth/`)
- `ProtectedRoute.tsx`: Ensures user is logged in; redirects to `/login` with `returnUrl`.
- `RoleGuard.tsx`: Ensures user has the required role (`donor`, `ngo`, `recycler`).
- `LandingPageAuthGuard.tsx`: Guards donation CTAs (`Start Donating`, `Explore Donations`, `Upload photo`).

### 7.3 Shared Login Page (`src/pages/auth/LoginPage.tsx`)
- Single unified login screen for all 4 roles (Donors, NGOs, Recyclers, Admins).
- Zero manual role selectors — role is identified strictly by backend lookup.
- Design: Strict adherence to `#F5E84D` outer frame, rounded-3xl container, accessible focus states, password visibility toggle, error banners, and loading spinners.

### 7.4 Removal of Hardcoded Profile Menus
- Strip hardcoded `Elena Rostova` from `DonorHeader.tsx` and `DonationOverview.tsx`.
- Strip `Annapoorna Trust` and `Green Earth Compost` switcher buttons.
- Display dynamic user initials, name, and role badge.
- When unauthenticated on the landing page: show a clean `Log In` button instead of a profile avatar.

---

## 8. Security Risk Assessment

| Threat Vector | Severity | Current Vulnerability | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Impersonation / Broken Access Control** | **Critical** | Any user can access any partner portal by clicking a link or passing a partner ID | Enforce server-side session authentication with role checks; verify `user.partner_id == requested_id`. |
| **Plaintext / Weak Password Storage** | **Critical** | No passwords stored | Use **Argon2id** password hashing (`pwdlib[argon2]`) with strict salt and iteration parameters. |
| **Session Hijacking / XSS Theft** | **High** | N/A (State is ephemeral) | Use **HttpOnly**, **SameSite=Lax** cookies for session tokens. No tokens stored in `localStorage`. |
| **Brute Force Authentication** | **Medium** | None | Implement in-memory IP/email rate limiting on `POST /api/auth/login` (5 attempts per 60 seconds). |
| **CSRF Attacks** | **Medium** | N/A | SameSite=Lax cookie attribute, custom headers, and server-side state mutation token validation. |
| **Open Redirect Vulnerability** | **Low** | N/A | Validate internal relative paths for post-login redirection; disallow arbitrary external URLs. |

---

## 9. Migration & Preservation Strategy

1. **Database Safety First:**
   - Execute a complete backup: `backend/regive.db` -> `backend/regive.db.backup`.
   - Never run `DROP TABLE` on business entities (`donors`, `partners`, `donations`, `ai_analyses`).
2. **Backward-Compatible Seeding:**
   - Create 4 synthetic university demonstration donors (`ananya@regive.test`, `rahul@regive.test`, `priya@regive.test`, `arjun@regive.test`).
   - Create 10 demonstration NGOs (`annapoorna@regive.test`, `hope@regive.test`, etc.).
   - Link existing recycler accounts (`gokul@regive.test`, `greenearth@regive.test`, etc.).
   - Link legacy donor `usr-elena-01` (`elena.rostova@university.edu`) to an authentication account so historic donations remain accessible.
3. **Local Credential Storage:**
   - Output all generated demonstration credentials to `backend/data/demo_credentials.json` and `docs/DEMO_ACCOUNT_SETUP.md`.
   - Ensure `demo_credentials.json` is added to `.gitignore`.

---

## 10. Phased Implementation Sequence

```
PHASE 00: Architecture Audit (Complete - docs/AUTHENTICATION_ARCHITECTURE_AUDIT.md)
   ↓
PHASE 01: Database Preparation (Backup, User/Session Models, Migrations)
   ↓
PHASE 02: Backend Authentication (FastAPI Auth Router, Argon2id, Sessions, Rate Limiter)
   ↓
PHASE 03: Demonstration Account Seeder (4 Donors, 10 NGOs, Linked Recyclers)
   ↓
PHASE 04: Login UI Implementation (Unified Responsive Login Screen)
   ↓
PHASE 05: Frontend Auth Integration (AuthContext, ProtectedRoute, Dynamic Headers)
   ↓
PHASE 06: Landing Page Guards & CTA Preservation (ReturnURL Redirection)
   ↓
PHASE 07: Purge Hardcoded Identities & Account-Switching Footprints
   ↓
PHASE 08: Backend Role-Based Access Control & Ownership Enforcement
   ↓
PHASE 09: End-to-End Testing (12 Mandatory Verification Tests & Report)
```

---

*Phase 00 Audit formally concluded with zero destructive modifications to existing code or SQLite tables.*
