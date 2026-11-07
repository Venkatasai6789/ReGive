import { DonationCategory, DonationCondition } from '../types/donation';

export interface PresetSample {
  id: string;
  name: string;
  badge: string;
  category: DonationCategory;
  title: string;
  quantity: number;
  unit: string;
  condition: DonationCondition;
  description: string;
  imageUrl: string;
  expiryDate?: string;
  storageCondition?: 'room' | 'fridge' | 'sealed';
  hoursSinceCooked?: number;
}

export const PRESET_SAMPLES: PresetSample[] = [
  {
    id: 'sample-bakery',
    name: 'Fresh Bakery Loaves',
    badge: 'Bakery & Bread',
    category: 'Food',
    title: 'Artisanal Sourdough & Sandwich Bread',
    quantity: 12,
    unit: 'boxes',
    condition: 'New',
    description: 'Surplus bakery loaves packaged this morning. Clean, sealed in food-grade bakery bags, stored at controlled room temperature.',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=80',
    expiryDate: '2026-11-10',
    storageCondition: 'sealed',
    hoursSinceCooked: 3
  },
  {
    id: 'sample-cooked',
    name: 'Hot Prepared Meals',
    badge: 'Prepared Meals',
    category: 'Food',
    title: 'Catered Vegetable Pasta & Rice Trays',
    quantity: 24,
    unit: 'meals',
    condition: 'New',
    description: 'Surplus warm catering trays prepared for university luncheon. Sealed in clean stainless and foil pans, ready for immediate dispatch.',
    imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=700&q=80',
    expiryDate: '2026-11-08',
    storageCondition: 'room',
    hoursSinceCooked: 2
  },
  {
    id: 'sample-produce',
    name: 'Farm-Fresh Produce',
    badge: 'Fresh Produce',
    category: 'Food',
    title: 'Orchard Apples & Seasonal Greens',
    quantity: 16,
    unit: 'crates',
    condition: 'Good',
    description: 'Crisp seasonal apples, carrots, and assorted hearty leafy greens from urban farming initiative. Washed and crated.',
    imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=700&q=80',
    expiryDate: '2026-11-14',
    storageCondition: 'fridge',
    hoursSinceCooked: 0
  },
  {
    id: 'sample-pantry',
    name: 'Sealed Pantry Staples',
    badge: 'Packaged Pantry',
    category: 'Food',
    title: 'Unopened Rice, Pasta & Canned Beans',
    quantity: 30,
    unit: 'packs',
    condition: 'New',
    description: 'Commercial sealed dry goods, white rice sacks, whole grain pasta boxes, and low-sodium canned beans in original cartons.',
    imageUrl: 'https://images.unsplash.com/photo-1584473457406-6240486418e9?auto=format&fit=crop&w=700&q=80',
    expiryDate: '2027-04-15',
    storageCondition: 'sealed',
    hoursSinceCooked: 0
  }
];
