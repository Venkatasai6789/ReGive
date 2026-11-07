# ReGiVe Platform — Role & Permission Authorization Matrix

**Platform:** ReGiVe AI Food Resource Circulation Loop  
**Document Classification:** Security & Authorization Architecture Reference  
**Standard:** Enterprise Role-Based Access Control (RBAC)  
**Authentication Type:** Stateful Server-Side Sessions with Argon2id Password Hashing  
**Session Cookie:** `regive_session` (`HttpOnly`, `SameSite=Lax`, 7-day expiration)

---

## 1. Executive Summary

ReGiVe enforces a strict, multi-tiered Role-Based Access Control (RBAC) model across its four primary user roles:
1. **Donor (`donor`)**: Individuals, restaurants, and food establishments offering surplus fresh and prepared food.
2. **Food NGO (`ngo`)**: Community food banks, soup kitchens, and night shelters receiving edible surplus food.
3. **Bio-Recycler (`recycler`)**: Animal feed shelters, organic compost facilities, and biomethanation plants diverting inedible organic food from landfills.
4. **Platform Administrator (`admin`)**: Super-user auditing circulation metrics, partner verification, and system health.

All account roles share a **single unified login page (`/login`)**. The backend automatically detects the account role upon verification and redirects the client without requiring manual client-side role selection.

---

## 2. Role Definition & Profile Linkage

| Role Name | Database Role Value | Profile Entity Linkage | Primary Portal Interface | Default Landing Destination |
| :--- | :--- | :--- | :--- | :--- |
| **Donor** | `donor` | `User.donor_id -> donors.id` | Donor Portal (`/`) | Public Home or Intake (`/create`) |
| **Food NGO** | `ngo` | `User.partner_id -> partners.id` | Partner Portal (`/partner-portal/:id`) | Partner Requests Dashboard |
| **Bio-Recycler**| `recycler` | `User.partner_id -> partners.id` | Partner Portal (`/partner-portal/:id`) | Partner Requests Dashboard |
| **Administrator**| `admin` | System-level admin (`partner_id=NULL, donor_id=NULL`) | Unified Audit View | Platform System Overview |

---

## 3. Comprehensive Permission Matrix

| Capability / API Operation | Unauthenticated | Donor | Food NGO | Bio-Recycler | Admin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **View Public Platform Landing Page** | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| **View Public About & Mission Explainer** | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| **Access Unified Shared Login (`POST /api/auth/login`)** | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| **Check Session Status (`GET /api/auth/status`)** | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| **Fetch Current Profile (`GET /api/auth/me`)** | ❌ 401 | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| **Terminate Session (`POST /api/auth/logout`)** | ❌ 401 | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| **Run Real AI Model Analysis (`POST /api/donations/analyze`)** | ✅ Allow (Intake) | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| **Submit New Food Donation (`POST /api/donations`)** | ❌ 401 (Guarded) | ✅ Allow (Own ID) | ❌ 403 Forbidden | ❌ 403 Forbidden | ✅ Allow |
| **View Personal Donation History (`GET /api/donations`)** | ⚠️ Public Demo | ✅ Scoped (Own ID) | ❌ 403 Forbidden | ❌ 403 Forbidden | ✅ All Records |
| **View Specific Donation Tracking (`GET /api/donations/{id}`)** | ⚠️ Public Demo | ✅ Scoped (Own ID) | ✅ If Assigned | ✅ If Assigned | ✅ Allow |
| **Access NGO Dashboard (`GET /api/partners/{id}/dashboard`)** | ❌ 401 (Guarded) | ❌ 403 Forbidden | ✅ Own Org Only | ❌ 403 (Other Org) | ✅ Allow All |
| **Access Recycler Dashboard (`GET /api/partners/{id}/dashboard`)** | ❌ 401 (Guarded) | ❌ 403 Forbidden | ❌ 403 (Other Org) | ✅ Own Org Only | ✅ Allow All |
| **List Assigned Requests (`GET /api/partners/{id}/donations`)** | ❌ 401 (Guarded) | ❌ 403 Forbidden | ✅ Own Org Only | ✅ Own Org Only | ✅ Allow All |
| **Accept Food Request (`POST /api/partners/{id}/donations/{did}/accept`)** | ❌ 401 (Guarded) | ❌ 403 Forbidden | ✅ Own Org Only | ✅ Own Org Only | ✅ Allow All |
| **Decline Request (`POST /api/partners/{id}/donations/{did}/reject`)** | ❌ 401 (Guarded) | ❌ 403 Forbidden | ✅ Own Org Only | ✅ Own Org Only | ✅ Allow All |
| **Schedule Pickup Slot (`POST /api/partners/{id}/donations/{did}/schedule`)**| ❌ 401 (Guarded) | ❌ 403 Forbidden | ✅ Own Org Only | ✅ Own Org Only | ✅ Allow All |
| **Confirm Transit Collection (`POST /api/partners/{id}/donations/{did}/collect`)**| ❌ 401 (Guarded) | ❌ 403 Forbidden | ✅ Own Org Only | ✅ Own Org Only | ✅ Allow All |
| **Complete Distribution (`POST /api/partners/{id}/donations/{did}/complete`)**| ❌ 401 (Guarded) | ❌ 403 Forbidden | ✅ Own Org Only | ✅ Own Org Only | ✅ Allow All |

---

## 4. Security Enforcement Mechanisms

### 4.1 Argon2id Password Verification
All stored user credentials employ **Argon2id** password hashing (`m=65536, t=3, p=4`), guaranteeing quantum and ASIC resistance while defeating rainbow table attacks through per-record cryptographic salts.

### 4.2 Stateful Session Invalidation
Sessions are stored in the SQLite `user_sessions` table with high-entropy cryptographic hex tokens (32 bytes / 256 bits). Invalidation via `/api/auth/logout` physically sets `is_active = 0` on the server and expires the client cookie (`max-age=0`).

### 4.3 Brute-Force Rate Limiting
Client IP addresses making more than **5 failed consecutive login attempts** within a 60-second sliding window receive an immediate `429 Too Many Requests` response. Successful login clears failed attempt telemetry.

### 4.4 Cross-Organization Isolation
FastAPI route dependency `_verify_partner_access` guarantees that partner nodes cannot query or manipulate records assigned to another partner node, returning `403 Forbidden` if `current_user.partner_id != target_partner_id`.
