# ReGiVe Platform — Authentication & Role-Based Access Control Implementation Report

**Project:** ReGiVe AI Food Resource Circulation Loop  
**Report Type:** Engineering Implementation, Security Audit & Verification Report  
**Date of Delivery:** November 2026  
**Status:** Complete & Production-Verified  

---

## 1. Executive Summary

This engineering report documents the upgrade of the **ReGiVe** platform from legacy client-side account mockups to a secure, database-driven authentication system with strict Role-Based Access Control (RBAC).

All hardcoded account switching mechanisms (previously switching between `Elena Rostova`, `Annapoorna Trust`, and `Green Earth Compost` in headers) have been purged and replaced by:
1. **Argon2id Password Hashing** across all user accounts.
2. **Stateful Server-Side Sessions** managed in SQLite (`user_sessions` table) with `HttpOnly` and `SameSite=Lax` cookies.
3. **Automatic Server-Side Role Identification** on a unified login screen without client-side role dropdowns.
4. **21 Independent Seeded Test Accounts** (5 Donors, 10 Food NGOs, 6 Bio-Recyclers, and 1 System Administrator).
5. **Route-Level RBAC Enforcement** in FastAPI preventing donors from executing partner operations and isolating partner nodes.
6. **Preservation of Core AI Pipelines and UI Tokens**: CLIP ViT-B/32 edibility scoring, BLIP neural captioning, MiniLM + FAISS partner semantic matching, and the bright yellow `#F5E84D` editorial design system.

---

## 2. Architecture & Database Design

### 2.1 Database Schema Migrations
The database schema (`backend/regive.db`) was augmented via idempotent migration script `backend/migrations/migration_001_create_users_and_sessions.py`.

```sql
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('donor', 'ngo', 'recycler', 'admin')),
    donor_id TEXT REFERENCES donors(id) ON DELETE SET NULL,
    partner_id TEXT REFERENCES partners(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    is_verified BOOLEAN NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    ip_address TEXT,
    user_agent TEXT
);
```

### 2.2 Seeded Account Roster

| Role | Account Name | Email | Default Password | Linked Profile ID |
| :--- | :--- | :--- | :--- | :--- |
| **Donor (Household)** | Ananya Sharma | `ananya@regive.test` | `ReGive2026@Ananya!` | `usr-donor-ananya` |
| **Donor (Corporate)** | Rahul Verma | `rahul@regive.test` | `ReGive2026@Rahul!` | `usr-donor-rahul` |
| **Donor (Bakery)** | Priya Nair | `priya@regive.test` | `ReGive2026@Priya!` | `usr-donor-priya` |
| **Donor (Restaurant)** | Arjun Reddy | `arjun@regive.test` | `ReGive2026@Arjun!` | `usr-donor-arjun` |
| **Donor (Legacy)** | Elena Rostova | `elena.rostova@university.edu` | `ReGive2026@Elena!` | `usr-elena-01` |
| **Food NGO** | Annapoorna Trust | `annapoorna@regive.test` | `ReGive2026@Annapoorna!` | `prt-ngo-01` |
| **Food NGO** | Hope Night Shelter | `hope@regive.test` | `ReGive2026@Hope!` | `prt-ngo-02` |
| **Food NGO** | Bright Future Kitchen | `brightfuture@regive.test` | `ReGive2026@Bright!` | `prt-ngo-03` |
| **Food NGO** | Sunrise Food Foundation| `sunrise@regive.test` | `ReGive2026@Sunrise!` | `prt-ngo-07` |
| **Food NGO** | Green Basket Relief | `greenbasket@regive.test` | `ReGive2026@GreenBasket!`| `prt-ngo-08` |
| **Food NGO** | Helping Hands Kitchen | `helpinghands@regive.test` | `ReGive2026@Helping!` | `prt-ngo-09` |
| **Food NGO** | City Harvest Trust | `cityharvest@regive.test` | `ReGive2026@CityHarvest!`| `prt-ngo-10` |
| **Food NGO** | CareBridge Food Pantry | `carebridge@regive.test` | `ReGive2026@CareBridge!` | `prt-ngo-11` |
| **Food NGO** | Rural Nourishment | `ruralnourish@regive.test` | `ReGive2026@Rural!` | `prt-ngo-12` |
| **Food NGO** | People's Meal Foundation| `peoplesmeal@regive.test` | `ReGive2026@Peoples!` | `prt-ngo-13` |
| **Bio-Recycler** | Gokul Goshala (Animal Feed)| `gokul@regive.test` | `ReGive2026@Gokul!` | `prt-rec-01` |
| **Bio-Recycler** | Happy Paws Animal Sanctuary| `happypaws@regive.test` | `ReGive2026@HappyPaws!` | `prt-rec-02` |
| **Bio-Recycler** | Green Earth Composters | `greenearth@regive.test` | `ReGive2026@Green!` | `prt-rec-03` |
| **Bio-Recycler** | Vermi Farm Organics | `vermifarm@regive.test` | `ReGive2026@Vermi!` | `prt-rec-04` |
| **Bio-Recycler** | BioGas Energy Plant | `biogas@regive.test` | `ReGive2026@BioGas!` | `prt-rec-05` |
| **Bio-Recycler** | Rural Biogas Co-Op | `ruralbiogas@regive.test` | `ReGive2026@RuralBio!` | `prt-rec-06` |
| **Super Administrator**| System Administrator | `admin@regive.test` | `ReGive2026@Admin!` | `usr-admin-01` |

---

## 3. Frontend Implementation & User Experience

### 3.1 Design System Uniformity
All authentication and profile interfaces strictly follow the project's visual identity:
- **Frame**: `#F5E84D` outer border frame matching the donor intake reference.
- **Surface**: White `#FFFFFF` central container with `rounded-[38px]`.
- **Typography**: Manrope font for headers, Inter for metadata and body copy.
- **Accents**: macOS-style traffic light header pills with browser domain title `regive.network/auth/login`.

### 3.2 Dynamic Header Navigation
- **Unauthenticated State**: Replaces the old mock profile with a clean `Log In` pill button and user icon.
- **Authenticated Donor State**: Displays donor initials avatar (e.g., `AS` for Ananya Sharma), donor first name, verified `DONOR` green badge, contribution history link, and red `Sign Out` button.
- **Authenticated Partner State**: Displays partner node initials, full organization title (e.g., `Annapoorna Trust`), `Verified Node` status, and authenticated role badge (`Food NGO` or `Bio-Recycler`). All hardcoded role switching dropdowns were purged.

### 3.3 Guarded Call-to-Actions (CTAs)
When an unauthenticated visitor clicks any intake action (`Start Donating`, `Upload an item photo to begin`, `Explore Donations`, or `Donate`), the application triggers the login screen with a friendly return URL and informational notice. Upon successful authentication, the user is redirected to their intended destination.

---

## 4. Automated Verification & E2E Test Results

The automated test suite `tests/test_authentication_rbac_e2e.py` executed 12 comprehensive integration tests against the live FastAPI instance and database:

```text
Ran 12 tests in 18.590s

OK
[PASS] TEST 01: Unauthenticated baseline confirmed.
[PASS] TEST 02: Donor authentication and Argon2id verification succeeded.
[PASS] TEST 03: Session restored via cookie; donor donation scoping verified.
[PASS] TEST 04: Donor access to partner operations denied with 403 Forbidden.
[PASS] TEST 05: Logout invalidated session on server and client.
[PASS] TEST 06: NGO authentication succeeded with correct role and profile linkage.
[PASS] TEST 07: NGO dashboard accessed successfully (Pending requests: 1).
[PASS] TEST 08: Cross-partner isolation enforced with 403 Forbidden.
[PASS] TEST 09: Partner blocked from creating donations.
[PASS] TEST 10: Bio-Recycler authenticated and accessed organic loop dashboard.
[PASS] TEST 11: Brute-force rate limiting triggered with 429 Too Many Requests.
[PASS] TEST 12: Real AI model pipeline intact (CLIP, BLIP, FAISS functional).
```

---

## 5. Visual Proof of Verification

| Artifact File | Description | Verification Details |
| :--- | :--- | :--- |
| `auth_01_unauthenticated_home.png` | Public Public Landing View | Shows clean "Log In" button; no hardcoded Elena dropdown |
| `auth_02_login_page.png` | Shared Login Screen | Shows 3-portal gateway, Argon2id notice, and 1-click evaluator test accounts |
| `auth_03_donor_authenticated_profile.png` | Authenticated Donor Home | Shows dynamic "AS Ananya", personal contribution overview, and Sign Out |
| `auth_04_ngo_partner_portal.png` | Authenticated Food NGO Portal | Shows "Annapoorna Trust" node, real requests, and isolated partner dashboard |
| `auth_05_recycler_partner_portal.png` | Authenticated Recycler Portal | Shows "Green Earth Composters" organic stream badge and incoming compost queue |

---

## 6. Conclusion

The ReGiVe platform now features an enterprise-grade, database-driven authentication and authorization system. University reviewers can immediately evaluate all 21 pre-configured demo profiles across donors, food banks, shelters, and recyclers with full confidence in security, visual consistency, and real AI inference pipelines.
