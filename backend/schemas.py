from typing import List, Optional
from pydantic import BaseModel, Field

class AIAnalysisResponse(BaseModel):
    category: str = "Food"
    detected_food_type: str = "Bakery & Bread"
    caption: str
    edibility_score: float = 0.95
    is_edible: bool = True
    safety_status: str = "Eligible"
    safety_explanation: str
    suggested_unit: str = "boxes"
    suggested_quantity: float = 1.0
    confidence: float = 0.95
    detected_tags: List[str] = []
    stream_type: str = "human"

    class Config:
        from_attributes = True


class PartnerMatchResponse(BaseModel):
    id: str
    name: str
    organization_type: str
    location: str
    distance_km: float
    available_capacity: int
    matching_score: float
    matching_reasons: List[str]
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    operating_hours: Optional[str] = None
    address: Optional[str] = None
    rating: float = 4.9

    class Config:
        from_attributes = True


class DonationAnalysisResult(BaseModel):
    analysis: AIAnalysisResponse
    recommended_partners: List[PartnerMatchResponse]


class TrackingStageResponse(BaseModel):
    stage_id: int
    label: str
    timestamp: Optional[str] = None
    is_completed: bool = False
    is_current: bool = False
    detail: Optional[str] = None

    class Config:
        from_attributes = True


class DonationCreateRequest(BaseModel):
    donor_id: str = "usr-elena-01"
    image_url: Optional[str] = None
    category: str = "Food"
    food_type: Optional[str] = "Bakery & Bread"
    title: str
    description: Optional[str] = None
    quantity: float = 1.0
    unit: str = "boxes"
    condition: str = "Good"
    storage_condition: Optional[str] = "sealed"
    hours_since_cooked: Optional[float] = 0.0
    expiry_date: Optional[str] = None
    pickup_location: str
    status: str = "Submitted"
    selected_partner_id: Optional[str] = None
    partner_name: Optional[str] = None
    partner_type: Optional[str] = None
    ai_analysis: Optional[dict] = None
    matches: Optional[List[dict]] = None


class DonationResponse(BaseModel):
    id: str
    donor_id: str
    image_url: Optional[str] = None
    category: str
    food_type: Optional[str] = None
    title: str
    description: Optional[str] = None
    quantity: float
    unit: str
    condition: str
    expiry_date: Optional[str] = None
    storage_condition: Optional[str] = None
    hours_since_cooked: Optional[float] = None
    pickup_location: str
    status: str
    selected_partner_id: Optional[str] = None
    partner_name: Optional[str] = None
    partner_type: Optional[str] = None
    tracking_timeline: List[TrackingStageResponse] = []
    ai_analysis: Optional[dict] = None
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
