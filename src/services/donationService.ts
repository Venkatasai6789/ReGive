import { Donation, DonationStatus } from '../types/donation';
import { INITIAL_MOCK_DONATIONS } from '../data/mockDonations';
import { getRecommendedPartners } from './aiAnalysisService';

const API_BASE = "http://127.0.0.1:8000";
const STORAGE_KEY = 'regive_donations_v2';

export const getStoredDonations = (): Donation[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse stored donations, falling back to initial data', err);
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_DONATIONS));
  } catch {
    // Ignore quota issues
  }
  return INITIAL_MOCK_DONATIONS;
};

export const saveDonations = (donations: Donation[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(donations));
  } catch (err) {
    console.error('Failed to save donations to localStorage', err);
  }
};

/**
 * Sync donations from SQLite FastAPI backend
 */
export const syncDonationsFromBackend = async (): Promise<Donation[] | null> => {
  try {
    const resp = await fetch(`${API_BASE}/api/donations`);
    if (resp.ok) {
      const list = await resp.json();
      if (Array.isArray(list) && list.length > 0) {
        const mapped: Donation[] = list.map((item: any) => ({
          id: item.id,
          donorId: item.donor_id,
          imageUrl: item.image_url || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
          category: 'Food',
          title: item.title,
          description: item.description || '',
          quantity: item.quantity,
          unit: item.unit,
          condition: item.condition,
          expiryDate: item.expiry_date,
          storageCondition: item.storage_condition,
          hoursSinceCooked: item.hours_since_cooked,
          pickupLocation: item.pickup_location,
          status: item.status as DonationStatus,
          selectedPartnerId: item.selected_partner_id,
          partnerName: item.partner_name,
          partnerType: item.partner_type,
          trackingTimeline: item.tracking_timeline.map((ev: any) => ({
            stageId: ev.stage_id,
            label: ev.label,
            timestamp: ev.timestamp,
            isCompleted: ev.is_completed,
            isCurrent: ev.is_current,
            detail: ev.detail
          })),
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          aiAnalysis: item.ai_analysis
        }));
        saveDonations(mapped);
        return mapped;
      }
    }
  } catch (err) {
    console.warn("Could not sync from backend SQLite, using local persistence:", err);
  }
  return null;
};

/**
 * Creates donation record, immediately saves to SQLite via FastAPI backend,
 * and maintains local cache synchronization.
 */
export const createDonationRecord = async (
  newDonationData: Omit<Donation, 'id' | 'createdAt' | 'updatedAt' | 'trackingTimeline'>
): Promise<Donation> => {
  const all = getStoredDonations();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  let finalId = `DON-2026-${randomSuffix}`;
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  const initialStatus: DonationStatus = newDonationData.selectedPartnerId
    ? 'Submitted'
    : 'Awaiting Partner';

  const initialTimeline = [
    {
      stageId: 1,
      label: 'Donation Submitted',
      timestamp: `${dateStr}, ${timeStr}`,
      isCompleted: true,
      isCurrent: true,
      detail: 'Food intake classified and safety protocol cleared by AI models.'
    },
    {
      stageId: 2,
      label: 'Partner Accepted',
      timestamp: newDonationData.partnerName ? `${dateStr}, ${timeStr}` : undefined,
      isCompleted: !!newDonationData.selectedPartnerId,
      isCurrent: false,
      detail: newDonationData.partnerName
        ? `${newDonationData.partnerName} notified and locked intake reservation.`
        : 'Awaiting recipient confirmation.'
    },
    {
      stageId: 3,
      label: 'Collection Scheduled',
      isCompleted: false,
      isCurrent: false,
      detail: 'Logistics coordination and time-slot dispatch.'
    },
    {
      stageId: 4,
      label: 'Donation Collected',
      isCompleted: false,
      isCurrent: false,
      detail: 'Driver physical handover at registered address.'
    },
    {
      stageId: 5,
      label: 'Completed',
      isCompleted: false,
      isCurrent: false,
      detail: 'Verified impact receipt issued.'
    }
  ];

  // Persist to SQLite in backend
  const payload = {
    donor_id: newDonationData.donorId || "usr-elena-01",
    image_url: newDonationData.imageUrl,
    category: "Food",
    food_type: newDonationData.aiAnalysis?.detectedFoodType || "Prepared Meals",
    title: newDonationData.title,
    description: newDonationData.description,
    quantity: newDonationData.quantity,
    unit: newDonationData.unit,
    condition: newDonationData.condition,
    storage_condition: newDonationData.storageCondition,
    hours_since_cooked: newDonationData.hoursSinceCooked,
    expiry_date: newDonationData.expiryDate,
    pickup_location: newDonationData.pickupLocation,
    status: initialStatus,
    selected_partner_id: newDonationData.selectedPartnerId,
    partner_name: newDonationData.partnerName,
    partner_type: newDonationData.partnerType,
    ai_analysis: newDonationData.aiAnalysis,
    matches: getRecommendedPartners('Food', newDonationData.pickupLocation).map((p, idx) => ({
      partner_id: p.id,
      similarity_score: 0.85,
      proximity_score: 0.8,
      capacity_score: 0.9,
      final_score: (p.matchingScore || 85) / 100,
      rank: idx + 1,
      distance_km: p.distanceKm || 2.5
    }))
  };

  try {
    const resp = await fetch(`${API_BASE}/api/donations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (resp.ok) {
      const saved = await resp.json();
      finalId = saved.id;
      console.log(`Donation ${finalId} successfully persisted into SQLite database.`);
    }
  } catch (err) {
    console.warn("Could not post donation to backend SQLite:", err);
  }

  const fullRecord: Donation = {
    ...newDonationData,
    id: finalId,
    status: initialStatus,
    trackingTimeline: initialTimeline,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };

  const updated = [fullRecord, ...all];
  saveDonations(updated);
  return fullRecord;
};

export const updateDonationStatus = (
  donationId: string,
  newStatus: DonationStatus,
  statusDetail?: string
): Donation | null => {
  const all = getStoredDonations();
  const index = all.findIndex((d) => d.id === donationId);
  if (index === -1) return null;

  const target = { ...all[index] };
  target.status = newStatus;
  target.updatedAt = new Date().toISOString();

  // Async update SQLite
  fetch(`${API_BASE}/api/donations/${donationId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ status: newStatus, detail: statusDetail || "" })
  }).catch(() => {});

  all[index] = target;
  saveDonations(all);
  return target;
};
