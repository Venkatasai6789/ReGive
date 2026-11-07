import os
import json
from datetime import datetime
from backend.database import engine, Base, SessionLocal
from backend.models import Donor, Partner, Donation, AIAnalysis, DonationEvent
from backend.services.ai_pipeline import init_faiss_partner_indices

def seed_database():
    print("Creating tables in regive.db...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    # 1. Seed Donor
    donor = db.query(Donor).filter(Donor.id == "usr-elena-01").first()
    if not donor:
        donor = Donor(
            id="usr-elena-01",
            name="Elena Rostova",
            email="elena.rostova@university.edu",
            phone="+1 (555) 234-5678",
            role="verified_donor",
            created_at=datetime.utcnow()
        )
        db.add(donor)
        print("Seeded default donor Elena Rostova (usr-elena-01)")

    # 2. Seed Seed Partners from Notebook
    partners_data = [
        # NGOs (Human consumption)
        {
            "id": "prt-ngo-01",
            "name": "Annapoorna Trust",
            "organization_type": "Food Bank",
            "stream": "human",
            "latitude": 10.38,
            "longitude": 78.82,
            "service_radius_km": 15.0,
            "capacity": 150,
            "description": "Serves hot cooked meals like rice, sambar, curry and chicken to homeless people and daily wage workers",
            "contact_email": "intake@annapoornatrust.org",
            "contact_phone": "+91 98401 22334",
            "operating_hours": "Daily: 06:00 – 21:00",
            "address": "45 Temple Road, Downtown District",
            "rating": 4.9
        },
        {
            "id": "prt-ngo-02",
            "name": "Little Hands Orphanage",
            "organization_type": "Shelter",
            "stream": "human",
            "latitude": 10.40,
            "longitude": 78.80,
            "service_radius_km": 12.0,
            "capacity": 60,
            "description": "Children's home that accepts bread, bakery items, fruits, biscuits, sweets and milk",
            "contact_email": "care@littlehands.org",
            "contact_phone": "+91 98402 33445",
            "operating_hours": "Daily: 07:00 – 19:00",
            "address": "12 Garden Street, West End",
            "rating": 5.0
        },
        {
            "id": "prt-ngo-03",
            "name": "Green Basket Foundation",
            "organization_type": "Food Bank",
            "stream": "human",
            "latitude": 10.35,
            "longitude": 78.85,
            "service_radius_km": 20.0,
            "capacity": 200,
            "description": "Distributes fresh vegetables and fruits to low-income families",
            "contact_email": "produce@greenbasket.org",
            "contact_phone": "+91 98403 44556",
            "operating_hours": "Mon – Sat: 08:00 – 18:00",
            "address": "88 Agri Market Road, East Extension",
            "rating": 4.8
        },
        {
            "id": "prt-ngo-04",
            "name": "Sunset Elders Home",
            "organization_type": "Community Kitchen",
            "stream": "human",
            "latitude": 10.42,
            "longitude": 78.78,
            "service_radius_km": 10.0,
            "capacity": 40,
            "description": "Old age home that needs soft cooked food like rice, soup, idli, fruits and milk",
            "contact_email": "meals@sunsetelders.org",
            "contact_phone": "+91 98404 55667",
            "operating_hours": "Daily: 07:00 – 20:00",
            "address": "204 Hill View Avenue",
            "rating": 4.9
        },
        {
            "id": "prt-ngo-05",
            "name": "Hope Night Shelter",
            "organization_type": "Shelter",
            "stream": "human",
            "latitude": 10.37,
            "longitude": 78.83,
            "service_radius_km": 15.0,
            "capacity": 120,
            "description": "Night shelter providing dinner such as cooked rice, noodles, curry and bread to homeless people",
            "contact_email": "support@hopenightshelter.org",
            "contact_phone": "+91 98405 66778",
            "operating_hours": "Daily: 17:00 – 23:00",
            "address": "15 Station Road, Central Quarter",
            "rating": 4.8
        },
        {
            "id": "prt-ngo-06",
            "name": "Bright Future School Meals",
            "organization_type": "Food Bank",
            "stream": "human",
            "latitude": 10.39,
            "longitude": 78.86,
            "service_radius_km": 18.0,
            "capacity": 250,
            "description": "School meal program for children that accepts cooked meals, packaged snacks, biscuits and fruits",
            "contact_email": "lunch@brightfutureschool.org",
            "contact_phone": "+91 98406 77889",
            "operating_hours": "Mon – Fri: 08:00 – 16:00",
            "address": "100 Education Lane",
            "rating": 4.9
        },
        # Recyclers (Organic Recovery Streams)
        {
            "id": "prt-rec-01",
            "name": "Gokul Goshala Animal Feed",
            "organization_type": "Recycler",
            "stream": "animal",
            "latitude": 10.36,
            "longitude": 78.84,
            "service_radius_km": 25.0,
            "capacity": 500,
            "description": "Cattle shelter that accepts stale bread, vegetable peels, fruit scraps and dry leftovers as animal feed",
            "contact_email": "feed@gokulgoshala.org",
            "contact_phone": "+91 98407 88990",
            "operating_hours": "Daily: 06:00 – 18:00",
            "address": "Rural Pastures, Sector 4",
            "rating": 4.9
        },
        {
            "id": "prt-rec-02",
            "name": "Happy Paws Animal Shelter",
            "organization_type": "Recycler",
            "stream": "animal",
            "latitude": 10.41,
            "longitude": 78.81,
            "service_radius_km": 15.0,
            "capacity": 300,
            "description": "Dog and cat shelter that accepts leftover rice, bread and cooked scraps without mold",
            "contact_email": "rescue@happypaws.org",
            "contact_phone": "+91 98408 99001",
            "operating_hours": "Daily: 08:00 – 19:00",
            "address": "77 Pet Sanctuary Drive",
            "rating": 4.8
        },
        {
            "id": "prt-rec-03",
            "name": "Green Earth Composters",
            "organization_type": "Recycler",
            "stream": "compost",
            "latitude": 10.34,
            "longitude": 78.87,
            "service_radius_km": 30.0,
            "capacity": 1000,
            "description": "Composting unit that turns spoiled food, rotten fruits, vegetable waste and peels into organic compost",
            "contact_email": "intake@greenearthcompost.org",
            "contact_phone": "+91 98409 00112",
            "operating_hours": "Mon – Sat: 08:00 – 18:00",
            "address": "Eco Industrial Park, Plot 21",
            "rating": 4.9
        },
        {
            "id": "prt-rec-04",
            "name": "Vermi Farm Co-op",
            "organization_type": "Recycler",
            "stream": "compost",
            "latitude": 10.43,
            "longitude": 78.79,
            "service_radius_km": 25.0,
            "capacity": 800,
            "description": "Vermicompost farm that accepts rotten vegetables, fruit waste and spoiled food",
            "contact_email": "farm@vermifarmcoop.org",
            "contact_phone": "+91 98410 11223",
            "operating_hours": "Mon – Sat: 07:00 – 17:00",
            "address": "Riverbank Agricultural Zone",
            "rating": 4.7
        },
        {
            "id": "prt-rec-05",
            "name": "BioGas Energy Plant",
            "organization_type": "Recycler",
            "stream": "biogas",
            "latitude": 10.33,
            "longitude": 78.88,
            "service_radius_km": 40.0,
            "capacity": 2000,
            "description": "Biogas plant converting food waste, bones, meat waste and cooked leftovers into biogas fuel",
            "contact_email": "power@biogasenergy.org",
            "contact_phone": "+91 98411 22334",
            "operating_hours": "24/7 Operations",
            "address": "Renewable Energy Corridor, Phase II",
            "rating": 4.9
        },
        {
            "id": "prt-rec-06",
            "name": "Rural Biogas Community Unit",
            "organization_type": "Recycler",
            "stream": "biogas",
            "latitude": 10.45,
            "longitude": 78.75,
            "service_radius_km": 30.0,
            "capacity": 1200,
            "description": "Community biogas digester that accepts kitchen waste, bones and meat scraps to produce cooking gas",
            "contact_email": "village@ruralbiogas.org",
            "contact_phone": "+91 98412 33445",
            "operating_hours": "Daily: 07:00 – 19:00",
            "address": "Gram Panchayat Center",
            "rating": 4.8
        }
    ]

    for p_dict in partners_data:
        existing = db.query(Partner).filter(Partner.id == p_dict["id"]).first()
        if not existing:
            p = Partner(**p_dict)
            db.add(p)

    db.commit()
    print(f"Seeded {len(partners_data)} verified food rescue & recovery partners.")

    # 3. Seed Initial Historical Food Donations
    initial_donations = [
        {
            "id": "DON-2026-1042",
            "donor_id": "usr-elena-01",
            "image_path": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
            "category": "Food",
            "food_type": "Bakery & Bread",
            "title": "Fresh Artisanal Bread & Morning Bagels",
            "description": "Surplus morning bakery loaves and packaged sesame bagels, baked today. Cleanly sealed in food-safe kraft bakery bags.",
            "quantity": 18.0,
            "unit": "boxes",
            "condition": "New",
            "storage_condition": "sealed",
            "hours_since_cooked": 3.0,
            "expiry_date": "2026-11-09",
            "pickup_location": "34 Baker Street, Central Quarter, Apt 4B",
            "status": "Completed",
            "selected_partner_id": "prt-ngo-01",
            "created_at": datetime(2026, 11, 4, 9, 15),
            "updated_at": datetime(2026, 11, 4, 16, 45)
        },
        {
            "id": "DON-2026-1089",
            "donor_id": "usr-elena-01",
            "image_path": "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80",
            "category": "Food",
            "food_type": "Prepared Meals",
            "title": "Warm Vegetable Pasta & Rice Banquet Trays",
            "description": "Surplus hot catered meals from university seminar. Stored in covered foil trays, within the 4-hour hot holding window.",
            "quantity": 24.0,
            "unit": "meals",
            "condition": "New",
            "storage_condition": "room",
            "hours_since_cooked": 2.0,
            "expiry_date": "2026-11-08",
            "pickup_location": "34 Baker Street, Central Quarter, Apt 4B",
            "status": "Collection Scheduled",
            "selected_partner_id": "prt-ngo-05",
            "created_at": datetime(2026, 11, 6, 14, 20),
            "updated_at": datetime(2026, 11, 7, 10, 0)
        },
        {
            "id": "DON-2026-1102",
            "donor_id": "usr-elena-01",
            "image_path": "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80",
            "category": "Food",
            "food_type": "Fresh Produce",
            "title": "Fresh Orchard Apples & Leafy Greens",
            "description": "Crisp seasonal apples, washed carrots, and fresh spinach. Packaged in breathable wooden farm crates.",
            "quantity": 14.0,
            "unit": "crates",
            "condition": "Good",
            "storage_condition": "fridge",
            "hours_since_cooked": 0.0,
            "expiry_date": "2026-11-14",
            "pickup_location": "34 Baker Street, Central Quarter, Apt 4B",
            "status": "Processing",
            "selected_partner_id": "prt-ngo-03",
            "created_at": datetime(2026, 11, 7, 8, 30),
            "updated_at": datetime(2026, 11, 7, 8, 30)
        }
    ]

    for d_dict in initial_donations:
        existing_don = db.query(Donation).filter(Donation.id == d_dict["id"]).first()
        if not existing_don:
            don = Donation(**d_dict)
            db.add(don)
            db.flush()

            # Add AI Analysis
            ai = AIAnalysis(
                id=f"ai-{d_dict['id']}",
                donation_id=d_dict["id"],
                category="Food",
                detected_food_type=d_dict["food_type"],
                caption=d_dict["title"],
                edibility_score=0.96,
                is_edible=True,
                safety_status="Eligible",
                safety_explanation="Packaging verified intact, non-perishable baked goods within 48h shelf life window.",
                suggested_unit=d_dict["unit"],
                suggested_quantity=d_dict["quantity"],
                confidence=0.96,
                detected_tags=json.dumps(["food", "perishable", "nourishment"]),
                stream_type="human",
                created_at=d_dict["created_at"]
            )
            db.add(ai)

            # Add Tracking Timeline
            events_data = [
                {"stage_id": 1, "label": "Donation Submitted", "timestamp": "04 Nov 2026, 09:15", "is_completed": True, "is_current": False, "detail": "AI verified food safety and shelf-life eligibility."},
                {"stage_id": 2, "label": "Partner Accepted", "timestamp": "04 Nov 2026, 09:42", "is_completed": True, "is_current": False, "detail": "Partner confirmed cold storage room intake."},
                {"stage_id": 3, "label": "Collection Scheduled", "timestamp": "04 Nov 2026, 11:30", "is_completed": True, "is_current": False, "detail": "Courier dispatch assigned."},
                {"stage_id": 4, "label": "Donation Collected", "timestamp": "04 Nov 2026, 14:10", "is_completed": True, "is_current": False, "detail": "Handover complete. Digital temperature logged."},
                {"stage_id": 5, "label": "Completed", "timestamp": "04 Nov 2026, 16:45", "is_completed": True, "is_current": True, "detail": "Distributed to community center beneficiaries."}
            ]
            for ev in events_data:
                event = DonationEvent(
                    id=f"ev-{d_dict['id']}-{ev['stage_id']}",
                    donation_id=d_dict["id"],
                    **ev
                )
                db.add(event)

    db.commit()
    print("Seeded initial donations and tracking timelines.")

    # Initialize FAISS Index
    all_partners = [
        {
            "id": p.id,
            "name": p.name,
            "organization_type": p.organization_type,
            "stream": p.stream,
            "latitude": p.latitude,
            "longitude": p.longitude,
            "service_radius_km": p.service_radius_km,
            "capacity": p.capacity,
            "description": p.description,
            "contact_email": p.contact_email,
            "contact_phone": p.contact_phone,
            "operating_hours": p.operating_hours,
            "address": p.address,
            "rating": p.rating
        }
        for p in db.query(Partner).all()
    ]
    init_faiss_partner_indices(all_partners)
    print("FAISS vector indices initialized successfully.")
    db.close()

if __name__ == "__main__":
    seed_database()
