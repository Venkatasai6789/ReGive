import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.database import engine, Base, SessionLocal
from backend.models import Partner
from backend.services.ai_pipeline import init_faiss_partner_indices
from backend.routes.donations import router as donations_router
from backend.routes.partners import router as partners_router
from backend.seed import seed_database

# Ensure database tables exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ReGiVe AI Food Donation API",
    description="Production-grade FastAPI backend with CLIP, BLIP, MiniLM and FAISS food routing",
    version="2.0.0"
)

# CORS configuration for Vite Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file mount for uploads
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Test images mount for demo inspection
TEST_IMG_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "test_images")
if os.path.exists(TEST_IMG_DIR):
    app.mount("/test-images", StaticFiles(directory=TEST_IMG_DIR), name="test-images")

# Include Routers
app.include_router(donations_router)
app.include_router(partners_router)

@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    partners_count = db.query(Partner).count()
    if partners_count == 0:
        print("Database unseeded. Running seed script...")
        db.close()
        seed_database()
        db = SessionLocal()

    # Pre-initialize FAISS indices
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
    db.close()
    print("ReGiVe FastAPI Backend & AI Pipeline initialized.")

@app.get("/")
def root():
    return {
        "platform": "ReGiVe AI Food Resource Circulation Loop",
        "status": "operational",
        "docs_url": "/docs",
        "api_version": "2.0.0"
    }

@app.get("/health")
def health():
    return {"status": "healthy", "service": "regive-backend"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=False)
