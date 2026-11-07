export type DonationCategory =
  | 'Food'
  | 'Clothing'
  | 'Books and Educational Materials'
  | 'Household Items'
  | 'Electronics'
  | 'Plastic'
  | 'Paper'
  | 'Metal'
  | 'Other Reusable Materials';

export type DonationCondition = 'New' | 'Good' | 'Usable' | 'Needs Sorting';

export type DonationStatus =
  | 'Submitted'
  | 'Processing'
  | 'Awaiting Partner'
  | 'Accepted'
  | 'Collection Scheduled'
  | 'Collected'
  | 'Completed'
  | 'Rejected'
  | 'Expired';

export type SafetyStatus = 'Eligible' | 'Needs Review' | 'Not Eligible';

export interface TrackingStage {
  stageId: number;
  label: string;
  timestamp?: string;
  isCompleted: boolean;
  isCurrent: boolean;
  detail?: string;
}

export interface AIAnalysis {
  category: DonationCategory;
  detectedFoodType?: string;
  caption: string;
  confidence: number;
  safetyStatus: SafetyStatus;
  safetyExplanation: string;
  suggestedUnit: string;
  suggestedQuantity: number;
  detectedTags: string[];
  edibilityScore?: number;
  isEdible?: boolean;
  streamType?: string;
}

export interface Partner {
  id: string;
  name: string;
  organizationType: 'Food Bank' | 'NGO' | 'Shelter' | 'Recycler' | 'Community Kitchen';
  location: string;
  distanceKm: number;
  acceptedCategories: DonationCategory[];
  availableCapacity: number; // percentage, e.g. 85%
  matchingScore: number; // percentage, e.g. 96%
  matchingReasons: string[];
  contactEmail: string;
  contactPhone: string;
  operatingHours: string;
  address: string;
  rating?: number;
}

export interface Donation {
  id: string;
  donorId: string;
  imageUrl: string;
  category: DonationCategory;
  title: string;
  description: string;
  quantity: number;
  unit: string;
  condition: DonationCondition;
  expiryDate?: string;
  storageCondition?: 'room' | 'fridge' | 'sealed';
  hoursSinceCooked?: number;
  pickupLocation: string;
  status: DonationStatus;
  selectedPartnerId?: string;
  partnerName?: string;
  partnerType?: string;
  trackingTimeline: TrackingStage[];
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  aiAnalysis?: AIAnalysis;
}

export type ScreenType = 'home' | 'create' | 'donations';
