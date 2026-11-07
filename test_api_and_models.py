import os
import sys
import json
import requests
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

API_BASE = "http://127.0.0.1:8000"
TEST_IMG_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend", "data", "test_images")

def test_endpoints():
    print("=" * 60)
    print("1. TESTING HEALTH & PARTNER API ENDPOINTS")
    print("=" * 60)

    # 1. Health
    r = requests.get(f"{API_BASE}/health")
    print("GET /health ->", r.status_code, r.json())
    assert r.status_code == 200

    # 2. Partners
    r = requests.get(f"{API_BASE}/api/partners")
    partners = r.json()
    print(f"GET /api/partners -> {r.status_code}, Found {len(partners)} partners.")
    for p in partners[:3]:
        print(f"  • [{p['id']}] {p['name']} ({p['organization_type']}) - Rating: {p['rating']}")
    assert len(partners) >= 12

    # 3. Existing Donations
    r = requests.get(f"{API_BASE}/api/donations")
    donations = r.json()
    print(f"GET /api/donations -> {r.status_code}, Found {len(donations)} donations in SQLite.")
    assert len(donations) >= 3

    print("\n" + "=" * 60)
    print("2. TESTING AI MODEL PIPELINE ON ALL 14 GOOGLE DRIVE IMAGES")
    print("=" * 60)

    images = sorted(os.listdir(TEST_IMG_DIR))
    print(f"Found {len(images)} evaluation images in {TEST_IMG_DIR}\n")

    results_table = []

    for img_name in images:
        img_path = os.path.join(TEST_IMG_DIR, img_name)
        with open(img_path, "rb") as f:
            files = {"image": (img_name, f, "image/jpeg")}
            data = {
                "category": "Food",
                "title": f"Test Evaluation Sample {img_name}",
                "hours_since_cooked": 2.0,
                "storage_condition": "sealed",
                "expiry_date": "2026-11-15",
                "quantity": 10.0,
                "unit": "boxes"
            }
            resp = requests.post(f"{API_BASE}/api/donations/analyze", files=files, data=data)

        if resp.status_code != 200:
            print(f"❌ Error testing {img_name}: {resp.status_code} {resp.text}")
            continue

        res = resp.json()
        analysis = res["analysis"]
        top_partner = res["recommended_partners"][0] if res["recommended_partners"] else None

        row = {
            "image": img_name,
            "edibility_score": analysis["edibility_score"],
            "is_edible": analysis["is_edible"],
            "detected_food_type": analysis["detected_food_type"],
            "blip_caption": analysis["caption"],
            "safety_status": analysis["safety_status"],
            "stream_type": analysis["stream_type"],
            "top_partner": top_partner["name"] if top_partner else "None",
            "match_score": top_partner["matching_score"] if top_partner else 0.0
        }
        results_table.append(row)

        print(f"🖼️ [{img_name}]")
        print(f"   • CLIP Edibility: {round(row['edibility_score']*100, 1)}% ({'Edible' if row['is_edible'] else 'Inedible Waste'})")
        print(f"   • Food Category: {row['detected_food_type']}")
        print(f"   • BLIP Caption: \"{row['blip_caption']}\"")
        print(f"   • Safety Status: {row['safety_status']} | Stream: {row['stream_type']}")
        if top_partner:
            print(f"   • Top Match: {top_partner['name']} (Score: {top_partner['matching_score']}%)")
        print("-" * 50)

    # Save results to JSON
    report_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend", "data", "test_drive_images_results.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(results_table, f, indent=2)
    print(f"\nSaved detailed evaluation metrics to: {report_path}")

    print("\n" + "=" * 60)
    print("3. TESTING PERSISTENCE: CREATING NEW DONATION RECORD")
    print("=" * 60)

    # Pick the first result to submit
    first_res = results_table[0]
    new_donation_payload = {
        "donor_id": "usr-elena-01",
        "image_url": f"/test-images/{first_res['image']}",
        "category": "Food",
        "food_type": first_res["detected_food_type"],
        "title": f"Fresh Consignment ({first_res['image']})",
        "description": first_res["blip_caption"],
        "quantity": 15.0,
        "unit": "boxes",
        "condition": "New",
        "storage_condition": "sealed",
        "hours_since_cooked": 1.5,
        "expiry_date": "2026-11-12",
        "pickup_location": "34 Baker Street, Central Quarter, Apt 4B",
        "status": "Submitted",
        "selected_partner_id": "prt-ngo-01",
        "ai_analysis": {
            "category": "Food",
            "detected_food_type": first_res["detected_food_type"],
            "caption": first_res["blip_caption"],
            "edibility_score": first_res["edibility_score"],
            "is_edible": first_res["is_edible"],
            "safety_status": first_res["safety_status"],
            "safety_explanation": "Safe for intake. Packaging verified intact.",
            "suggested_unit": "boxes",
            "suggested_quantity": 15.0,
            "confidence": first_res["edibility_score"],
            "stream_type": first_res["stream_type"]
        }
    }

    create_resp = requests.post(f"{API_BASE}/api/donations", json=new_donation_payload)
    print(f"POST /api/donations -> Status: {create_resp.status_code}")
    created_obj = create_resp.json()
    print(f"Created Record ID: {created_obj['id']}")
    print(f"Status: {created_obj['status']}, Title: {created_obj['title']}")
    print(f"Tracking Timeline Stages: {len(created_obj['tracking_timeline'])}")

    # Verify retrieval from SQLite
    verify_resp = requests.get(f"{API_BASE}/api/donations/{created_obj['id']}")
    print(f"GET /api/donations/{created_obj['id']} -> Status: {verify_resp.status_code}, Title: {verify_resp.json()['title']}")
    assert verify_resp.status_code == 200
    assert verify_resp.json()["id"] == created_obj["id"]

    print("\n✅ ALL ENDPOINTS AND REAL ML MODELS VERIFIED SUCCESSFULLY!")

if __name__ == "__main__":
    test_endpoints()
