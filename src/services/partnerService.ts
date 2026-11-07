import {
  PartnerProfile,
  PartnerDashboardData,
  PartnerDonationItem,
  PartnerRecentActivityItem,
  RejectPayload,
  SchedulePayload
} from '../types/partner';

const API_BASE = 'http://127.0.0.1:8000/api';

export const fetchAllPartners = async (): Promise<PartnerProfile[]> => {
  try {
    const res = await fetch(`${API_BASE}/partners`);
    if (!res.ok) throw new Error('Failed to fetch partners');
    return await res.json();
  } catch (err) {
    console.error('Error in fetchAllPartners:', err);
    return [];
  }
};

export const fetchPartnerProfile = async (partnerId: string): Promise<PartnerProfile | null> => {
  try {
    const res = await fetch(`${API_BASE}/partners/${partnerId}`);
    if (!res.ok) throw new Error(`Partner not found: ${partnerId}`);
    return await res.json();
  } catch (err) {
    console.error(`Error in fetchPartnerProfile for ${partnerId}:`, err);
    return null;
  }
};

export const fetchPartnerDashboard = async (partnerId: string): Promise<PartnerDashboardData | null> => {
  try {
    const res = await fetch(`${API_BASE}/partners/${partnerId}/dashboard`);
    if (!res.ok) throw new Error(`Failed to fetch dashboard for ${partnerId}`);
    return await res.json();
  } catch (err) {
    console.error(`Error in fetchPartnerDashboard for ${partnerId}:`, err);
    return null;
  }
};

export const fetchPartnerDonations = async (
  partnerId: string,
  filters?: { status?: string; category?: string; search?: string }
): Promise<PartnerDonationItem[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters?.search && filters.search.trim()) params.append('search', filters.search.trim());

    const url = `${API_BASE}/partners/${partnerId}/donations?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch partner donations');
    return await res.json();
  } catch (err) {
    console.error(`Error in fetchPartnerDonations for ${partnerId}:`, err);
    return [];
  }
};

export const fetchPartnerDonationDetail = async (
  partnerId: string,
  donationId: string
): Promise<PartnerDonationItem> => {
  const res = await fetch(`${API_BASE}/partners/${partnerId}/donations/${donationId}`);
  if (!res.ok) {
    if (res.status === 403) {
      throw new Error('Unauthorized: This donation is assigned to another partner organization.');
    }
    throw new Error(`Failed to load donation: ${res.statusText}`);
  }
  return await res.json();
};

export const acceptPartnerDonation = async (
  partnerId: string,
  donationId: string
): Promise<PartnerDonationItem> => {
  const res = await fetch(`${API_BASE}/partners/${partnerId}/donations/${donationId}/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Failed to accept donation');
  }
  return await res.json();
};

export const rejectPartnerDonation = async (
  partnerId: string,
  donationId: string,
  payload: RejectPayload
): Promise<PartnerDonationItem> => {
  const res = await fetch(`${API_BASE}/partners/${partnerId}/donations/${donationId}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Failed to reject donation');
  }
  return await res.json();
};

export const schedulePartnerDonation = async (
  partnerId: string,
  donationId: string,
  payload: SchedulePayload
): Promise<PartnerDonationItem> => {
  const res = await fetch(`${API_BASE}/partners/${partnerId}/donations/${donationId}/schedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Failed to schedule donation');
  }
  return await res.json();
};

export const collectPartnerDonation = async (
  partnerId: string,
  donationId: string
): Promise<PartnerDonationItem> => {
  const res = await fetch(`${API_BASE}/partners/${partnerId}/donations/${donationId}/collect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Failed to confirm collection');
  }
  return await res.json();
};

export const completePartnerDonation = async (
  partnerId: string,
  donationId: string
): Promise<PartnerDonationItem> => {
  const res = await fetch(`${API_BASE}/partners/${partnerId}/donations/${donationId}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Failed to complete donation');
  }
  return await res.json();
};

export const fetchPartnerActivity = async (
  partnerId: string
): Promise<PartnerRecentActivityItem[]> => {
  try {
    const res = await fetch(`${API_BASE}/partners/${partnerId}/activity`);
    if (!res.ok) throw new Error('Failed to fetch activity');
    return await res.json();
  } catch (err) {
    console.error(`Error in fetchPartnerActivity for ${partnerId}:`, err);
    return [];
  }
};
