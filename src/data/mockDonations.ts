import { Donation } from '../types/donation';

export const INITIAL_MOCK_DONATIONS: Donation[] = [
  {
    id: 'DON-2026-1042',
    donorId: 'usr-elena-01',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    category: 'Food',
    title: 'Fresh Artisanal Bread & Morning Bagels',
    description: 'Surplus morning bakery loaves and packaged sesame bagels, baked today. Cleanly sealed in food-safe kraft bakery bags.',
    quantity: 18,
    unit: 'boxes',
    condition: 'New',
    expiryDate: '2026-11-09',
    storageCondition: 'sealed',
    hoursSinceCooked: 3,
    pickupLocation: '34 Baker Street, Central Quarter, Apt 4B',
    status: 'Completed',
    selectedPartnerId: 'prt-01',
    partnerName: 'City Harvest Food Rescue',
    partnerType: 'Food Bank',
    trackingTimeline: [
      { stageId: 1, label: 'Donation Submitted', timestamp: '04 Nov 2026, 09:15', isCompleted: true, isCurrent: false, detail: 'AI verified food safety and shelf-life eligibility.' },
      { stageId: 2, label: 'Partner Accepted', timestamp: '04 Nov 2026, 09:42', isCompleted: true, isCurrent: false, detail: 'City Harvest confirmed cold storage room intake.' },
      { stageId: 3, label: 'Collection Scheduled', timestamp: '04 Nov 2026, 11:30', isCompleted: true, isCurrent: false, detail: 'Courier dispatch assigned: Van Unit #04.' },
      { stageId: 4, label: 'Donation Collected', timestamp: '04 Nov 2026, 14:10', isCompleted: true, isCurrent: false, detail: 'Handover complete. Digital temperature log: 19°C.' },
      { stageId: 5, label: 'Completed', timestamp: '04 Nov 2026, 16:45', isCompleted: true, isCurrent: true, detail: 'Distributed to 42 seniors at St. Jude Community Center.' }
    ],
    createdAt: '2026-11-04T09:15:00Z',
    updatedAt: '2026-11-04T16:45:00Z',
    aiAnalysis: {
      category: 'Food',
      caption: 'A clean crate containing sorted loaves of artisanal sourdough and sesame bagels.',
      confidence: 0.96,
      safetyStatus: 'Eligible',
      safetyExplanation: 'Packaging verified intact, non-perishable baked goods within 48h shelf life window.',
      suggestedUnit: 'boxes',
      suggestedQuantity: 18,
      detectedTags: ['baked goods', 'bread', 'packaged', 'dry food']
    }
  },
  {
    id: 'DON-2026-1089',
    donorId: 'usr-elena-01',
    imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
    category: 'Food',
    title: 'Warm Vegetable Pasta & Rice Banquet Trays',
    description: 'Surplus hot catered meals from university seminar. Stored in covered foil trays, within the 4-hour hot holding window.',
    quantity: 24,
    unit: 'meals',
    condition: 'New',
    expiryDate: '2026-11-08',
    storageCondition: 'room',
    hoursSinceCooked: 2,
    pickupLocation: '34 Baker Street, Central Quarter, Apt 4B',
    status: 'Collection Scheduled',
    selectedPartnerId: 'prt-02',
    partnerName: 'Nourish Together Kitchen',
    partnerType: 'Community Kitchen',
    trackingTimeline: [
      { stageId: 1, label: 'Donation Submitted', timestamp: '06 Nov 2026, 14:20', isCompleted: true, isCurrent: false, detail: 'AI verified 4-hour rule compliance for hot food intake.' },
      { stageId: 2, label: 'Partner Accepted', timestamp: '06 Nov 2026, 14:45', isCompleted: true, isCurrent: false, detail: 'Accepted for evening meal service distribution.' },
      { stageId: 3, label: 'Collection Scheduled', timestamp: '07 Nov 2026, 10:00', isCompleted: true, isCurrent: true, detail: 'Courier slot confirmed for today between 14:00 – 16:00.' },
      { stageId: 4, label: 'Donation Collected', isCompleted: false, isCurrent: false, detail: 'Awaiting cargo-bike driver arrival at pickup address.' },
      { stageId: 5, label: 'Completed', isCompleted: false, isCurrent: false }
    ],
    createdAt: '2026-11-06T14:20:00Z',
    updatedAt: '2026-11-07T10:00:00Z',
    aiAnalysis: {
      category: 'Food',
      caption: 'Stainless and foil hotel pans filled with hot prepared vegetable pasta dishes.',
      confidence: 0.94,
      safetyStatus: 'Eligible',
      safetyExplanation: 'Prepared 2 hours ago; compliant with 4-hour temperature safety protocol.',
      suggestedUnit: 'meals',
      suggestedQuantity: 24,
      detectedTags: ['cooked food', 'meals', 'pasta', 'catering']
    }
  },
  {
    id: 'DON-2026-1102',
    donorId: 'usr-elena-01',
    imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
    category: 'Food',
    title: 'Fresh Orchard Apples & Leafy Greens',
    description: 'Crisp seasonal apples, washed carrots, and fresh spinach. Packaged in breathable wooden farm crates.',
    quantity: 14,
    unit: 'crates',
    condition: 'Good',
    expiryDate: '2026-11-14',
    storageCondition: 'fridge',
    hoursSinceCooked: 0,
    pickupLocation: '34 Baker Street, Central Quarter, Apt 4B',
    status: 'Processing',
    selectedPartnerId: 'prt-03',
    partnerName: 'Hope Table Community Pantry',
    partnerType: 'Food Bank',
    trackingTimeline: [
      { stageId: 1, label: 'Donation Submitted', timestamp: '07 Nov 2026, 08:30', isCompleted: true, isCurrent: true, detail: 'Image evaluated: 98% freshness confidence score.' },
      { stageId: 2, label: 'Partner Accepted', isCompleted: false, isCurrent: false, detail: 'Awaiting Hope Table intake manager confirmation.' },
      { stageId: 3, label: 'Collection Scheduled', isCompleted: false, isCurrent: false },
      { stageId: 4, label: 'Donation Collected', isCompleted: false, isCurrent: false },
      { stageId: 5, label: 'Completed', isCompleted: false, isCurrent: false }
    ],
    createdAt: '2026-11-07T08:30:00Z',
    updatedAt: '2026-11-07T08:30:00Z',
    aiAnalysis: {
      category: 'Food',
      caption: 'Wooden crates stocked with fresh crisp apples, carrots, and assorted greens.',
      confidence: 0.98,
      safetyStatus: 'Eligible',
      safetyExplanation: 'Raw agricultural produce with no visible spoilage or damage.',
      suggestedUnit: 'crates',
      suggestedQuantity: 14,
      detectedTags: ['raw produce', 'fruits', 'vegetables', 'fresh']
    }
  }
];
