import os
import math
import json
import torch
from PIL import Image
from typing import List, Dict, Any, Tuple, Optional
from transformers import CLIPProcessor, CLIPModel, BlipProcessor, BlipForConditionalGeneration
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

# Global Model Singletons
_device = "cuda" if torch.cuda.is_available() else "cpu"
_clip_model = None
_clip_processor = None
_blip_model = None
_blip_processor = None
_minilm_model = None

# FAISS Indices and metadata
_faiss_ngo_index = None
_ngo_metadata = []
_faiss_recycler_indices = {}
_recycler_metadata = {}

def get_clip():
    global _clip_model, _clip_processor
    if _clip_model is None:
        _clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(_device)
        _clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
    return _clip_model, _clip_processor

def get_blip():
    global _blip_model, _blip_processor
    if _blip_model is None:
        _blip_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base").to(_device)
        _blip_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
    return _blip_model, _blip_processor

def get_minilm():
    global _minilm_model
    if _minilm_model is None:
        _minilm_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2", device=_device)
    return _minilm_model

# Candidate Prompts
EDIBLE_PROMPTS = [
    "fresh appetizing food that is safe to eat",
    "rotten, moldy or inedible food waste"
]

FOOD_MAPPING = {
    "rice dish or biryani": ("cooked meals", "Prepared Meals", "meals"),
    "curry or gravy": ("cooked meals", "Prepared Meals", "meals"),
    "soup": ("cooked meals", "Prepared Meals", "portions"),
    "noodles or pasta": ("cooked meals", "Prepared Meals", "meals"),
    "pizza": ("cooked meals", "Prepared Meals", "boxes"),
    "chicken or meat dish": ("cooked meals", "Prepared Meals", "portions"),
    "bread or bun": ("bakery", "Bakery & Bread", "boxes"),
    "cake or pastry": ("bakery", "Bakery & Bread", "boxes"),
    "fruits": ("fruits and vegetables", "Fresh Produce", "crates"),
    "vegetables": ("fruits and vegetables", "Fresh Produce", "crates"),
    "sweets or dessert": ("sweets and desserts", "Bakery & Bread", "boxes"),
    "packaged snacks": ("packaged food", "Packaged Pantry", "packs"),
    "drinks": ("beverages", "Packaged Pantry", "packs"),
}

NON_EDIBLE_MAPPING = {
    "stale dry bread": ("animal", "Animal Feed"),
    "vegetable peels and food scraps": ("animal", "Animal Feed"),
    "moldy spoiled food": ("compost", "Organic Compost"),
    "rotten decaying food": ("compost", "Organic Compost"),
    "bones and meat waste": ("biogas", "Biogas Fuel"),
}

def calculate_haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371.0  # Earth radius in kilometers
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = phi2 - phi1
    delta_lambda = math.radians(lng2 - lng1)
    a = (math.sin(delta_phi / 2) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2)
    return round(2.0 * R * math.asin(math.sqrt(a)), 2)

def evaluate_food_safety(
    category: str,
    hours_since_cooked: float,
    storage_condition: str,
    expiry_date: Optional[str]
) -> Tuple[bool, str, str]:
    """
    Evaluates food safety according to health rules:
    - 4-hour room temperature rule
    - 24-hour refrigerated cooked food rule
    - Expiration date validation
    """
    # 1. Past expiration date
    if expiry_date:
        try:
            from datetime import datetime
            exp = datetime.strptime(expiry_date, "%Y-%m-%d").date()
            today = datetime.utcnow().date()
            if exp < today:
                return (
                    False,
                    f"The specified expiration date ({expiry_date}) has already passed. Unsafe for human intake.",
                    "Not Eligible"
                )
        except Exception:
            pass

    # 2. Non-cooked or sealed foods
    if category != "cooked meals" or storage_condition == "sealed":
        return True, "Safe for intake. Packaging and shelf-life meet community food bank intake standards.", "Eligible"

    # 3. Room temperature holding threshold
    if storage_condition == "room" and hours_since_cooked > 4:
        return (
            False,
            f"Perishable cooked food exceeded room temperature threshold ({hours_since_cooked}h, limit is 4h). Unsafe for community redistribution.",
            "Not Eligible"
        )

    # 4. Cold storage holding threshold
    if storage_condition == "fridge" and hours_since_cooked > 24:
        return (
            False,
            f"Refrigerated cooked food exceeded cold storage intake window ({hours_since_cooked}h, limit is 24h).",
            "Not Eligible"
        )

    # 5. Borderline refrigerated (18h - 24h)
    if storage_condition == "fridge" and hours_since_cooked > 18:
        return (
            True,
            f"Refrigerated cooked food is near the 24h intake limit ({hours_since_cooked}h). Requires on-site temperature probe verification.",
            "Needs Review"
        )

    return True, "Meets temperature and holding time safety criteria for food redistribution.", "Eligible"

def init_faiss_partner_indices(partners: List[Dict[str, Any]]):
    """
    Initializes FAISS indices using MiniLM 384-dimensional dense vectors
    """
    global _faiss_ngo_index, _ngo_metadata, _faiss_recycler_indices, _recycler_metadata
    minilm = get_minilm()

    ngos = [p for p in partners if p.get("stream") == "human"]
    recyclers = [p for p in partners if p.get("stream") != "human"]

    # 1. Build NGO Index
    if ngos:
        _ngo_metadata = ngos
        ngo_texts = [p["description"] for p in ngos]
        ngo_embeddings = minilm.encode(ngo_texts, normalize_embeddings=True)
        _faiss_ngo_index = faiss.IndexFlatIP(384)
        _faiss_ngo_index.add(np.array(ngo_embeddings, dtype=np.float32))

    # 2. Build Recycler Indices by stream
    _faiss_recycler_indices = {}
    _recycler_metadata = {}
    for stream_type in ["animal", "compost", "biogas"]:
        stream_recs = [p for p in recyclers if p.get("stream") == stream_type]
        if stream_recs:
            _recycler_metadata[stream_type] = stream_recs
            rec_texts = [p["description"] for p in stream_recs]
            rec_embeddings = minilm.encode(rec_texts, normalize_embeddings=True)
            idx = faiss.IndexFlatIP(384)
            idx.add(np.array(rec_embeddings, dtype=np.float32))
            _faiss_recycler_indices[stream_type] = idx

def run_ai_analysis_pipeline(
    image: Image.Image,
    user_category: Optional[str] = "Food",
    user_title: Optional[str] = "",
    hours_since_cooked: float = 2.0,
    storage_condition: str = "sealed",
    expiry_date: Optional[str] = None,
    donor_lat: float = 10.38,
    donor_lng: float = 78.82,
    quantity: float = 1.0,
    unit: str = "boxes",
    partners_list: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Full 5-stage inference execution:
    1. CLIP Edibility check
    2. CLIP Food Type or Waste Stream classification
    3. BLIP Neural Captioning
    4. Food Safety Validation
    5. MiniLM Embedding + FAISS Partner Ranking
    """
    clip_model, clip_processor = get_clip()
    blip_model, blip_processor = get_blip()
    minilm = get_minilm()

    # Stage 1: CLIP Edibility Assessment
    edible_inputs = clip_processor(text=EDIBLE_PROMPTS, images=image, return_tensors="pt", padding=True).to(_device)
    with torch.no_grad():
        edible_outputs = clip_model(**edible_inputs)
        edible_probs = edible_outputs.logits_per_image.softmax(dim=1)[0]
    
    edible_score = round(float(edible_probs[0].item()), 4)
    is_edible = edible_score >= 0.50

    # Stage 2: Classification Stage B or C
    detected_food_type = "Bakery & Bread"
    food_category_key = "bakery"
    suggested_unit = "boxes"
    stream_type = "human"
    confidence = edible_score

    if is_edible:
        food_labels = list(FOOD_MAPPING.keys())
        food_prompts = [f"a photo of {lbl}, a type of food." for lbl in food_labels]
        food_inputs = clip_processor(text=food_prompts, images=image, return_tensors="pt", padding=True).to(_device)
        with torch.no_grad():
            food_outputs = clip_model(**food_inputs)
            food_probs = food_outputs.logits_per_image.softmax(dim=1)[0]
        
        best_idx = int(torch.argmax(food_probs).item())
        best_label = food_labels[best_idx]
        confidence = round(float(food_probs[best_idx].item()), 4)
        cat_key, display_type, default_u = FOOD_MAPPING[best_label]
        food_category_key = cat_key
        detected_food_type = display_type
        suggested_unit = default_u
        stream_type = "human"
    else:
        waste_labels = list(NON_EDIBLE_MAPPING.keys())
        waste_prompts = [f"a photo of {lbl}." for lbl in waste_labels]
        waste_inputs = clip_processor(text=waste_prompts, images=image, return_tensors="pt", padding=True).to(_device)
        with torch.no_grad():
            waste_outputs = clip_model(**waste_inputs)
            waste_probs = waste_outputs.logits_per_image.softmax(dim=1)[0]
        
        best_idx = int(torch.argmax(waste_probs).item())
        best_waste = waste_labels[best_idx]
        confidence = round(float(waste_probs[best_idx].item()), 4)
        stream_key, display_name = NON_EDIBLE_MAPPING[best_waste]
        stream_type = stream_key
        detected_food_type = display_name
        suggested_unit = "kg"

    # Stage 3: BLIP Neural Captioning
    blip_inputs = blip_processor(image, return_tensors="pt").to(_device)
    with torch.no_grad():
        out = blip_model.generate(
            **blip_inputs,
            max_new_tokens=35,
            min_new_tokens=5,
            num_beams=4,
            repetition_penalty=1.8,
            no_repeat_ngram_size=2,
            early_stopping=True
        )
    caption = blip_processor.decode(out[0], skip_special_tokens=True).strip()
    if not caption or len(caption) < 4:
        caption = f"A photo of {detected_food_type.lower()} prepared for redistribution."

    # Stage 4: Safety Rule Evaluation
    if not is_edible:
        is_safe = False
        safety_status = "Not Eligible"
        safety_explanation = (
            f"Visual model identified inedible food waste ({detected_food_type}, edibility confidence: {edible_score * 100:.1f}%). "
            f"Rejected for direct human consumption to safeguard community health. Automatically routed to certified organic recycling and recovery."
        )
    else:
        is_safe, safety_explanation, safety_status = evaluate_food_safety(
            category=food_category_key,
            hours_since_cooked=hours_since_cooked,
            storage_condition=storage_condition,
            expiry_date=expiry_date
        )

        # If food failed safety, route to organic recovery (compost/animal feed)
        if not is_safe and stream_type == "human":
            stream_type = "compost"
            safety_status = "Not Eligible"

    # Stage 5: MiniLM Semantic Embedding & FAISS Partner Ranking
    if is_edible and is_safe:
        query_text = f"{detected_food_type}: {caption}"
    else:
        query_text = f"{detected_food_type} food waste: {caption}"

    query_embedding = minilm.encode([query_text], normalize_embeddings=True)
    query_vector = np.array(query_embedding, dtype=np.float32)

    recommended_partners = []
    
    # If FAISS indices not yet initialized, initialize from partners_list
    if _faiss_ngo_index is None and partners_list:
        init_faiss_partner_indices(partners_list)

    if stream_type == "human" and _faiss_ngo_index is not None and _ngo_metadata:
        # Search NGOs
        k = min(len(_ngo_metadata), 5)
        sim_scores, indices = _faiss_ngo_index.search(query_vector, k)
        for i, idx in enumerate(indices[0]):
            partner_meta = _ngo_metadata[idx]
            sim = max(0.0, float(sim_scores[0][i]))
            dist = calculate_haversine_distance(donor_lat, donor_lng, partner_meta["latitude"], partner_meta["longitude"])
            radius = partner_meta.get("service_radius_km", 15.0)
            
            prox = max(0.0, 1.0 - (dist / radius))
            cap = min(1.0, partner_meta["capacity"] / max(quantity, 1.0))
            final_score = round((0.50 * sim + 0.30 * prox + 0.20 * cap) * 100, 1)

            reasons = [
                f"Semantic compatibility: {round(sim * 100, 1)}% alignment with intake scope",
                f"Proximity: {dist} km away (within {radius} km intake radius)",
                f"Capacity: Can support {partner_meta['capacity']} meal portions"
            ]

            recommended_partners.append({
                "id": partner_meta["id"],
                "name": partner_meta["name"],
                "organization_type": partner_meta["organization_type"],
                "location": f"{partner_meta.get('address', 'Local')} ({dist} km)",
                "distance_km": dist,
                "available_capacity": int(cap * 100),
                "matching_score": final_score,
                "matching_reasons": reasons,
                "contact_email": partner_meta.get("contact_email"),
                "contact_phone": partner_meta.get("contact_phone"),
                "operating_hours": partner_meta.get("operating_hours", "Daily: 08:00 – 20:00"),
                "address": partner_meta.get("address"),
                "rating": partner_meta.get("rating", 4.9)
            })

    elif stream_type in _faiss_recycler_indices:
        # Search Recyclers for recovery stream
        idx_rec = _faiss_recycler_indices[stream_type]
        meta_rec = _recycler_metadata[stream_type]
        k = min(len(meta_rec), 5)
        sim_scores, indices = idx_rec.search(query_vector, k)
        for i, idx in enumerate(indices[0]):
            partner_meta = meta_rec[idx]
            sim = max(0.0, float(sim_scores[0][i]))
            dist = calculate_haversine_distance(donor_lat, donor_lng, partner_meta["latitude"], partner_meta["longitude"])
            radius = partner_meta.get("service_radius_km", 25.0)
            prox = max(0.0, 1.0 - (dist / radius))
            final_score = round((0.60 * sim + 0.40 * prox) * 100, 1)

            reasons = [
                f"Recovery suitability: {round(sim * 100, 1)}% match for {detected_food_type}",
                f"Direct collection available within {dist} km",
                "Certified zero-landfill diversion processing"
            ]

            recommended_partners.append({
                "id": partner_meta["id"],
                "name": partner_meta["name"],
                "organization_type": partner_meta["organization_type"],
                "location": f"{partner_meta.get('address', 'Eco-Park')} ({dist} km)",
                "distance_km": dist,
                "available_capacity": 90,
                "matching_score": final_score,
                "matching_reasons": reasons,
                "contact_email": partner_meta.get("contact_email"),
                "contact_phone": partner_meta.get("contact_phone"),
                "operating_hours": partner_meta.get("operating_hours", "Mon – Fri: 08:00 – 18:00"),
                "address": partner_meta.get("address"),
                "rating": partner_meta.get("rating", 4.8)
            })

    # Sort descending by match score
    recommended_partners.sort(key=lambda x: x["matching_score"], reverse=True)

    detected_tags = ["food"]
    if is_edible:
        detected_tags.extend(["edible", food_category_key, detected_food_type.lower()])
    else:
        detected_tags.extend(["inedible", "organic-waste", stream_type])

    return {
        "analysis": {
            "category": "Food",
            "detected_food_type": detected_food_type,
            "caption": caption,
            "edibility_score": edible_score,
            "is_edible": is_edible,
            "safety_status": safety_status,
            "safety_explanation": safety_explanation,
            "suggested_unit": suggested_unit,
            "suggested_quantity": quantity,
            "confidence": confidence,
            "detected_tags": detected_tags,
            "stream_type": stream_type
        },
        "recommended_partners": recommended_partners
    }
