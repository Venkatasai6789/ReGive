# ReGiVe Backend API Contract & REST Specification
**Document ID:** `docs/API_CONTRACT.md`  
**Base URL:** `http://localhost:8000/api`  
**Date:** November 2026  
**Auditor & API Architect:** Senior Backend Engineer & Systems Architect  

---

## 1. Architectural Overview & Conventions

All endpoints adhere to RESTful conventions, JSON serialization, and OpenAPI 3.1 standards.
- **Multipart Form Ingestion:** `POST /api/donations/analyze` accepts raw image binaries alongside form metadata.
- **Streaming Image Distribution:** `GET /api/donations/{id}/image` directly streams stored binary BLOBs with `Content-Type: image/jpeg` (or `image/png`/`image/webp`).
- **Standard Error Envelope:**
  ```json
  {
    "success": false,
    "error_code": "RESOURCE_NOT_FOUND",
    "message": "Donation with ID DON-2026-9999 was not found.",
    "details": null
  }
  ```

---

## 2. API Endpoints Specification

### 2.1 Health Check & Diagnostic
`GET /api/health`
- **Description:** Verifies service health, database connectivity, and preloaded ML model status.
- **Response (200 OK):**
  ```json
  {
    "status": "healthy",
    "database": "connected",
    "models_loaded": {
      "clip": true,
      "blip": true,
      "minilm": true,
      "faiss": true
    },
    "version": "1.0.0"
  }
  ```

---

### 2.2 Analyze Donation & Execute AI Pipeline
`POST /api/donations/analyze`
- **Description:** Accepts multipart form submission with donation image and donor inputs. Performs validation, runs the 5-stage AI pipeline, saves the draft and image BLOB, calculates partner scores, and returns analysis telemetry.
- **Request (multipart/form-data):**
  | Parameter | Type | Required | Description |
  |---|---|---|---|
  | `image` | UploadFile | Yes | Binary image (JPG, PNG, WEBP, max 10MB) |
  | `category` | string | Yes | E.g. `Food`, `Clothing`, `Books and Educational Materials` |
  | `title` | string | Yes | E.g. `Fresh Artisanal Sourdough & Bagels` |
  | `description` | string | No | User packaging notes |
  | `quantity` | float | Yes | Must be $> 0$ |
  | `unit` | string | Yes | E.g. `boxes`, `kg`, `pieces` |
  | `condition` | string | Yes | `New`, `Good`, `Usable`, `Needs Sorting` |
  | `pickup_location` | string | Yes | Street address |
  | `expiry_date` | string | Conditional | ISO date string (`YYYY-MM-DD`) |
  | `storage_condition` | string | No | `room`, `fridge`, or `sealed` (Default: `room`) |
  | `hours_since_cooked` | float | No | Hours since prepared (Default: `1.0`) |
  | `donor_id` | string | No | Default: `usr-elena-01` |
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "donation_id": "DON-2026-8491",
    "status": "ANALYSIS_COMPLETED",
    "ai_analysis": {
      "edible": true,
      "edible_score": 0.96,
      "detected_category": "bread or bun",
      "category_group": "bakery",
      "caption": "a clean crate containing sorted loaves of artisanal sourdough and bagels",
      "safety_status": "Eligible",
      "safety_reason": "Meets temperature and holding time safety criteria.",
      "routing_stream": "human",
      "pathway": "Food rescue → NGO (human consumption)",
      "needs_review": false,
      "feature_tags": ["baked goods", "bread", "dry food"]
    },
    "recommended_partners": [
      {
        "partner_id": "prt-ngo-01",
        "name": "Annapoorna Trust",
        "partner_type": "Food Bank",
        "distance_km": 2.4,
        "available_capacity": 150,
        "matching_score": 78.6,
        "matching_reasons": [
          "57% food match, 2.4 km away, capacity 150 meals"
        ],
        "address": "450 Harbor Boulevard, Suite 120"
      }
    ]
  }
  ```

---

### 2.3 List Donor Contributions
`GET /api/donations`
- **Query Parameters:**
  - `status_tab` (optional): `all` | `awaiting` | `scheduled` | `completed`
  - `category` (optional): Category filter string
  - `search` (optional): Search string matching title, ID, or partner
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "total_count": 5,
    "counts": {
      "all": 5,
      "awaiting": 2,
      "scheduled": 2,
      "completed": 1
    },
    "donations": [
      {
        "id": "DON-2026-8491",
        "title": "Fresh Artisanal Sourdough & Bagels",
        "category": "Food",
        "quantity": 12,
        "unit": "boxes",
        "condition": "New",
        "status": "SUBMITTED",
        "partner_name": "Annapoorna Trust",
        "partner_type": "Food Bank",
        "image_url": "/api/donations/DON-2026-8491/image",
        "created_at": "2026-11-07T19:40:00Z"
      }
    ]
  }
  ```

---

### 2.4 Retrieve Single Donation Record
`GET /api/donations/{id}`
- **Response (200 OK):** Full donation object, including AI analysis results, assigned partner details, and current timeline stage.

---

### 2.5 Stream Stored Image Binary
`GET /api/donations/{id}/image`
- **Response (200 OK):** Raw binary stream with header `Content-Type: image/jpeg` (or `image/png`). Cached with `Cache-Control: public, max-age=86400`.

---

### 2.6 Confirm Donation & Assign Recipient Partner
`POST /api/donations/{id}/confirm`
- **Request Body:**
  ```json
  {
    "selected_partner_id": "prt-ngo-01",
    "corrected_title": null,
    "corrected_category": null,
    "corrected_caption": null
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "donation_id": "DON-2026-8491",
    "status": "SUBMITTED",
    "selected_partner_id": "prt-ngo-01",
    "partner_name": "Annapoorna Trust",
    "message": "Donation confirmed and intake dispatched to partner."
  }
  ```

---

### 2.7 Retrieve Donation Timeline
`GET /api/donations/{id}/timeline`
- **Response (200 OK):**
  ```json
  {
    "donation_id": "DON-2026-8491",
    "stages": [
      {
        "stage_id": 1,
        "label": "Donation Submitted",
        "timestamp": "07 Nov 2026, 19:42",
        "is_completed": true,
        "is_current": true,
        "detail": "Resource classified and verified. Safety protocol cleared."
      },
      {
        "stage_id": 2,
        "label": "Partner Accepted",
        "timestamp": null,
        "is_completed": false,
        "is_current": false,
        "detail": "Awaiting partner operational confirmation."
      },
      {
        "stage_id": 3,
        "label": "Collection Scheduled",
        "timestamp": null,
        "is_completed": false,
        "is_current": false
      },
      {
        "stage_id": 4,
        "label": "Donation Collected",
        "timestamp": null,
        "is_completed": false,
        "is_current": false
      },
      {
        "stage_id": 5,
        "label": "Completed",
        "timestamp": null,
        "is_completed": false,
        "is_current": false
      }
    ]
  }
  ```
