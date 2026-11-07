import datetime
from sqlalchemy import (
    Column,
    String,
    Float,
    Integer,
    Boolean,
    DateTime,
    ForeignKey,
    Text
)
from sqlalchemy.orm import relationship
from .database import Base

class Donor(Base):
    __tablename__ = "donors"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    role = Column(String, default="donor")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    donations = relationship("Donation", back_populates="donor")


class Donation(Base):
    __tablename__ = "donations"

    id = Column(String, primary_key=True, index=True)
    donor_id = Column(String, ForeignKey("donors.id"), nullable=False)
    image_path = Column(String, nullable=True)
    category = Column(String, default="Food")
    food_type = Column(String, default="Bakery & Bread")
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    quantity = Column(Float, default=1.0)
    unit = Column(String, default="boxes")
    condition = Column(String, default="Good")
    storage_condition = Column(String, default="sealed")
    hours_since_cooked = Column(Float, default=0.0)
    expiry_date = Column(String, nullable=True)
    pickup_location = Column(String, nullable=False)
    status = Column(String, default="Submitted")
    selected_partner_id = Column(String, ForeignKey("partners.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    donor = relationship("Donor", back_populates="donations")
    ai_analysis = relationship("AIAnalysis", back_populates="donation", uselist=False, cascade="all, delete-orphan")
    matches = relationship("DonationMatch", back_populates="donation", cascade="all, delete-orphan")
    events = relationship("DonationEvent", back_populates="donation", cascade="all, delete-orphan")
    selected_partner = relationship("Partner")


class AIAnalysis(Base):
    __tablename__ = "ai_analyses"

    id = Column(String, primary_key=True, index=True)
    donation_id = Column(String, ForeignKey("donations.id"), nullable=False)
    category = Column(String, default="Food")
    detected_food_type = Column(String, nullable=True)
    caption = Column(Text, nullable=False)
    edibility_score = Column(Float, default=0.95)
    is_edible = Column(Boolean, default=True)
    safety_status = Column(String, default="Eligible")
    safety_explanation = Column(Text, nullable=True)
    suggested_unit = Column(String, default="boxes")
    suggested_quantity = Column(Float, default=1.0)
    confidence = Column(Float, default=0.95)
    detected_tags = Column(Text, default="[]")  # JSON array
    stream_type = Column(String, default="human")  # 'human', 'animal', 'compost', 'biogas'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    donation = relationship("Donation", back_populates="ai_analysis")


class Partner(Base):
    __tablename__ = "partners"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    organization_type = Column(String, nullable=False)  # 'Food Bank', 'Community Kitchen', 'Shelter', 'Recycler'
    stream = Column(String, default="human")  # 'human', 'animal', 'compost', 'biogas'
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    service_radius_km = Column(Float, default=15.0)
    capacity = Column(Integer, default=100)
    description = Column(Text, nullable=False)
    contact_email = Column(String, nullable=True)
    contact_phone = Column(String, nullable=True)
    operating_hours = Column(String, default="Mon – Sun: 08:00 – 20:00")
    address = Column(String, nullable=True)
    rating = Column(Float, default=4.9)


class DonationMatch(Base):
    __tablename__ = "donation_matches"

    id = Column(String, primary_key=True, index=True)
    donation_id = Column(String, ForeignKey("donations.id"), nullable=False)
    partner_id = Column(String, ForeignKey("partners.id"), nullable=False)
    similarity_score = Column(Float, default=0.0)
    proximity_score = Column(Float, default=0.0)
    capacity_score = Column(Float, default=0.0)
    final_score = Column(Float, default=0.0)
    rank = Column(Integer, default=1)
    distance_km = Column(Float, default=0.0)

    donation = relationship("Donation", back_populates="matches")
    partner = relationship("Partner")


class DonationEvent(Base):
    __tablename__ = "donation_events"

    id = Column(String, primary_key=True, index=True)
    donation_id = Column(String, ForeignKey("donations.id"), nullable=False)
    stage_id = Column(Integer, nullable=False)
    label = Column(String, nullable=False)
    timestamp = Column(String, nullable=True)
    is_completed = Column(Boolean, default=False)
    is_current = Column(Boolean, default=False)
    detail = Column(Text, nullable=True)

    donation = relationship("Donation", back_populates="events")
