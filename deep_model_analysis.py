import os
import torch
from PIL import Image
from transformers import CLIPProcessor, CLIPModel, BlipProcessor, BlipForConditionalGeneration

device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Loading CLIP & BLIP on {device}...")
clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(device)
clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

blip_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base").to(device)
blip_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")

EDIBLE_PROMPTS = [
    "fresh appetizing food that is safe to eat",
    "rotten, moldy or inedible food waste"
]

NON_EDIBLE = {
    "stale dry bread": "animal",
    "vegetable peels and food scraps": "animal",
    "moldy spoiled food": "compost",
    "rotten decaying food": "compost",
    "bones and meat waste": "biogas",
}

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

img_dir = "backend/data/test_images"
images = sorted(os.listdir(img_dir), key=lambda x: (len(x), x))

print("\n" + "="*80)
print(f"{'IMAGE':<10} | {'EDIBILITY':<10} | {'STATUS':<12} | {'DETECTED CATEGORY':<20} | {'BLIP CAPTION'}")
print("="*80)

for img_name in images:
    img_path = os.path.join(img_dir, img_name)
    img = Image.open(img_path).convert("RGB")
    
    # 1. Edibility
    inputs = clip_processor(text=EDIBLE_PROMPTS, images=img, return_tensors="pt", padding=True).to(device)
    with torch.no_grad():
        out = clip_model(**inputs)
        probs = out.logits_per_image.softmax(dim=1)[0]
    edible_score = float(probs[0].item())
    is_edible = edible_score >= 0.50

    # 2. Category
    if is_edible:
        c_prompts = [f"a photo of {lbl}, a type of food." for lbl in FOOD_LABELS.keys()]
        c_inputs = clip_processor(text=c_prompts, images=img, return_tensors="pt", padding=True).to(device)
        with torch.no_grad():
            c_out = clip_model(**c_inputs)
            c_probs = c_out.logits_per_image.softmax(dim=1)[0]
        best_c = list(FOOD_LABELS.keys())[int(torch.argmax(c_probs).item())]
        category_str = f"{best_c} ({FOOD_LABELS[best_c]})"
    else:
        w_prompts = [f"a photo of {lbl}." for lbl in NON_EDIBLE.keys()]
        w_inputs = clip_processor(text=w_prompts, images=img, return_tensors="pt", padding=True).to(device)
        with torch.no_grad():
            w_out = clip_model(**w_inputs)
            w_probs = w_out.logits_per_image.softmax(dim=1)[0]
        best_w = list(NON_EDIBLE.keys())[int(torch.argmax(w_probs).item())]
        category_str = f"{best_w} -> {NON_EDIBLE[best_w]}"

    # 3. Caption
    b_inputs = blip_processor(img, return_tensors="pt").to(device)
    with torch.no_grad():
        b_out = blip_model.generate(
            **b_inputs,
            max_new_tokens=30,
            num_beams=4,
            repetition_penalty=1.8,
            no_repeat_ngram_size=2
        )
    caption = blip_processor.decode(b_out[0], skip_special_tokens=True).strip()

    status = "EDIBLE" if is_edible else "INEDIBLE"
    print(f"{img_name:<10} | {edible_score*100:>6.1f}%    | {status:<12} | {category_str:<20} | {caption}")

print("="*80)
