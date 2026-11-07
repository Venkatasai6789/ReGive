# ReGiVe Master Implementation Plan & Execution Roadmap
**Document ID:** `docs/IMPLEMENTATION_PLAN.md`  
**Date:** November 2026  
**Auditor & Lead Architect:** Senior Full-Stack Software Architect & Engineering Lead  

---

## 1. Roadmap Overview & Execution Sequence

The engineering execution is structured into 7 sequential phases (Phase 00 through Phase 06). Each phase produces verified deliverables and must satisfy strict acceptance criteria before proceeding.

```
┌─────────────────────────────────────────────────────────────────────────┐
│ PHASE 00: Project Audit, Notebook Extraction & Architecture Docs (DONE) │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ PHASE 01: Donor UI Refinement & Form Layout Tuning                      │
│ - Grid balance: 40% left (image), 60% right (form)                      │
│ - Category-specific AI capability messaging                             │
│ - Responsive layout verification                                        │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ PHASE 02: SQLite & FastAPI Backend Foundation                           │
│ - SQLite engine initialization (`regive.db`)                            │
│ - SQLAlchemy models (Donors, Donations, AIAnalysis, Partners, etc.)     │
│ - Database migration & partner seeding script                           │
│ - Health check & base REST endpoints                                    │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ PHASE 03: ML Pipeline Extraction & Optimization                         │
│ - Singleton model cache loader (CLIP, BLIP, MiniLM, FAISS)              │
│ - Exact candidate prompts, hypothesis templates, & classification logic │
│ - Fix BLIP `f10.jpg` caption repetition defect                          │
│ - Food safety rules engine implementation                               │
│ - Partner ranking formulas (NGO & Recycler)                             │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ PHASE 04: Backend & Model Integration                                   │
│ - Implementation of `POST /api/donations/analyze`                       │
│ - Multipart form & binary image BLOB ingestion                          │
│ - AI telemetry persistence in `ai_analyses`                             │
│ - Partner ranking calculation & persistence in `donation_matches`       │
│ - Implementation of confirmation & timeline endpoints                   │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ PHASE 05: Frontend-Backend Integration                                  │
│ - Centralized API client service (`src/services/apiClient.ts`)          │
│ - Connect `CreateDonation.tsx` to `/api/donations/analyze`              │
│ - Connect `MyDonations.tsx` to `/api/donations` and image streaming     │
│ - Connect `DonorHome.tsx` to backend account statistics                 │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ PHASE 06: End-to-End Verification & Test Report                         │
│ - Automated test suite evaluating `f1.jpg`–`f15.jpg` test cases         │
│ - Verification of `f10.jpg` repetition fix and `f13.jpg` review flag    │
│ - Database restart & persistence verification                           │
│ - Cross-browser & responsive verification                               │
│ - Generation of `docs/TEST_REPORT.md`                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Phase-by-Phase Work Breakdown

### Phase 01: Donor UI Refinement
- **Scope:**
  - Adjust grid proportions on Screen 02 (`CreateDonation.tsx`): Left column `lg:col-span-5` (approx 40%), Right column `lg:col-span-7` (approx 60%).
  - Ensure all form controls have proper accessible labels, semantic attributes, and error boundaries.
  - Implement transparent category-specific capability messaging: clearly show that the active AI classification pipeline is specialized for Food donations, while non-food donations (Clothing, Books, Recyclables) are flagged for verified partner manual review.
  - Verify equal-height card layouts on Screen 01 and Screen 03.
- **Verification:** Browser inspection across desktop (1440px), tablet (768px), and mobile (390px).

### Phase 02: SQLite & FastAPI Backend Foundation
- **Scope:**
  - Initialize `backend/` directory structure.
  - Configure `backend/config.py` (CORS settings, database URL `sqlite:///./regive.db`, upload limits).
  - Implement SQLAlchemy 2.0 ORM models in `backend/database/models.py`.
  - Create session manager and database initialization routine in `backend/database/session.py`.
  - Create database seeder (`backend/database/seed.py`) to insert the registered donor (`usr-elena-01`), 6 NGOs, and 6 Recyclers from `exsel_project.ipynb`.
  - Implement FastAPI app with CORS middleware in `backend/main.py`.
  - Implement `/api/health` and basic CRUD routes in `backend/routers/donations.py`.
- **Verification:** Python unit tests testing table creation, seed execution, and basic CRUD responses.

### Phase 03: ML Pipeline Extraction & Optimization
- **Scope:**
  - Create `backend/ai/model_loader.py`: Implements thread-safe singleton loading of CLIP, BLIP, MiniLM, and FAISS indexes on startup.
  - Create `backend/ai/classifier.py`: Ports CLIP edibility (prompts, template, 0.5 threshold, 0.35–0.65 uncertainty flag), non-edible stream routing, and food category sub-labeling.
  - Create `backend/ai/captioner.py`: Ports BLIP caption generator with `no_repeat_ngram_size=2`, repetition penalty, and fallback validation to eliminate the `f10.jpg` bug.
  - Create `backend/ai/safety.py`: Implements deterministic Python food safety checks (cooked food at room temp > 4h, fridge > 24h, sealed packs).
  - Create `backend/ai/matcher.py`: Builds FAISS indexes with `IndexFlatIP(384)`, implements Haversine calculations, and computes NGO and Recycler multi-factor ranking scores.
- **Verification:** Standalone test script executing the pipeline on sample inputs and asserting exact score and label matching.

### Phase 04: Backend & Model Integration
- **Scope:**
  - Wire `POST /api/donations/analyze`:
    - Reads uploaded image into PIL Image and raw bytes for `image_blob`.
    - Generates unique ID (`DON-2026-XXXX`).
    - Executes AI classification, BLIP captioning, safety validation, and partner matching.
    - Saves donation draft, image BLOB, AI analysis telemetry, and ranked partner matches in SQLite within a single atomic transaction.
    - Returns structured JSON to the frontend.
  - Wire `GET /api/donations/{id}/image`: Streams stored BLOB with appropriate image MIME type header.
  - Wire `POST /api/donations/{id}/confirm`: Updates status to `SUBMITTED`, locks selected partner, records `donation_events` timeline entry.
  - Wire `GET /api/donations`: Implements tab filtering (`all`, `awaiting`, `scheduled`, `completed`), category filtering, and keyword search over database records.
- **Verification:** Integration tests submitting multipart form payloads via `httpx` or `requests` and validating database records.

### Phase 05: Frontend-Backend Integration
- **Scope:**
  - Create `src/services/apiClient.ts` as the central HTTP client using `fetch` with error interception.
  - Replace mock calls in `CreateDonation.tsx` with live `POST /api/donations/analyze`.
  - Connect partner selection and confirmation dialog to `POST /api/donations/{id}/confirm`.
  - Update `MyDonations.tsx` to fetch records from `GET /api/donations` and point image tags to `/api/donations/{id}/image`.
  - Update `DonorHome.tsx` to derive overview counts and recent donations directly from the live database.
- **Verification:** End-to-end browser user journey from file upload through AI analysis, partner selection, confirmation, and live display in My Donations.

### Phase 06: End-to-End Verification & Test Report
- **Scope:**
  - Execute automated QA test harness using notebook sample scenarios (`f1.jpg`–`f15.jpg` simulation).
  - Assert that `f10.jpg` generates clean, non-repetitive captions.
  - Assert that `f13.jpg` (banana) triggers the `needs_review = True` warning.
  - Assert that food items exceeding 4 hours at room temperature are diverted to compost.
  - Verify data persistence by restarting backend and reloading frontend.
  - Document all test results, performance metrics, and verified limitations in `docs/TEST_REPORT.md`.

---

## 3. Risk Assessment & Mitigation Strategies

| Risk | Severity | Mitigation Strategy |
|---|---|---|
| **Cold-Start Model Latency** | Moderate | Preload and warm all ML checkpoints into memory during FastAPI startup (`@asynccontextmanager`). Per-request inference is fast (~1.5s). |
| **Model Weight Download on Startup** | Moderate | Check if weights are cached in Hugging Face cache (`~/.cache/huggingface`); fallback gracefully with structured error message if offline. |
| **BLIP Repetition Degeneracy** | Low | Enforce `no_repeat_ngram_size=2`, `repetition_penalty=1.8`, and maximum length constraints. |
| **Large Image Memory Consumption** | Low | Validate image dimensions and file size ($\le 10$MB); resize to max 1024px before model tensor conversion. |
| **Database Concurrency in SQLite** | Low | Use write-ahead logging (`PRAGMA journal_mode=WAL;`) and scoped session management with automatic rollback on error. |
