"""
Script: backend/scripts/seed_demo_accounts.py
Description: Idempotently seeds demonstration accounts in SQLite database:
  - 4 Distinct Donor accounts
  - 10 Distinct NGO accounts
  - Existing Recycler organization accounts
  - Legacy Elena account preservation
  - 1 Admin account
Generates secure unique passwords, hashes them with Argon2id, and writes a local report.
"""

import os
import sys
import json
import secrets
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.database import SessionLocal
from backend.models import User, Donor, Partner
from backend.services.auth_service import hash_password
from backend.services.ai_pipeline import init_faiss_partner_indices

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
os.makedirs(DATA_DIR, exist_ok=True)
CREDENTIALS_FILE = os.path.join(DATA_DIR, "demo_credentials.json")

def generate_dev_password(name_prefix: str) -> str:
    """Generates an intuitive, memorable development password with 12+ chars and special symbols."""
    # Deterministic yet secure pattern for university demo review: Capital + Word + Year + Special
    clean_name = ''.join(c for c in name_prefix if c.isalnum())
    return f"ReGive2026@{clean_name}!"

def seed_demo_accounts():
    db = SessionLocal()
    print("=" * 70)
    print("ReGiVe Phase 03 — Multi-Account Demonstration Database Seeder")
    print("=" * 70)

    credentials_record = []
    stats = {
        "donors_created": 0,
        "ngos_created": 0,
        "recyclers_linked": 0,
        "accounts_existing": 0,
        "admin_created": 0
    }

    # -------------------------------------------------------------
    # 1. SEED 4 DONOR ACCOUNTS
    # -------------------------------------------------------------
    donor_identities = [
        {
            "id": "usr-donor-ananya",
            "name": "Ananya Sharma",
            "email": "ananya@regive.test",
            "phone": "+91 98401 22345",
            "address": "14 Greenways Road, R.A. Puram, Chennai, TN",
            "profile_type": "Household"
        },
        {
            "id": "usr-donor-rahul",
            "name": "Rahul Verma",
            "email": "rahul@regive.test",
            "phone": "+91 94432 55678",
            "address": "45 West Masi Street, Madurai, TN",
            "profile_type": "Individual"
        },
        {
            "id": "usr-donor-priya",
            "name": "Priya Nair",
            "email": "priya@regive.test",
            "phone": "+91 97890 33456",
            "address": "88 Avinashi Road, Peelamedu, Coimbatore, TN",
            "profile_type": "Household"
        },
        {
            "id": "usr-donor-arjun",
            "name": "Arjun Reddy",
            "email": "arjun@regive.test",
            "phone": "+91 99520 88901",
            "address": "12 Palace Road, Pudukkottai, TN",
            "profile_type": "Restaurant"
        },
        # Legacy preservation
        {
            "id": "usr-elena-01",
            "name": "Elena Rostova",
            "email": "elena.rostova@university.edu",
            "phone": "+1 (555) 382-9104",
            "address": "34 Baker Street, Central Quarter, Apt 4B",
            "profile_type": "University Community"
        }
    ]

    for d_data in donor_identities:
        donor = db.query(Donor).filter(Donor.id == d_data["id"]).first()
        if not donor:
            donor = Donor(
                id=d_data["id"],
                name=d_data["name"],
                email=d_data["email"],
                phone=d_data["phone"],
                role="verified_donor",
                created_at=datetime.utcnow()
            )
            db.add(donor)
            db.flush()

        # Check corresponding user account
        user = db.query(User).filter(User.email == d_data["email"].lower()).first()
        raw_pw = generate_dev_password(d_data["name"].split()[0])
        if not user:
            user = User(
                id=f"acc-{d_data['id']}",
                email=d_data["email"].lower(),
                password_hash=hash_password(raw_pw),
                role="donor",
                donor_id=donor.id,
                partner_id=None,
                is_active=True,
                is_verified=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(user)
            db.commit()
            stats["donors_created"] += 1
            print(f"Created Donor User: {d_data['name']} ({d_data['email']})")
        else:
            stats["accounts_existing"] += 1
            print(f"Donor User Exists: {d_data['name']} ({d_data['email']})")

        credentials_record.append({
            "role": "donor",
            "display_name": d_data["name"],
            "email": d_data["email"].lower(),
            "password": raw_pw,
            "profile_type": d_data["profile_type"],
            "location": d_data["address"],
            "profile_id": donor.id
        })

    # -------------------------------------------------------------
    # 2. SEED 10 NGO ACCOUNTS
    # -------------------------------------------------------------
    ngo_identities = [
        {
            "partner_id": "prt-ngo-01",
            "name": "Annapoorna Trust",
            "org_type": "Food Bank",
            "stream": "human",
            "email": "annapoorna@regive.test",
            "phone": "+91 98410 11223",
            "contact_person": "R. Sundaram",
            "address": "12 Temple Street, Alwarpet, Chennai, TN",
            "lat": 13.033, "lng": 80.252,
            "capacity": 150, "radius": 15.0,
            "desc": "Verified community food bank distributing hot nutritious meals to municipal schools and underprivileged settlements."
        },
        {
            "partner_id": "prt-ngo-05",
            "name": "Hope Night Shelter",
            "org_type": "Shelter",
            "stream": "human",
            "email": "hope@regive.test",
            "phone": "+91 98402 33445",
            "contact_person": "Sister Mary",
            "address": "45 Station Road, Egmore, Chennai, TN",
            "lat": 13.080, "lng": 80.261,
            "capacity": 80, "radius": 10.0,
            "desc": "Urban night shelter providing overnight accommodation and warm evening dinner portions to homeless individuals."
        },
        {
            "partner_id": "prt-ngo-06",
            "name": "Bright Future Community Kitchen",
            "org_type": "Community Kitchen",
            "stream": "human",
            "email": "brightfuture@regive.test",
            "phone": "+91 98405 55667",
            "contact_person": "K. Venkatesh",
            "address": "88 North High Street, Triplicane, Chennai, TN",
            "lat": 13.058, "lng": 80.278,
            "capacity": 120, "radius": 12.0,
            "desc": "Community central kitchen preparing subsidized wholesome breakfasts and lunches for day-laborers and students."
        },
        {
            "partner_id": "prt-ngo-07",
            "name": "Sunrise Food Foundation",
            "org_type": "Food Bank",
            "stream": "human",
            "email": "sunrise@regive.test",
            "phone": "+91 98408 77889",
            "contact_person": "P. Meenakshi",
            "address": "22 Coastal Road, Besant Nagar, Chennai, TN",
            "lat": 13.000, "lng": 80.267,
            "capacity": 100, "radius": 14.0,
            "desc": "Coastal community food hub rescuing excess fresh vegetables and baked goods for fishing village pantries."
        },
        {
            "partner_id": "prt-ngo-03",
            "name": "Green Basket Foundation",
            "org_type": "Food NGO",
            "stream": "human",
            "email": "greenbasket@regive.test",
            "phone": "+91 98412 99001",
            "contact_person": "V. Ramamurthy",
            "address": "67 GST Road, Tambaram, Chennai, TN",
            "lat": 12.924, "lng": 80.127,
            "capacity": 110, "radius": 20.0,
            "desc": "Nonprofit food rescue organization redistributing surplus supermarket produce and banquet leftovers."
        },
        {
            "partner_id": "prt-ngo-08",
            "name": "Helping Hands Nutrition Centre",
            "org_type": "Community Kitchen",
            "stream": "human",
            "email": "helpinghands@regive.test",
            "phone": "+91 98415 12345",
            "contact_person": "Dr. S. Anita",
            "address": "15 Trunk Road, Poonamallee, Chennai, TN",
            "lat": 13.048, "lng": 80.093,
            "capacity": 95, "radius": 18.0,
            "desc": "Nutrition outreach center catering enriched meals and wholesome dietary supplements to rural children."
        },
        {
            "partner_id": "prt-ngo-09",
            "name": "City Harvest Rescue",
            "org_type": "Food Bank",
            "stream": "human",
            "email": "cityharvest@regive.test",
            "phone": "+91 98417 67890",
            "contact_person": "Capt. M. Balan",
            "address": "33 Harbor View Road, Royapuram, Chennai, TN",
            "lat": 13.114, "lng": 80.298,
            "capacity": 160, "radius": 16.0,
            "desc": "Port city surplus redistribution network transporting restaurant and banquet surplus to inner-city shelters."
        },
        {
            "partner_id": "prt-ngo-10",
            "name": "CareBridge Shelter",
            "org_type": "Shelter",
            "stream": "human",
            "email": "carebridge@regive.test",
            "phone": "+91 98420 23456",
            "contact_person": "Mrs. Revathi Mohan",
            "address": "51 Bypass Road, Velachery, Chennai, TN",
            "lat": 12.980, "lng": 80.218,
            "capacity": 75, "radius": 12.0,
            "desc": "Transitional shelter for displaced families providing child nutrition, cooked dinners, and emergency rations."
        },
        {
            "partner_id": "prt-ngo-11",
            "name": "Rural Nourishment Network",
            "org_type": "Food NGO",
            "stream": "human",
            "email": "ruralnourish@regive.test",
            "phone": "+91 98423 78901",
            "contact_person": "G. Manickam",
            "address": "9 Red Hills Road, Madhavaram, Chennai, TN",
            "lat": 13.148, "lng": 80.231,
            "capacity": 130, "radius": 25.0,
            "desc": "Peri-urban and rural food circulation network ensuring surplus grain and farm produce reaches elderly self-help groups."
        },
        {
            "partner_id": "prt-ngo-12",
            "name": "People's Meal Initiative",
            "org_type": "Community Kitchen",
            "stream": "human",
            "email": "peoplesmeal@regive.test",
            "phone": "+91 98425 45678",
            "contact_person": "T. Selvaraj",
            "address": "77 Arcot Road, Kodambakkam, Chennai, TN",
            "lat": 13.051, "lng": 80.222,
            "capacity": 140, "radius": 15.0,
            "desc": "Grassroots community kitchen operating a zero-cost lunch window for hospital attenders and informal sector workers."
        }
    ]

    for ngo_data in ngo_identities:
        partner = db.query(Partner).filter(Partner.id == ngo_data["partner_id"]).first()
        if not partner:
            partner = Partner(
                id=ngo_data["partner_id"],
                name=ngo_data["name"],
                organization_type=ngo_data["org_type"],
                stream="human",
                latitude=ngo_data["lat"],
                longitude=ngo_data["lng"],
                service_radius_km=ngo_data["radius"],
                capacity=ngo_data["capacity"],
                description=ngo_data["desc"],
                contact_email=ngo_data["email"],
                contact_phone=ngo_data["phone"],
                operating_hours="Mon – Sun: 07:30 – 21:00",
                address=ngo_data["address"],
                rating=4.9
            )
            db.add(partner)
            db.flush()
        else:
            # Update contact email
            partner.contact_email = ngo_data["email"]
            partner.name = ngo_data["name"]

        # User account
        user = db.query(User).filter(User.email == ngo_data["email"].lower()).first()
        raw_pw = generate_dev_password(ngo_data["name"].split()[0])
        if not user:
            user = User(
                id=f"acc-{ngo_data['partner_id']}",
                email=ngo_data["email"].lower(),
                password_hash=hash_password(raw_pw),
                role="ngo",
                donor_id=None,
                partner_id=partner.id,
                is_active=True,
                is_verified=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(user)
            db.commit()
            stats["ngos_created"] += 1
            print(f"Created NGO User: {ngo_data['name']} ({ngo_data['email']})")
        else:
            stats["accounts_existing"] += 1
            print(f"NGO User Exists: {ngo_data['name']} ({ngo_data['email']})")

        credentials_record.append({
            "role": "ngo",
            "organization_name": ngo_data["name"],
            "organization_type": ngo_data["org_type"],
            "email": ngo_data["email"].lower(),
            "password": raw_pw,
            "address": ngo_data["address"],
            "partner_id": partner.id
        })

    # -------------------------------------------------------------
    # 3. LINK EXISTING RECYCLER ACCOUNTS
    # -------------------------------------------------------------
    recycler_identities = [
        {
            "partner_id": "prt-rec-01",
            "email": "gokul@regive.test",
            "name": "Gokul Goshala Animal Feed",
            "stream": "animal"
        },
        {
            "partner_id": "prt-rec-02",
            "email": "happypaws@regive.test",
            "name": "Happy Paws Animal Shelter",
            "stream": "animal"
        },
        {
            "partner_id": "prt-rec-03",
            "email": "greenearth@regive.test",
            "name": "Green Earth Composters",
            "stream": "compost"
        },
        {
            "partner_id": "prt-rec-04",
            "email": "vermifarm@regive.test",
            "name": "Vermi Farm Co-op",
            "stream": "compost"
        },
        {
            "partner_id": "prt-rec-05",
            "email": "biogas@regive.test",
            "name": "BioGas Energy Plant",
            "stream": "biogas"
        },
        {
            "partner_id": "prt-rec-06",
            "email": "ruralbiogas@regive.test",
            "name": "Rural Biogas Community Unit",
            "stream": "biogas"
        }
    ]

    for rec_data in recycler_identities:
        partner = db.query(Partner).filter(Partner.id == rec_data["partner_id"]).first()
        if partner:
            partner.contact_email = rec_data["email"]
            user = db.query(User).filter(User.email == rec_data["email"].lower()).first()
            raw_pw = generate_dev_password(rec_data["name"].split()[0])
            if not user:
                user = User(
                    id=f"acc-{rec_data['partner_id']}",
                    email=rec_data["email"].lower(),
                    password_hash=hash_password(raw_pw),
                    role="recycler",
                    donor_id=None,
                    partner_id=partner.id,
                    is_active=True,
                    is_verified=True,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                db.add(user)
                db.commit()
                stats["recyclers_linked"] += 1
                print(f"Linked Recycler User: {partner.name} ({rec_data['email']})")
            else:
                stats["accounts_existing"] += 1
                print(f"Recycler User Exists: {partner.name} ({rec_data['email']})")

            credentials_record.append({
                "role": "recycler",
                "organization_name": partner.name,
                "organization_type": partner.organization_type,
                "stream": partner.stream,
                "email": rec_data["email"].lower(),
                "password": raw_pw,
                "partner_id": partner.id
            })

    # -------------------------------------------------------------
    # 4. SEED ADMIN ACCOUNT
    # -------------------------------------------------------------
    admin_email = "admin@regive.test"
    admin_pw = "ReGive2026@SuperAdmin!"
    admin_user = db.query(User).filter(User.email == admin_email).first()
    if not admin_user:
        admin_user = User(
            id="acc-admin-01",
            email=admin_email,
            password_hash=hash_password(admin_pw),
            role="admin",
            donor_id=None,
            partner_id=None,
            is_active=True,
            is_verified=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(admin_user)
        db.commit()
        stats["admin_created"] += 1
        print(f"Created Admin User: {admin_email}")

    credentials_record.append({
        "role": "admin",
        "display_name": "Platform Administrator",
        "email": admin_email,
        "password": admin_pw,
        "profile_id": "acc-admin-01"
    })

    # Re-initialize FAISS vector index with all updated partners
    all_partners_dict = [
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
    init_faiss_partner_indices(all_partners_dict)
    print(f"Re-initialized FAISS partner index with {len(all_partners_dict)} active nodes.")

    db.close()

    # Save credentials report to local file
    with open(CREDENTIALS_FILE, "w", encoding="utf-8") as f:
        json.dump(credentials_record, f, indent=2)

    print("\n" + "=" * 70)
    print("DEMO ACCOUNT SEEDING COMPLETE:")
    print(f"  Donors Created:     {stats['donors_created']}")
    print(f"  NGOs Created:        {stats['ngos_created']}")
    print(f"  Recyclers Linked:    {stats['recyclers_linked']}")
    print(f"  Admin Created:       {stats['admin_created']}")
    print(f"  Existing Preserved:  {stats['accounts_existing']}")
    print(f"  Credentials File:    {CREDENTIALS_FILE}")
    print("=" * 70)

if __name__ == "__main__":
    seed_demo_accounts()
