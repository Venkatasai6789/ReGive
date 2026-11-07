import os
import sys
import json
import time
import urllib.request
import urllib.error

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

API_BASE = "http://127.0.0.1:8000/api"

def run_tests():
    print("=" * 70)
    print("ReGiVe Phase 03 - NGO / Recycler Partner Portal 10-Test Suite")
    print("=" * 70)

    # -------------------------------------------------------------
    # TEST 01: Donor submits edible food -> NGO receives assigned donation
    # -------------------------------------------------------------
    print("\n--- TEST 01: Submitting Edible Food Donation (Target: Food NGO) ---")
    edible_payload = {
        "donor_id": "usr-elena-01",
        "image_url": "/backend/data/test_images/f10.jpg",
        "category": "Food",
        "food_type": "Bakery & Bread",
        "title": "Fresh Morning Bagels & Sourdough",
        "description": "Crisp morning baked goods ready for community breakfast program.",
        "quantity": 12.0,
        "unit": "boxes",
        "condition": "New",
        "storage_condition": "sealed",
        "hours_since_cooked": 1.0,
        "expiry_date": "14-11-2026",
        "pickup_location": "24 University Avenue, Hall 4",
        "status": "Submitted",
        "selected_partner_id": "prt-ngo-01",
        "partner_name": "Annapoorna Trust",
        "partner_type": "Food Bank",
        "ai_analysis": {
            "category": "Food",
            "detected_food_type": "Bakery & Bread",
            "caption": "a close-up of freshly baked sourdough loaves and bagels",
            "edibility_score": 0.965,
            "is_edible": True,
            "safety_status": "Eligible",
            "safety_explanation": "Intake safe. High edibility confidence (96.5%).",
            "suggested_unit": "boxes",
            "suggested_quantity": 12.0,
            "confidence": 0.965,
            "detected_tags": ["bread", "bakery", "edible"],
            "stream_type": "human"
        },
        "matches": [
            {
                "id": "prt-ngo-01",
                "partner_id": "prt-ngo-01",
                "similarity_score": 97.2,
                "proximity_score": 94.0,
                "capacity_score": 95.0,
                "final_score": 98.0,
                "rank": 1,
                "distance_km": 2.4
            }
        ]
    }

    req = urllib.request.Request(
        f"{API_BASE}/donations",
        data=json.dumps(edible_payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    res = urllib.request.urlopen(req)
    edible_donation = json.loads(res.read().decode("utf-8"))
    edible_id = edible_donation["id"]
    print(f"Created Edible Donation: {edible_id}")
    assert edible_donation["selected_partner_id"] == "prt-ngo-01"
    assert edible_donation["status"] == "Submitted"

    # Verify it appears in prt-ngo-01 incoming requests
    req = urllib.request.urlopen(f"{API_BASE}/partners/prt-ngo-01/donations")
    ngo_donations = json.loads(req.read().decode("utf-8"))
    found_edible = any(d["id"] == edible_id for d in ngo_donations)
    print(f"Verified {edible_id} assigned to Annapoorna Trust (Food NGO): {found_edible}")
    assert found_edible, "Edible donation not found in NGO incoming requests"
    print("PASS: TEST 01 Passed.")

    # -------------------------------------------------------------
    # TEST 02: Donor submits inedible food -> Assigned to Recycler
    # -------------------------------------------------------------
    print("\n--- TEST 02: Submitting Inedible Food Donation (Target: Bio-Recycler) ---")
    inedible_payload = {
        "donor_id": "usr-elena-01",
        "image_url": "/backend/data/test_images/f11.jpeg",
        "category": "Food",
        "food_type": "Prepared Meals",
        "title": "Decayed Vegetable Trays",
        "description": "Spoiled surplus produce suitable for bio-composting.",
        "quantity": 18.0,
        "unit": "boxes",
        "condition": "Needs Sorting",
        "storage_condition": "room",
        "hours_since_cooked": 36.0,
        "expiry_date": "08-11-2026",
        "pickup_location": "Cafeteria Service Gate B",
        "status": "Submitted",
        "selected_partner_id": "prt-rec-03",
        "partner_name": "Green Earth Composters",
        "partner_type": "Recycler",
        "ai_analysis": {
            "category": "Food",
            "detected_food_type": "Prepared Meals",
            "caption": "decayed organic food matter on counter",
            "edibility_score": 0.099,
            "is_edible": False,
            "safety_status": "Not Eligible",
            "safety_explanation": "Safety Alert: Edibility score 9.9% below safety threshold. Exceeded 24h perishable window. Routed to organic composting recovery.",
            "suggested_unit": "boxes",
            "suggested_quantity": 18.0,
            "confidence": 0.901,
            "detected_tags": ["spoiled", "organic waste", "compost"],
            "stream_type": "compost"
        },
        "matches": [
            {
                "id": "prt-rec-03",
                "partner_id": "prt-rec-03",
                "similarity_score": 95.0,
                "proximity_score": 92.0,
                "capacity_score": 98.0,
                "final_score": 96.0,
                "rank": 1,
                "distance_km": 4.1
            }
        ]
    }

    req = urllib.request.Request(
        f"{API_BASE}/donations",
        data=json.dumps(inedible_payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    res = urllib.request.urlopen(req)
    inedible_donation = json.loads(res.read().decode("utf-8"))
    inedible_id = inedible_donation["id"]
    print(f"Created Inedible Donation: {inedible_id}")
    assert inedible_donation["selected_partner_id"] == "prt-rec-03"

    # Verify it appears in prt-rec-03 incoming requests
    req = urllib.request.urlopen(f"{API_BASE}/partners/prt-rec-03/donations")
    rec_donations = json.loads(req.read().decode("utf-8"))
    found_inedible = any(d["id"] == inedible_id for d in rec_donations)
    print(f"Verified {inedible_id} assigned to Green Earth Composters (Recycler): {found_inedible}")
    assert found_inedible, "Inedible donation not found in Recycler incoming requests"
    print("PASS: TEST 02 Passed.")

    # -------------------------------------------------------------
    # TEST 03: NGO opens donation details (Sections A through H)
    # -------------------------------------------------------------
    print(f"\n--- TEST 03: NGO Inspecting Details for {edible_id} ---")
    req = urllib.request.urlopen(f"{API_BASE}/partners/prt-ngo-01/donations/{edible_id}")
    detail = json.loads(req.read().decode("utf-8"))
    print(f"Title: {detail['title']}")
    print(f"Donor: {detail['donor_name']} ({detail['donor_email']})")
    print(f"Food Type: {detail['food_type']} | Qty: {detail['quantity']} {detail['unit']}")
    print(f"AI Caption: {detail['ai_analysis']['caption']}")
    print(f"AI Safety Status: {detail['ai_safety_status']}")
    print(f"Match Score: {detail['match_info']['final_score']}% (Rank #{detail['match_info']['rank']})")
    print(f"Pickup Address: {detail['pickup_location']}")
    print(f"Timeline Stages: {len(detail['tracking_timeline'])}")

    assert detail["donor_name"] == "Elena Rostova"
    assert detail["ai_safety_status"] == "Eligible"
    assert len(detail["tracking_timeline"]) == 5
    print("PASS: TEST 03 Passed.")

    # -------------------------------------------------------------
    # TEST 04: NGO accepts donation -> Partner Accepted status
    # -------------------------------------------------------------
    print(f"\n--- TEST 04: NGO Accepting Donation {edible_id} ---")
    req = urllib.request.Request(
        f"{API_BASE}/partners/prt-ngo-01/donations/{edible_id}/accept",
        data=b"{}",
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    res = urllib.request.urlopen(req)
    accepted_doc = json.loads(res.read().decode("utf-8"))
    print(f"New Status: {accepted_doc['status']}")
    assert accepted_doc["status"] == "Accepted"

    # Verify donor tracking also sees the update
    req = urllib.request.urlopen(f"{API_BASE}/donations/{edible_id}")
    donor_view = json.loads(req.read().decode("utf-8"))
    assert donor_view["status"] == "Accepted"
    stage_2 = next(s for s in donor_view["tracking_timeline"] if s["stage_id"] == 2)
    assert stage_2["is_completed"] == True
    print(f"Donor view verified: Stage 2 complete ('{stage_2['detail']}')")
    print("PASS: TEST 04 Passed.")

    # -------------------------------------------------------------
    # TEST 05: NGO schedules collection -> Collection Scheduled status
    # -------------------------------------------------------------
    print(f"\n--- TEST 05: NGO Scheduling Collection for {edible_id} ---")
    sched_payload = {
        "pickup_date": "13-11-2026",
        "pickup_time": "11:30 AM",
        "notes": "Van #2 dispatched with thermal insulation blankets."
    }
    req = urllib.request.Request(
        f"{API_BASE}/partners/prt-ngo-01/donations/{edible_id}/schedule",
        data=json.dumps(sched_payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    res = urllib.request.urlopen(req)
    scheduled_doc = json.loads(res.read().decode("utf-8"))
    print(f"New Status: {scheduled_doc['status']}")
    assert scheduled_doc["status"] == "Collection Scheduled"
    stage_3 = next(s for s in scheduled_doc["tracking_timeline"] if s["stage_id"] == 3)
    assert stage_3["is_completed"] == True
    print(f"Schedule recorded: {stage_3['timestamp']} | {stage_3['detail']}")
    print("PASS: TEST 05 Passed.")

    # -------------------------------------------------------------
    # TEST 06: Partner confirms collection -> Collected status
    # -------------------------------------------------------------
    print(f"\n--- TEST 06: Partner Confirming Collection for {edible_id} ---")
    req = urllib.request.Request(
        f"{API_BASE}/partners/prt-ngo-01/donations/{edible_id}/collect",
        data=b"{}",
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    res = urllib.request.urlopen(req)
    collected_doc = json.loads(res.read().decode("utf-8"))
    print(f"New Status: {collected_doc['status']}")
    assert collected_doc["status"] == "Collected"
    stage_4 = next(s for s in collected_doc["tracking_timeline"] if s["stage_id"] == 4)
    assert stage_4["is_completed"] == True
    print(f"Collection verified: {stage_4['detail']}")
    print("PASS: TEST 06 Passed.")

    # -------------------------------------------------------------
    # TEST 07: Partner completes donation -> Completed status
    # -------------------------------------------------------------
    print(f"\n--- TEST 07: Partner Completing Donation {edible_id} ---")
    req = urllib.request.Request(
        f"{API_BASE}/partners/prt-ngo-01/donations/{edible_id}/complete",
        data=b"{}",
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    res = urllib.request.urlopen(req)
    completed_doc = json.loads(res.read().decode("utf-8"))
    print(f"Final Status: {completed_doc['status']}")
    assert completed_doc["status"] == "Completed"

    # Verify donor tracking reflects full completion
    req = urllib.request.urlopen(f"{API_BASE}/donations/{edible_id}")
    donor_final = json.loads(req.read().decode("utf-8"))
    assert donor_final["status"] == "Completed"
    stage_5 = next(s for s in donor_final["tracking_timeline"] if s["stage_id"] == 5)
    assert stage_5["is_completed"] == True
    print(f"Donor tracking verified complete: {stage_5['detail']}")
    print("PASS: TEST 07 Passed.")

    # -------------------------------------------------------------
    # TEST 08: Unauthorized access check (403 Forbidden)
    # -------------------------------------------------------------
    print("\n--- TEST 08: Security Authorization & Ownership Enforcement ---")
    unauth_url = f"{API_BASE}/partners/prt-rec-03/donations/{edible_id}"
    try:
        urllib.request.urlopen(unauth_url)
        raise AssertionError("Security failure: Recycler was able to access NGO's donation!")
    except urllib.error.HTTPError as e:
        print(f"Verified HTTP status: {e.code} ({e.reason})")
        assert e.code == 403, f"Expected 403 Forbidden, got {e.code}"
    print("PASS: TEST 08 Passed (Unauthorized access denied).")

    # -------------------------------------------------------------
    # TEST 09: Data Persistence Across Server Operations
    # -------------------------------------------------------------
    print("\n--- TEST 09: Verifying Database Persistence in SQLite ---")
    from backend.database import SessionLocal
    from backend.models import Donation, DonationEvent
    db = SessionLocal()
    persisted = db.query(Donation).filter(Donation.id == edible_id).first()
    assert persisted is not None
    assert persisted.status == "Completed"
    events_count = db.query(DonationEvent).filter(DonationEvent.donation_id == edible_id).count()
    assert events_count == 5
    db.close()
    print(f"Direct SQLite Check: Donation {edible_id} has 5 persisted timeline events, status 'Completed'")
    print("PASS: TEST 09 Passed.")

    # -------------------------------------------------------------
    # TEST 10: Rejection Flow Verification
    # -------------------------------------------------------------
    print(f"\n--- TEST 10: Verifying Rejection Workflow on Inedible Item {inedible_id} ---")
    reject_payload = {
        "reason": "Storage Capacity Full",
        "notes": "Composting pit maintenance until next Monday."
    }
    req = urllib.request.Request(
        f"{API_BASE}/partners/prt-rec-03/donations/{inedible_id}/reject",
        data=json.dumps(reject_payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    res = urllib.request.urlopen(req)
    rejected_doc = json.loads(res.read().decode("utf-8"))
    assert rejected_doc["status"] == "Rejected"
    print(f"Rejection verified: Status={rejected_doc['status']} | Reason={rejected_doc['rejection_reason']}")
    print("PASS: TEST 10 Passed.")

    print("\n" + "=" * 70)
    print("ALL 10 TESTS COMPLETED AND 100% VERIFIED!")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
