import { AIAnalysis, DonationCategory, Partner, SafetyStatus } from '../types/donation';
import { MOCK_PARTNERS } from '../data/mockPartners';

const API_BASE = "http://127.0.0.1:8000";

export interface AnalysisInput {
  category: DonationCategory;
  title: string;
  description: string;
  condition: string;
  storageCondition?: 'room' | 'fridge' | 'sealed';
  hoursSinceCooked?: number;
  expiryDate?: string;
  quantity?: number;
  unit?: string;
}

// In-memory cache for latest backend FAISS matched partners
let latestBackendPartners: Partner[] = [];

export const analyzeDonationWithAI = async (
  input: AnalysisInput,
  imageFileOrUrl?: string | File
): Promise<AIAnalysis> => {
  try {
    const formData = new FormData();
    formData.append("category", input.category);
    formData.append("title", input.title || "");
    formData.append("description", input.description || "");
    formData.append("condition", input.condition || "Good");
    formData.append("storage_condition", input.storageCondition || "sealed");
    formData.append("hours_since_cooked", String(input.hoursSinceCooked ?? 0));
    if (input.expiryDate) {
      formData.append("expiry_date", input.expiryDate);
    }
    formData.append("quantity", String(input.quantity ?? 1));
    formData.append("unit", input.unit || "boxes");

    if (imageFileOrUrl instanceof File) {
      formData.append("image", imageFileOrUrl, imageFileOrUrl.name);
    } else if (typeof imageFileOrUrl === "string") {
      if (imageFileOrUrl.startsWith("blob:")) {
        const blob = await fetch(imageFileOrUrl).then((r) => r.blob());
        formData.append("image", blob, "donation_upload.jpg");
      } else {
        formData.append("image_url", imageFileOrUrl);
      }
    }

    const response = await fetch(`${API_BASE}/api/donations/analyze`, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`AI Backend returned HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const analysisData = data.analysis;

    // Update FAISS partner matches from backend
    if (Array.isArray(data.recommended_partners) && data.recommended_partners.length > 0) {
      latestBackendPartners = data.recommended_partners.map((p: any) => ({
        id: p.id,
        name: p.name,
        organizationType: p.organization_type,
        location: p.location,
        distanceKm: p.distance_km,
        acceptedCategories: ['Food'],
        availableCapacity: p.available_capacity,
        matchingScore: p.matching_score,
        matchingReasons: p.matching_reasons,
        contactEmail: p.contact_email,
        contactPhone: p.contact_phone,
        operatingHours: p.operating_hours,
        address: p.address,
        rating: p.rating
      }));
    } else {
      latestBackendPartners = [];
    }

    return {
      category: 'Food',
      detectedFoodType: analysisData.detected_food_type,
      caption: analysisData.caption,
      confidence: analysisData.confidence,
      safetyStatus: analysisData.safety_status as SafetyStatus,
      safetyExplanation: analysisData.safety_explanation,
      suggestedUnit: analysisData.suggested_unit,
      suggestedQuantity: analysisData.suggested_quantity,
      detectedTags: analysisData.detected_tags || [],
      edibilityScore: analysisData.edibility_score,
      isEdible: analysisData.is_edible,
      streamType: analysisData.stream_type
    };
  } catch (err) {
    console.error("AI Model inference error:", err);
    throw err;
  }
};

export const getRecommendedPartners = (
  _category: DonationCategory,
  _pickupLocation: string
): Partner[] => {
  return latestBackendPartners;
};
