import { TrackingStage, AIAnalysis } from './donation';

export type PartnerScreenType = 'dashboard' | 'requests' | 'history';

export interface PartnerProfile {
  id: string;
  name: string;
  organization_type: string;
  location: string;
  distance_km: number;
  available_capacity: number;
  matching_score: number;
  matching_reasons: string[];
  contact_email?: string;
  contact_phone?: string;
  operating_hours?: string;
  address?: string;
  rating: number;
}

export interface MatchMetrics {
  similarity_score: number;
  proximity_score: number;
  capacity_score: number;
  final_score: number;
  rank: number;
  distance_km: number;
}

export interface PartnerDonationItem {
  id: string;
  donor_id: string;
  donor_name: string;
  donor_email: string;
  donor_phone?: string;
  image_url?: string;
  category: string;
  food_type?: string;
  title: string;
  description?: string;
  quantity: number;
  unit: string;
  condition: string;
  expiry_date?: string;
  storage_condition?: string;
  hours_since_cooked?: number;
  pickup_location: string;
  status: string;
  selected_partner_id?: string;
  partner_name?: string;
  partner_type?: string;
  stream_type?: string;
  ai_safety_status?: string;
  ai_analysis?: AIAnalysis | any;
  match_info?: MatchMetrics;
  tracking_timeline: TrackingStage[];
  scheduled_date?: string;
  scheduled_time?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface PartnerStats {
  pending_count: number;
  accepted_count: number;
  scheduled_count: number;
  completed_count: number;
  total_assigned: number;
  total_quantity_processed: number;
}

export interface PartnerRecentActivityItem {
  id: string;
  donation_id: string;
  donation_title: string;
  stage_id: number;
  label: string;
  timestamp?: string;
  detail?: string;
}

export interface PartnerDashboardData {
  partner: PartnerProfile;
  stats: PartnerStats;
  incoming_preview: PartnerDonationItem[];
  upcoming_collections: PartnerDonationItem[];
  recent_activity: PartnerRecentActivityItem[];
}

export interface RejectPayload {
  reason: string;
  notes?: string;
}

export interface SchedulePayload {
  pickup_date: string;
  pickup_time: string;
  notes?: string;
}
