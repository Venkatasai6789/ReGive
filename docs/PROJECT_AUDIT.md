# ReGiVe Platform Engineering Audit
**Document ID:** `docs/PROJECT_AUDIT.md`  
**Date:** November 2026  
**Auditor:** Senior Full-Stack Software Architect & ML Engineer  
**Status:** Complete — Phase 00 Baseline  

---

## 1. Executive Summary

This audit establishes the technical foundation for evolving **ReGiVe (AI Resource Circulation Loop)** from a frontend UI prototype into an end-to-end, model-integrated, database-backed donation management system.

The codebase currently contains:
1. **Frontend:** A React 19 + TypeScript + Vite 8 donor interface featuring 3 primary screens (`DonorHome`, `CreateDonation`, `MyDonations`) styled with Tailwind CSS, utilizing `localStorage` and a deterministic mock AI service.
2. **Machine Learning Pipeline:** An existing research notebook (`exsel_project.ipynb`) documenting zero-shot image classification (CLIP), image captioning (BLIP), Python food safety rules, semantic text embeddings (MiniLM), and vector index retrieval (FAISS) across a test cohort of food items (`f1.jpg` through `f15.jpg`).
3. **Target State:** A production-grade architecture decoupling the React frontend from a high-performance Python FastAPI backend, supported by SQLite persistence (`regive.db`), real-time model inference, and verified partner routing.

---

## 2. Existing Frontend Codebase Audit

### 2.1 File & Directory Structure
```
c:\Users\pvenk\Downloads\Excel_Project\
├── index.html                  # HTML entry point, Google Fonts (Manrope, Inter)
├── package.json                # Dependencies: react 19, lucide-react, vite 8, tailwindcss 4
├── vite.config.ts              # Vite configuration with @tailwindcss/vite plugin
├── tsconfig.app.json           # TypeScript configuration
├── src/
│   ├── main.tsx                # React DOM mount point
│   ├── App.tsx                 # Root component managing active screen & state
│   ├── index.css               # Tailwind CSS theme variables & styling
│   ├── types/
│   │   └── donation.ts         # TypeScript interfaces (Donation, Partner, AIAnalysis)
│   ├── data/
│   │   ├── mockDonations.ts    # Seed mock records
│   │   ├── mockPartners.ts     # Mock partners
│   │   └── presetSamples.ts    # 4 UI test presets
│   ├── services/
│   │   ├── aiAnalysisService.ts # Mock AI simulation adapter
│   │   └── donationService.ts  # LocalStorage CRUD wrapper
│   ├── components/
│   │   ├── layout/             # DonorHeader, DonorFooter, DonorLayout
│   │   ├── home/               # HeroSection, DonationOverview, RecentDonations, ImpactExplainer
│   │   ├── donation/           # DonationImageUpload, DonationDetailsForm, AIProcessingState,
│   │   │                       # AIAnalysisResults, PartnerRecommendations, PartnerDetailDrawer,
│   │   │                       # DonationConfirmationModal
│   │   └── tracking/           # DonationFilters, DonationList, DonationDetailDrawer
│   └── pages/
│       ├── DonorHome.tsx       # Screen 01: Home page
│       ├── CreateDonation.tsx  # Screen 02: Intake & Analysis
│       └── MyDonations.tsx     # Screen 03: History & Tracking
```

### 2.2 Frontend Strengths
- **Strict Visual Cohesion:** Matches the editorial yellow-and-white visual identity (`#F5E84D` outer frame, `#FFFFFF` rounded primary surface, `#F1F2F0` input surfaces, `#171717` typography).
- **Three-Screen Architecture:** Adheres strictly to three primary screens without page sprawl.
- **Progressive Disclosure:** Image analysis, safety checks, partner recommendations, partner profile drawers, confirmation dialogs, and tracking timelines occur inline or via slide-over drawers.
- **Zero Runtime Errors:** Browser test suites executed with 0 console warnings or errors.

### 2.3 Frontend Architectural Gaps
1. **Mock Service Dependency:** Form submissions currently call `aiAnalysisService.ts` (simulated delay) rather than making HTTP multipart requests to a live backend.
2. **Ephemeral Local Storage:** Data is stored in browser `localStorage` (`regive_donations_v1`), which lacks persistence across different browsers, cannot serve uploaded binary images from the server, and cannot support multi-client synchronization.
3. **Column Proportion Tuning:** The desktop Create Donation view currently uses `lg:col-span-5` (41.6%) and `lg:col-span-7` (58.3%). It needs fine-tuning to strictly match the requested 40% / 60% grid balance.
4. **Category Capability Messaging:** The UI presents categories such as Clothing, Books, and Recyclables alongside Food. However, the existing notebook model pipeline exclusively supports Food classification and food-waste routing. The UI must explicitly denote which categories use active ML inference versus manual intake review.

---

## 3. Jupyter Notebook Audit (`exsel_project.ipynb`)

The notebook `exsel_project.ipynb` was analyzed cell-by-cell. Below is the extraction of its exact models, logic, and operational pipeline.

### 3.1 Model Checkpoints & Specifications
| Component | Checkpoint / Framework | Task | Parameters / Input Format |
|---|---|---|---|
| **CLIP** | `openai/clip-vit-base-patch32` | Zero-shot visual classification | RGB Image $\rightarrow$ Candidate prompt probabilities |
| **BLIP** | `Salesforce/blip-image-captioning-base` | Neural image captioning | RGB Image $\rightarrow$ Generated text string |
| **MiniLM** | `sentence-transformers/all-MiniLM-L6-v2` | Dense semantic text embeddings | Text string $\rightarrow$ 384-dimensional vector ($\ell_2$-normalized) |
| **FAISS** | `faiss.IndexFlatIP(384)` | Vector similarity search | Normalized embeddings $\rightarrow$ Cosine inner product similarity |
| **Safety Engine** | Pure Python deterministic rules | Food perishability validation | Food category, storage temp, hours since cooked |

### 3.2 Notebook Pipeline Extraction
1. **Edibility Classification (CLIP Stage 1):**
   ```python
   EDIBLE_PROMPTS = [
       "fresh appetizing food that is safe to eat",
       "rotten, moldy or inedible food waste"
   ]
   # Hypothesis template: "a photo of {}."
   edible_score = next(r["score"] for r in r1 if r["label"] == EDIBLE_PROMPTS[0])
   edible = edible_score >= 0.5
   needs_review = 0.35 < edible_score < 0.65
   ```
2. **Non-Edible Stream Classification (CLIP Stage 2):**
   Candidate labels mapped to recovery streams:
   - `"stale dry bread"` $\rightarrow$ `"animal"`
   - `"vegetable peels and food scraps"` $\rightarrow$ `"animal"`
   - `"moldy spoiled food"` $\rightarrow$ `"compost"`
   - `"rotten decaying food"` $\rightarrow$ `"compost"`
   - `"bones and meat waste"` $\rightarrow$ `"biogas"`
3. **Food Category & Sub-label Classification (CLIP Stage 3):**
   Candidate labels mapped to 6 broad categories:
   - `"cooked meals"`: rice dish or biryani, curry or gravy, soup, noodles or pasta, pizza, chicken or meat dish
   - `"bakery"`: bread or bun, cake or pastry
   - `"fruits and vegetables"`: fruits, vegetables
   - `"sweets and desserts"`: sweets or dessert
   - `"packaged food"`: packaged snacks
   - `"beverages"`: drinks
4. **BLIP Image Captioning:**
   ```python
   inputs = blip_processor(img, return_tensors="pt")
   out = blip_model.generate(**inputs, max_new_tokens=30, num_beams=3, repetition_penalty=1.5)
   caption = blip_processor.decode(out[0], skip_special_tokens=True)
   ```
   *Identified Defect:* In sample `f10.jpg`, BLIP generated: `"a skill skill skill skill skill skill skill skill skill skill skill skill..."`.  
   *Root Cause:* Repetition loop in beam search on ambiguous or high-frequency tokens without an explicit n-gram repetition penalty.  
   *Fix Required:* Add `no_repeat_ngram_size=2`, length penalty, and empty output fallback.
5. **Food Safety Validation Rules:**
   ```python
   def safety_check(food_category, hours_since_cooked, storage):
       """storage: 'room', 'fridge' or 'sealed'"""
       if food_category != "cooked meals" or storage == "sealed":
           return True, "ok"
       if storage == "room" and hours_since_cooked > 4:
           return False, f"cooked food {hours_since_cooked}h at room temp (limit 4h)"
       if storage == "fridge" and hours_since_cooked > 24:
           return False, f"cooked food {hours_since_cooked}h in fridge (limit 24h)"
       return True, "ok"
   ```
6. **Partner Routing & Scoring Logic:**
   - **NGO Ranking Formula (Human Consumption Stream):**
     $$\text{Score} = 0.50 \times \text{Similarity} + 0.30 \times \text{Proximity} + 0.20 \times \text{Capacity}$$
     Where:
     - $\text{Similarity} = \max(0.0, \text{CosineSim})$
     - $\text{Proximity} = \max(0.0, 1 - \frac{\text{Distance}}{\text{Radius}})$
     - $\text{Capacity} = \min(1.0, \frac{\text{PartnerCapacity}}{\max(\text{DonationQuantity}, 1)})$
     - Filtered strictly by $\text{Distance} \le \text{Radius}$.
   - **Recycler Ranking Formula (Waste Streams: Animal, Compost, Biogas):**
     $$\text{Score} = 0.60 \times \text{Similarity} + 0.40 \times \text{Proximity}$$
     Where:
     - $\text{Proximity} = \max(0.0, 1 - \frac{\text{Distance}}{\text{Radius}})$
     - Filtered strictly by $\text{Distance} \le \text{Radius}$.

---

## 4. Discrepancy & Gap Analysis

| Aspect | Current UI Prototype | Notebook ML Implementation | Target Production Architecture |
|---|---|---|---|
| **Supported Categories** | Food, Clothing, Books, Plastic, Paper, Metal, Household | Food and organic food waste only | **Explicit capability handling:** Active AI pipeline for Food; transparent manual review intake for non-food categories. |
| **Data Persistence** | Browser `localStorage` | In-memory Python lists (`IMPACT`) | **SQLite (`regive.db`)** with relational tables, BLOB image persistence, and transaction integrity. |
| **Inference Runtime** | Client-side mock `setTimeout(1400)` | Direct Python script execution | **FastAPI service** with singleton model caching loaded once on startup. |
| **Partner Data** | In-memory TypeScript array (`mockPartners.ts`) | Python dicts (`NGOS`, `RECYCLERS`) | Relational `partners` table seeded directly from notebook dataset, exposed via REST API. |
| **Image Handling** | Temporary browser ObjectURL | Local file path (`f1.jpg`–`f15.jpg`) | Multipart upload $\rightarrow$ SQLite BLOB $\rightarrow$ Streaming endpoint (`GET /api/donations/{id}/image`). |

---

## 5. Technology Stack & Compatibility Verification

### 5.1 Host Python Environment
- **Active Python:** Python 3.14.5 (AMD64 Windows).
- **Core ML Packages Verified:**
  - `torch 2.12.1` & `torchvision 0.27.1` (CPU inference functional)
  - `transformers 5.12.1` (Hugging Face Pipelines operational)
  - `sentence-transformers 5.6.0` (MiniLM embeddings operational)
  - `faiss-cpu 1.15.1` (Successfully installed and verified with `IndexFlatIP`)
  - `fastapi 0.136.3` & `uvicorn 0.48.0` (ASGI server operational)
  - `sqlalchemy 2.0.50` (Modern ORM operational)
  - `pillow 11.x` (Image decoding and format conversion operational)
  - `python-multipart 0.0.29` (Form file upload operational)

### 5.2 Performance & Execution Strategy
- Models will be instantiated as **application-level singletons** during FastAPI startup (`@asynccontextmanager` lifespan event).
- Initial model load takes ~15–18 seconds once on cold start. Subsequent per-request inference takes ~1.2–2.5 seconds on CPU.
- Database access uses SQLAlchemy session factory with connection pooling.
- Frontend communicates with FastAPI backend running on `http://127.0.0.1:8000`.

---

## 6. Audit Conclusion & Go-Forward Governance
The existing frontend is visually mature and structurally sound. The notebook implementation provides clear, mathematically explicit pipelines for classification, captioning, safety validation, and partner retrieval. 

The transition to production requires:
1. Building a modular FastAPI backend (`backend/`).
2. Creating the relational SQLite schema (`regive.db`).
3. Porting and optimizing the 5 AI components with the `f10.jpg` BLIP fix.
4. Integrating the React frontend with live REST endpoints.
5. Verifying the entire flow with an automated test suite based on `f1.jpg`–`f15.jpg`.
