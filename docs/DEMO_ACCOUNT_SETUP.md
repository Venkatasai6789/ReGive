# ReGiVe Platform — Demonstration Account Setup & Credential Directory
## Multi-Account Authentication Guide

**Document Version:** 1.0.0  
**Environment:** Local Development & Academic Demonstration Review  
**Date:** 7 November 2026  
**Security Notice:** All accounts listed below utilize synthetic demonstration identities under the RFC 2606 reserved `.test` domain. Plaintext credentials are for local academic evaluation only and are never exposed via API responses.

---

## 1. Quick Access Credential Directory

All accounts sign in through the **single shared login page** (`/login` or clicking **Log In** on the top navigation bar).  
The backend automatically resolves the user's role from SQLite and redirects them to their authorized interface.

### 1.1 Donor Accounts (4 Synthetically Generated + 1 Legacy Preserved)

| Full Name | Role | Email | Password | Profile Type | Location |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Ananya Sharma** | `donor` | `ananya@regive.test` | `ReGive2026@Ananya!` | Household | Chennai, TN |
| **Rahul Verma** | `donor` | `rahul@regive.test` | `ReGive2026@Rahul!` | Individual | Madurai, TN |
| **Priya Nair** | `donor` | `priya@regive.test` | `ReGive2026@Priya!` | Household | Coimbatore, TN |
| **Arjun Reddy** | `donor` | `arjun@regive.test` | `ReGive2026@Arjun!` | Restaurant | Pudukkottai, TN |
| **Elena Rostova** | `donor` | `elena.rostova@university.edu` | `ReGive2026@Elena!` | University | Central Quarter |

---

### 1.2 NGO Accounts (10 Synthetically Generated Food Rescue Organizations)

| Organization Name | Role | Org Type | Email | Password | Location |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Annapoorna Trust** | `ngo` | Food Bank | `annapoorna@regive.test` | `ReGive2026@Annapoorna!` | Alwarpet, Chennai |
| **Hope Night Shelter** | `ngo` | Shelter | `hope@regive.test` | `ReGive2026@Hope!` | Egmore, Chennai |
| **Bright Future Community Kitchen** | `ngo` | Community Kitchen | `brightfuture@regive.test` | `ReGive2026@Bright!` | Triplicane, Chennai |
| **Sunrise Food Foundation** | `ngo` | Food Bank | `sunrise@regive.test` | `ReGive2026@Sunrise!` | Besant Nagar, Chennai |
| **Green Basket Foundation** | `ngo` | Food NGO | `greenbasket@regive.test` | `ReGive2026@Green!` | Tambaram, Chennai |
| **Helping Hands Nutrition Centre** | `ngo` | Community Kitchen | `helpinghands@regive.test` | `ReGive2026@Helping!` | Poonamallee, Chennai |
| **City Harvest Rescue** | `ngo` | Food Bank | `cityharvest@regive.test` | `ReGive2026@City!` | Royapuram, Chennai |
| **CareBridge Shelter** | `ngo` | Shelter | `carebridge@regive.test` | `ReGive2026@CareBridge!` | Velachery, Chennai |
| **Rural Nourishment Network** | `ngo` | Food NGO | `ruralnourish@regive.test` | `ReGive2026@Rural!` | Madhavaram, Chennai |
| **People's Meal Initiative** | `ngo` | Community Kitchen | `peoplesmeal@regive.test` | `ReGive2026@Peoples!` | Kodambakkam, Chennai |

---

### 1.3 Recycler Accounts (Preserved Organic Recovery Streams)

| Organization Name | Role | Recovery Stream | Email | Password | Location |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Gokul Goshala Animal Feed** | `recycler` | Animal Feed | `gokul@regive.test` | `ReGive2026@Gokul!` | Madurai Highway |
| **Happy Paws Animal Shelter** | `recycler` | Animal Feed | `happypaws@regive.test` | `ReGive2026@Happy!` | OMR Corridor |
| **Green Earth Composters** | `recycler` | Organic Compost | `greenearth@regive.test` | `ReGive2026@Green!` | Ambattur Industrial |
| **Vermi Farm Co-op** | `recycler` | Organic Compost | `vermifarm@regive.test` | `ReGive2026@Vermi!` | Chengalpattu Outskirts |
| **BioGas Energy Plant** | `recycler` | Biogas Energy | `biogas@regive.test` | `ReGive2026@BioGas!` | Sriperumbudur Hub |
| **Rural Biogas Community Unit** | `recycler` | Biogas Energy | `ruralbiogas@regive.test` | `ReGive2026@Rural!` | Kanchipuram Belt |

---

### 1.4 Administrator Account

| Display Name | Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Platform Administrator** | `admin` | `admin@regive.test` | `ReGive2026@SuperAdmin!` | Platform Governance & System Audit |

---

## 2. Password & Cryptography Standards

1. **Hashing Algorithm:** Argon2id (`argon2id$v=19$m=65536,t=3,p=4`) via `pwdlib`.
2. **Session Identification:** Cryptographically secure 256-bit entropy tokens (`secrets.token_hex(32)`) stored in `user_sessions`.
3. **Cookie Attributes:** `HttpOnly`, `SameSite=Lax`, `Path=/`, `Max-Age=604800` (7 days).
4. **Brute Force Protection:** In-memory rate limiting rejects IP clients after 5 failed attempts within 60 seconds (HTTP 429).

---

## 3. How to Re-Run the Seeder

The seeding script is completely idempotent:
```bash
python backend/scripts/seed_demo_accounts.py
```
It safely creates any missing accounts, preserves existing records, updates passwords if needed, and regenerates the FAISS vector index.
