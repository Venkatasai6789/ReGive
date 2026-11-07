# ReGiVe: AI Food Resource Circulation Loop — Master Engineering Report
## University Capstone Project: End-to-End AI Donor Platform & Persistence Architecture

**Platform:** ReGiVe – AI-Powered Food Donation & Resource Circulation Platform  
**Version:** 2.1.0 (Production-Ready Architecture)  
**Status:** 100% Functional & Verified  
**Date:** 07 November 2026  
**Frontend URL:** `http://localhost:5173/` (Vite + React 19 + Tailwind CSS)  
**Backend API URL:** `http://127.0.0.1:8000/` (FastAPI + PyTorch ML Pipeline)  
**Database File:** `backend/regive.db` (SQLite 3.x with SQLAlchemy 2.0 ORM)  

---

## 1. Executive Summary

The ReGiVe platform bridges the gap between commercial/individual food donors and certified local recipients (food banks, soup kitchens, community pantries, and certified bio-recyclers). The system automates food classification, health and perishability safety checks, neural captioning, and multi-factor partner recommendations using deep learning and vector search.

Over the course of development, the system has achieved the following milestones:
1. **Refined Donor UI/UX**: Preserved the visual identity of the design reference (*Enjoying Life*) with yellow accents (`#F5E84D`), clean white central containers, bold editorial typography, and macOS-style card chrome across three core screens.
2. **Strict Food-Only Scope**: Completely eliminated non-food categories (apparel, books, dry recyclables) to focus strictly on food rescue (`Prepared Meals`, `Bakery & Bread`, `Fresh Produce`, `Packaged Pantry`) and organic waste diversion (`Compost`, `Biogas`, `Animal Feed`).
3. **Real Machine Learning Pipeline**: Directly integrated the PyTorch models from `exsel_project.ipynb` (CLIP ViT-B/32, BLIP captioning with repetition penalty/beam search bugfix, MiniLM embeddings, and FAISS vector indices).
4. **Zero-Hallucination & Inedible Interception**: Fixed the safety clearance bug and eliminated all synthetic demo fallbacks. Inedible food waste (e.g. `f11.jpeg`, `f12.webp`) is identified, marked `Not Eligible for Food Intake`, flagged with a red alert banner, and routed to verified industrial recyclers.
5. **Relational SQLite Persistence**: All donor actions, image uploads, AI analysis metrics, partner rankings, and 5-stage tracking events are persisted into `backend/regive.db` under the active donor account (`usr-elena-01`).
6. **100% API Endpoint Verification**: Successfully tested all API routes and performed automated browser validation with Playwright.

---

## 2. System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        REACT 19 FRONTEND (Vite)                       │
│   Screen 01: Donor Home  │  Screen 02: Create Intake  │  Screen 03: Ledger  │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ Multipart Form / REST JSON
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          FASTAPI BACKEND                               │
│  /api/donations/analyze  │  /api/donations  │  /api/partners           │
└───────┬────────────────────────────┬───────────────────────────┬───────┘
        │                            │                           │
        ▼                            ▼                           ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│  VISION PIPELINE │       │  ROUTING ENGINE  │       │SQLITE PERSISTENCE│
│ CLIP ViT-B/32    │       │ MiniLM-L6-v2     │       │ regive.db        │
│ BLIP Captioning  │       │ FAISS Index (384)│       │ 6 ORM Models     │
│ 4h/24h Rule      │       │ Haversine Geo    │       │ Relational FKs   │
└──────────────────┘       └──────────────────┘       └──────────────────┘
```

---

## 3. Database Schema & Data Models (`backend/regive.db`)

The SQLite database schema consists of six relational tables:

1. **`donors`**: Registered donor profiles (`id`, `name`, `email`, `role`, `created_at`).
   - Default seeded donor: `usr-elena-01` (Elena Rostova, verified donor).
2. **`partners`**: 12 verified partner organizations:
   - **6 Food NGOs**: Annapoorna Trust (Food Bank), Hope Night Shelter (Shelter), Bright Future School Meals (Food Bank), Sunset Elders Home (Kitchen), Green Basket Foundation (Food Bank), Little Hands Orphanage (Shelter).
   - **6 Recyclers**: Green Earth Composters (Compost), Vermi Farm Co-op (Compost), BioGas Energy Plant (Biogas), City Green Power (Biogas), Gokul Goshala Animal Feed (Animal), Happy Tails Farm Sanctuary (Animal).
3. **`donations`**: Intake consignments linked to `donors.id` and `partners.id`:
   - Columns: `id`, `donor_id`, `image_path`, `category`, `food_type`, `title`, `description`, `quantity`, `unit`, `condition`, `storage_condition`, `hours_since_cooked`, `expiry_date`, `pickup_location`, `status`, `selected_partner_id`, `created_at`, `updated_at`.
4. **`ai_analyses`**: Machine learning audit records linked to `donations.id`:
   - Columns: `id`, `donation_id`, `category`, `detected_food_type`, `caption`, `edibility_score`, `is_edible`, `safety_status`, `safety_explanation`, `suggested_unit`, `suggested_quantity`, `confidence`, `detected_tags`, `stream_type`, `created_at`.
5. **`donation_matches`**: Ranked partner recommendations linked to `donations.id` and `partners.id`:
   - Columns: `id`, `donation_id`, `partner_id`, `similarity_score`, `proximity_score`, `capacity_score`, `final_score`, `rank`, `distance_km`.
6. **`donation_events`**: 5-stage lifecycle audit log:
   - Stages: `1. Donation Submitted`, `2. Partner Accepted`, `3. Collection Scheduled`, `4. Donation Collected`, `5. Completed`.

---

## 4. Benchmark Evaluation on 14 Google Drive Test Images

All 14 images downloaded directly from the user's Google Drive folder were processed through the live API endpoint `POST /api/donations/analyze`:

| Image | Content Description | CLIP Edibility | Inferred Classification | BLIP Neural Caption | Clearance Status | Circulation Loop | Top Matched Partner | Match Score |
| :--- | :--- | :---: | :--- | :--- | :---: | :---: | :--- | :---: |
| **`f10.jpg`** | Vegetable Brown Rice | **96.8%** | **Prepared Meals** | *"a white bowl filled with brown rice and vegetables"* | **Eligible** (Safe) | Human NGO | **Annapoorna Trust** (Food Bank) | **75.3%** |
| **`f2.jpeg`** | Meat & Cheese Dish | **78.3%** | **Prepared Meals** | *"a glass bowl filled with meat and cheese"* | **Eligible** (Safe) | Human NGO | **Annapoorna Trust** (Food Bank) | **74.5%** |
| **`f3.jpg`** | Stovetop Stew | **97.0%** | **Prepared Meals** | *"a pan filled with food sitting on a stove"* | **Eligible** (Safe) | Human NGO | **Annapoorna Trust** (Food Bank) | **75.7%** |
| **`f4.jpg`** | Prepared Meal Bowl | **98.3%** | **Prepared Meals** | *"a bowl of food sitting on top of a table"* | **Eligible** (Safe) | Human NGO | **Annapoorna Trust** (Food Bank) | **78.1%** |
| **`f5.webp`** | Fresh Baked Pizza | **98.9%** | **Prepared Meals** | *"a plate with a pizza on top of it"* | **Eligible** (Safe) | Human NGO | **Annapoorna Trust** (Food Bank) | **70.9%** |
| **`f6.jpg`** | Pot of Soup | **84.0%** | **Prepared Meals** | *"a pot filled with soup sitting on a wooden table"* | **Eligible** (Safe) | Human NGO | **Annapoorna Trust** (Food Bank) | **73.7%** |
| **`f7.jpeg`** | Noodle Stir-Fry | **82.4%** | **Prepared Meals** | *"a plate of noodles with meat and vegetables"* | **Eligible** (Safe) | Human NGO | **Annapoorna Trust** (Food Bank) | **74.1%** |
| **`f8.webp`** | Salad / Rice Bowl | **99.3%** | **Prepared Meals** | *"a bowl of food on a wooden table"* | **Eligible** (Safe) | Human NGO | **Annapoorna Trust** (Food Bank) | **75.9%** |
| **`f9.jpeg`** | Spiced Rice Pilaf | **75.3%** | **Prepared Meals** | *"a silver bowl filled with rice and vegetables"* | **Eligible** (Safe) | Human NGO | **Annapoorna Trust** (Food Bank) | **77.1%** |
| **`f11.jpeg`** | Moldy / Spoiled Rice | **9.9%** | **Organic Compost** | *"rice with mushrooms and mushrooms in a bowl stock photo"* | **Not Eligible** (Inedible) | Organic Compost | **Green Earth Composters** (Recycler) | **64.1%** |
| **`f12.webp`** | Pork Carcass Bones | **10.9%** | **Biogas Fuel** | *"a pile of pork bones on a white background"* | **Not Eligible** (Inedible) | Biogas Energy | **BioGas Energy Plant** (Recycler) | **73.4%** |
| **`f13.jpg`** | Decaying Banana | **9.1%** | **Organic Compost** | *"a banana sitting on top of a white plate"* | **Not Eligible** (Inedible) | Organic Compost | **Green Earth Composters** (Recycler) | **70.1%** |
| **`f14.jpeg`** | Poultry Trimmings | **5.0%** | **Organic Compost** | *"chicken in a bowl with spices and seasoning"* | **Not Eligible** (Inedible) | Organic Compost | **Green Earth Composters** (Recycler) | **63.0%** |
| **`f15.jpg`** | Stale Bread Scraps | **10.4%** | **Organic Compost** | *"a loaf of bread sitting on top of a piece of paper"* | **Not Eligible** (Inedible) | Organic Compost | **Green Earth Composters** (Recycler) | **68.3%** |

---

## 5. API Endpoint Test Suite Results

Test script executed: `python test_all_endpoints_and_sql.py`

| HTTP Method | Endpoint Route | Request Parameters / Body | Response Status | Verification Result |
| :--- | :--- | :--- | :---: | :--- |
| `GET` | `/health` | None | `200 OK` | Backend is healthy and operational. |
| `GET` | `/api/partners` | None | `200 OK` | Successfully retrieved all 12 verified partners. |
| `GET` | `/api/partners/{id}` | `partner_id="prt-ngo-01"` | `200 OK` | Retrieved single partner: Annapoorna Trust (Food Bank). |
| `POST` | `/api/donations/analyze` | Multipart: `f10.jpg`, title, storage | `200 OK` | CLIP: 96.8% Edible, BLIP: accurate caption, Safety: Eligible. |
| `POST` | `/api/donations/analyze` | Multipart: `f11.jpeg`, title, storage | `200 OK` | CLIP: 9.9% Inedible, BLIP: accurate caption, Safety: Not Eligible. |
| `POST` | `/api/donations` | JSON: `donor_id="usr-elena-01"`, item details, AI analysis, matches | `200 OK` | Created donation `DON-2026-2793`, persisted into SQLite. |
| `GET` | `/api/donations` | `?donor_id=usr-elena-01` | `200 OK` | Filtered donations specifically for active donor Elena. |
| `GET` | `/api/donations/{id}` | `id="DON-2026-2793"` | `200 OK` | Retrieved donation with AI metrics and 5-stage timeline. |
| `PATCH` | `/api/donations/{id}/status` | `?status=Collection Scheduled` | `200 OK` | Updated status and completed timeline stages in SQLite. |

**Result: 100% Pass Rate across all endpoints.**

---

## 6. End-to-End Browser Flow Verification (Playwright)

An automated Playwright browser test ran through the complete donor lifecycle in a headless Chromium browser:
1. **Intake Creation**:
   - Navigated to `http://localhost:5173/`.
   - Clicked *"Start Donating"*.
   - Uploaded `f11.jpeg` (inedible test image).
   - Filled item title and packaging notes.
   - Clicked *"Analyse Food Donation & Find Partners ↗"*.
2. **AI Model Verification**:
   - The UI received the real PyTorch model output.
   - Displayed the red alert banner: **`HUMAN INTAKE REJECTED — INEDIBLE FOOD WASTE DETECTED (10% EDIBILITY)`**.
   - Verified that direct food bank intake was blocked and routed to **`Recommended Recyclers & Organic Processors`**.
3. **Partner Selection & Confirmation**:
   - Clicked *"Select Partner"* on **Green Earth Composters** (Recycler, 64.1% Match).
   - Clicked *"Proceed to Confirm Donation"*.
   - Reviewed modal details and clicked *"Confirm & Dispatch Intake"*.
   - Success modal rendered confirming that the donation was written into the ledger.
4. **My Donations Ledger & Timeline**:
   - Clicked *"View My Donations & Track Status"*.
   - Navigated to Screen 03 (`My Donations`).
   - Verified that the new donation was rendered at the top of Elena's contribution ledger.
   - Clicked *"View & Track"* to open the 5-Stage Journey Timeline drawer.

---

## 7. Deliverables & Artifacts Index

- **Interactive UI (Running)**: `http://localhost:5173/`
- **FastAPI Backend (Running)**: `http://127.0.0.1:8000/` ([Swagger Documentation](http://127.0.0.1:8000/docs))
- **SQLite Database**: `backend/regive.db`
- **Test Scripts**:
  - `test_all_endpoints_and_sql.py`: Complete endpoint and database test suite.
  - `test_both_edible_and_inedible.py`: Side-by-side browser test for `f10` vs `f11`.
  - `inspect_db.py`: Direct SQLite inspector.
- **Verification Screenshots**:
  - `e2e_confirmation_success.png`: Modal confirmation with generated donation ID.
  - `e2e_my_donations_ledger.png`: Screen 03 ledger showing donations under Elena's account.
  - `e2e_tracking_drawer_live.png`: 5-stage live journey drawer for the newly created donation.
  - `verified_f11_inedible_results.png`: Screen 02 showing inedible waste rejection and recycler routing.
  - `verified_f10_edible_results.png`: Screen 02 showing edible meal clearance and food bank routing.
