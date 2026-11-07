from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Partner
from backend.schemas import PartnerMatchResponse

router = APIRouter(prefix="/api/partners", tags=["Partners"])

@router.get("", response_model=List[PartnerMatchResponse])
def get_partners(
    stream: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Returns registered and verified partner organizations.
    """
    query = db.query(Partner)
    if stream:
        query = query.filter(Partner.stream == stream)
    partners = query.all()

    result = []
    for p in partners:
        result.append(
            PartnerMatchResponse(
                id=p.id,
                name=p.name,
                organization_type=p.organization_type,
                location=f"{p.address or 'Local'} ({round(p.service_radius_km / 2, 1)} km)",
                distance_km=round(p.service_radius_km / 2, 1),
                available_capacity=p.capacity,
                matching_score=round(p.rating * 20, 1),
                matching_reasons=[
                    f"Verified {p.organization_type} on the ReGiVe circulation network",
                    f"Intake capacity: up to {p.capacity} meal portions",
                    f"Operating hours: {p.operating_hours}"
                ],
                contact_email=p.contact_email,
                contact_phone=p.contact_phone,
                operating_hours=p.operating_hours,
                address=p.address,
                rating=p.rating
            )
        )
    return result

@router.get("/{partner_id}", response_model=PartnerMatchResponse)
def get_partner(
    partner_id: str,
    db: Session = Depends(get_db)
):
    """
    Returns a single verified partner by ID.
    """
    p = db.query(Partner).filter(Partner.id == partner_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Partner not found")

    return PartnerMatchResponse(
        id=p.id,
        name=p.name,
        organization_type=p.organization_type,
        location=f"{p.address or 'Local'} ({round(p.service_radius_km / 2, 1)} km)",
        distance_km=round(p.service_radius_km / 2, 1),
        available_capacity=p.capacity,
        matching_score=round(p.rating * 20, 1),
        matching_reasons=[
            f"Verified {p.organization_type} on the ReGiVe circulation network",
            f"Intake capacity: up to {p.capacity} meal portions",
            f"Operating hours: {p.operating_hours}"
        ],
        contact_email=p.contact_email,
        contact_phone=p.contact_phone,
        operating_hours=p.operating_hours,
        address=p.address,
        rating=p.rating
    )
