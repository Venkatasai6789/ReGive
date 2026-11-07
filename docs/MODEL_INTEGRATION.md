# ReGiVe Machine Learning & Rule Engine Integration Specification
**Document ID:** `docs/MODEL_INTEGRATION.md`  
**Date:** November 2026  
**Auditor & ML Engineer:** Senior Machine Learning & Systems Architect  
**Source Notebook:** `exsel_project.ipynb`  

---

## 1. Overview & Architectural Principles

The ReGiVe AI inference subsystem executes an automated 5-stage pipeline for physical food donations and food waste streams.

```
Uploaded Image
      │
      ▼
┌──────────────┐
│  CLIP Model  │ ──► [Edibility Score, Non-Edible Stream, Food Category & Type]
└──────────────┘
      │
      ▼
┌──────────────┐
│  BLIP Model  │ ──► [Neural Visual Caption (with f10 repetition fix)]
└──────────────┘
      │
      ▼
┌──────────────┐
│ Safety Rules │ ──► [Perishability Check: room/fridge/sealed & hours limit]
└──────────────┘
      │
      ▼
┌──────────────┐
│ Routing Logic│ ──► Stream Assignment: Human Consumption (NGO) vs Organic Recovery
└──────────────┘
      │
      ▼
┌──────────────┐
│ MiniLM+FAISS │ ──► Top Ranked Partners (with Haversine Distance & Capacity)
└──────────────┘
```

---

## 2. Component Specifications

### 2.1 Model 01 — Zero-Shot Visual Classification (CLIP)
- **Hugging Face Model Checkpoint:** `openai/clip-vit-base-patch32`
- **Pipeline Task:** `zero-shot-image-classification`
- **Device:** CPU (or CUDA if hardware acceleration is detected)

#### Classification Stage A: Edibility Assessment
- **Hypothesis Template:** `"a photo of {}."`
- **Candidate Prompts:**
  ```python
  EDIBLE_PROMPTS = [
      "fresh appetizing food that is safe to eat",
      "rotten, moldy or inedible food waste"
  ]
  ```
- **Decision Rule:**
  - $\text{edible\_score} \in [0.0, 1.0]$, rounded to 2 decimal places.
  - $\text{edible} = \text{True} \iff \text{edible\_score} \ge 0.50$.
- **Model Uncertainty Flag (Needs Review):**
  - $\text{needs\_review} = \text{True} \iff 0.35 < \text{edible\_score} < 0.65$.
  - *Safety Enforcement:* Borderline items are flagged for human inspection before routing.

#### Classification Stage B: Non-Edible Stream Routing
If the item is classified as non-edible ($\text{edible\_score} < 0.50$ or fails safety), CLIP identifies the specific waste category:
- **Hypothesis Template:** `"a photo of {}."`
- **Candidate Mapping:**
  ```python
  NON_EDIBLE = {
      "stale dry bread": "animal",
      "vegetable peels and food scraps": "animal",
      "moldy spoiled food": "compost",
      "rotten decaying food": "compost",
      "bones and meat waste": "biogas",
  }
  ```

#### Classification Stage C: Food Type & Category Classification
- **Hypothesis Template:** `"a photo of {}, a type of food."`
- **Candidate Mapping:**
  ```python
  FOOD_LABELS = {
      "rice dish or biryani": "cooked meals",
      "curry or gravy": "cooked meals",
      "soup": "cooked meals",
      "noodles or pasta": "cooked meals",
      "pizza": "cooked meals",
      "chicken or meat dish": "cooked meals",
      "bread or bun": "bakery",
      "cake or pastry": "bakery",
      "fruits": "fruits and vegetables",
      "vegetables": "fruits and vegetables",
      "sweets or dessert": "sweets and desserts",
      "packaged snacks": "packaged food",
      "drinks": "beverages",
  }
  ```

---

### 2.2 Model 02 — Neural Image Captioning (BLIP)
- **Hugging Face Model Checkpoint:** `Salesforce/blip-image-captioning-base`
- **Classes:** `BlipProcessor`, `BlipForConditionalGeneration`

#### Generation Parameters & Defect Mitigation
In the original notebook execution on sample `f10.jpg`, the unconstrained generation produced degenerate repetitive text:  
`"a skill skill skill skill skill skill skill skill skill..."`

**Production Generation Configuration:**
```python
def generate_caption(image: Image.Image) -> str:
    inputs = blip_processor(image, return_tensors="pt")
    out = blip_model.generate(
        **inputs,
        max_new_tokens=35,
        min_new_tokens=5,
        num_beams=4,
        repetition_penalty=1.8,
        no_repeat_ngram_size=2,
        early_stopping=True
    )
    caption = blip_processor.decode(out[0], skip_special_tokens=True).strip()
    
    # Fallback validation
    if not caption or len(caption) < 3 or caption.count(" ") < 1:
        caption = "A donation parcel containing food resources."
    return caption
```

---

### 2.3 Component 03 — Food Safety & Intake Validation
Pure Python deterministic rules enforced strictly prior to human consumption routing:

```python
def evaluate_food_safety(
    food_category: str,
    hours_since_cooked: float,
    storage_condition: str
) -> tuple[bool, str, str]:
    """
    storage_condition: 'room' | 'fridge' | 'sealed'
    Returns: (is_safe, explanation, safety_status)
    """
    # Non-cooked or hermetically sealed foods are accepted if within shelf life
    if food_category != "cooked meals" or storage_condition == "sealed":
        return True, "Meets safety standards for human redistribution intake.", "Eligible"
    
    # Cooked meals at room temperature (4-hour public health limit)
    if storage_condition == "room" and hours_since_cooked > 4:
        return (
            False,
            f"Cooked food exceeded room temperature threshold ({hours_since_cooked}h, limit is 4h).",
            "Not Eligible"
        )
    
    # Cooked meals in refrigerated storage (24-hour safe intake limit)
    if storage_condition == "fridge" and hours_since_cooked > 24:
        return (
            False,
            f"Refrigerated cooked food exceeded cold storage intake window ({hours_since_cooked}h, limit is 24h).",
            "Not Eligible"
        )
    
    # Borderline refrigerated (between 18 and 24 hours)
    if storage_condition == "fridge" and hours_since_cooked > 18:
        return (
            True,
            f"Refrigerated cooked food is near the 24h intake limit ({hours_since_cooked}h). Requires on-site temperature probe verification.",
            "Needs Review"
        )
    
    return True, "Meets temperature and holding time safety criteria.", "Eligible"
```

---

### 2.4 Component 04 — Semantic Text Embeddings (MiniLM)
- **Hugging Face Model Checkpoint:** `sentence-transformers/all-MiniLM-L6-v2`
- **Embedding Dimension:** 384
- **Normalization:** $\ell_2$-normalized vector output (`normalize_embeddings=True`)

#### Query Construction
The query string fed into MiniLM differs based on the routing stream:
1. **Human Consumption (NGO Query):**
   ```python
   query = f"{food_type} ({food_category}): {caption}"
   ```
2. **Organic Recovery (Recycler Query):**
   ```python
   query = f"{non_edible_label}: {caption}"
   ```

---

### 2.5 Component 05 — Vector Similarity & Multi-Factor Partner Ranking (FAISS)
- **Index Type:** `faiss.IndexFlatIP(384)` (Inner Product over $\ell_2$-normalized vectors equates directly to Cosine Similarity).
- **Index Partitions:**
  1. `ngo_index`: Indexes the service scope description of all registered NGOs.
  2. `recycler_index[stream]`: Separate indexes for `"animal"`, `"compost"`, and `"biogas"`.

#### Geographic Calculation: Haversine Formula
```python
def calculate_haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371.0  # Earth radius in kilometers
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = phi2 - phi1
    delta_lambda = math.radians(lng2 - lng1)
    a = (math.sin(delta_phi / 2) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2)
    return 2.0 * R * math.asin(math.sqrt(a))
```

#### Ranking Formulations

**A. NGO Match Score (Human Stream):**
$$\text{Sim} = \max(0.0, \text{CosineSimilarity})$$
$$\text{Prox} = \max\left(0.0, 1.0 - \frac{\text{Distance}}{\text{ServiceRadius}}\right)$$
$$\text{Cap} = \min\left(1.0, \frac{\text{PartnerCapacity}}{\max(\text{DonationQuantity}, 1)}\right)$$
$$\text{FinalScore} = \text{round}\left((0.50 \times \text{Sim} + 0.30 \times \text{Prox} + 0.20 \times \text{Cap}) \times 100, 1\right)$$
*Filter Condition:* $\text{Distance} \le \text{ServiceRadius}$.

**B. Recycler Match Score (Recovery Streams):**
$$\text{Sim} = \max(0.0, \text{CosineSimilarity})$$
$$\text{Prox} = \max\left(0.0, 1.0 - \frac{\text{Distance}}{\text{ServiceRadius}}\right)$$
$$\text{FinalScore} = \text{round}\left((0.60 \times \text{Sim} + 0.40 \times \text{Prox}) \times 100, 1\right)$$
*Filter Condition:* $\text{Distance} \le \text{ServiceRadius}$.

---

## 3. Seed Partner Dataset (From Notebook)

### NGOs (Human Consumption Stream)
1. **Annapoorna Trust** (Lat: 10.38, Lng: 78.82, Cap: 150 meals, Radius: 15 km)  
   *"Serves hot cooked meals like rice, sambar, curry and chicken to homeless people and daily wage workers"*
2. **Little Hands Orphanage** (Lat: 10.40, Lng: 78.80, Cap: 60 meals, Radius: 12 km)  
   *"Children's home that accepts bread, bakery items, fruits, biscuits, sweets and milk"*
3. **Green Basket Foundation** (Lat: 10.35, Lng: 78.85, Cap: 200 meals, Radius: 20 km)  
   *"Distributes fresh vegetables and fruits to low-income families"*
4. **Sunset Elders Home** (Lat: 10.42, Lng: 78.78, Cap: 40 meals, Radius: 10 km)  
   *"Old age home that needs soft cooked food like rice, soup, idli, fruits and milk"*
5. **Hope Night Shelter** (Lat: 10.37, Lng: 78.83, Cap: 120 meals, Radius: 15 km)  
   *"Night shelter providing dinner such as cooked rice, noodles, curry and bread to homeless people"*
6. **Bright Future School Meals** (Lat: 10.39, Lng: 78.86, Cap: 250 meals, Radius: 18 km)  
   *"School meal program for children that accepts cooked meals, packaged snacks, biscuits and fruits"*

### Recyclers (Recovery Streams)
1. **Gokul Goshala** (Stream: `animal`, Lat: 10.36, Lng: 78.84, Radius: 25 km)  
   *"Cattle shelter that accepts stale bread, vegetable peels, fruit scraps and dry leftovers as animal feed"*
2. **Happy Paws Shelter** (Stream: `animal`, Lat: 10.41, Lng: 78.81, Radius: 15 km)  
   *"Dog and cat shelter that accepts leftover rice, bread and cooked scraps without mold"*
3. **Green Earth Composters** (Stream: `compost`, Lat: 10.34, Lng: 78.87, Radius: 30 km)  
   *"Composting unit that turns spoiled food, rotten fruits, vegetable waste and peels into organic compost"*
4. **Vermi Farm Co-op** (Stream: `compost`, Lat: 10.43, Lng: 78.79, Radius: 25 km)  
   *"Vermicompost farm that accepts rotten vegetables, fruit waste and spoiled food"*
5. **BioGas Energy Plant** (Stream: `biogas`, Lat: 10.33, Lng: 78.88, Radius: 40 km)  
   *"Biogas plant converting food waste, bones, meat waste and cooked leftovers into biogas fuel"*
6. **Rural Biogas Unit** (Stream: `biogas`, Lat: 10.45, Lng: 78.75, Radius: 30 km)  
   *"Community biogas digester that accepts kitchen waste, bones and meat scraps to produce cooking gas"*

---

## 4. Policy for Non-Food Categories (Clothing, Books, Recyclables)
As audited in Section 8 of the Master Prompt:
- The ML classification pipeline was trained and tested specifically on food items and organic recovery streams.
- If a user selects **Clothing**, **Books**, or **Inorganic Recyclables**:
  - The system does **not** silently route them into food models.
  - The backend returns an explicit intake notice: `AI Model Specialization: Visual zero-shot classification is currently optimized for Food and Organic Waste streams. This item has been logged for verified partner manual review.`
  - Partner matching matches registered partners accepting those respective categories with transparent metadata.
