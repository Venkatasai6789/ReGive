import { Partner } from '../types/donation';

export const MOCK_PARTNERS: Partner[] = [
  {
    id: 'prt-01',
    name: 'City Harvest Food Rescue',
    organizationType: 'Food Bank',
    location: 'Downtown District (2.4 km)',
    distanceKm: 2.4,
    acceptedCategories: ['Food'],
    availableCapacity: 88,
    matchingScore: 97,
    matchingReasons: [
      'Accepts perishable hot meals, bakery, and farm produce',
      'Has certified commercial cold-storage and warming units',
      'Same-day temperature-monitored courier available',
      'Within preferred 5 km donation radius'
    ],
    contactEmail: 'intake@cityharvestrescue.org',
    contactPhone: '+1 (555) 382-9012',
    operatingHours: 'Mon – Sat: 07:00 – 19:00',
    address: '450 Harbor Boulevard, Suite 120',
    rating: 4.9
  },
  {
    id: 'prt-02',
    name: 'Nourish Together Kitchen',
    organizationType: 'Community Kitchen',
    location: 'Central Plaza (1.9 km)',
    distanceKm: 1.9,
    acceptedCategories: ['Food'],
    availableCapacity: 80,
    matchingScore: 95,
    matchingReasons: [
      'Daily hot meal program serving 400+ community members',
      'Immediate intake for prepared hot meals and fresh produce',
      'Volunteer cargo-bike pickup within 2 hours'
    ],
    contactEmail: 'kitchen@nourishtogether.org',
    contactPhone: '+1 (555) 431-7721',
    operatingHours: 'Daily: 06:30 – 21:00',
    address: '15 Marketplace Square',
    rating: 5.0
  },
  {
    id: 'prt-03',
    name: 'Hope Table Community Pantry',
    organizationType: 'Food Bank',
    location: 'Northside District (3.2 km)',
    distanceKm: 3.2,
    acceptedCategories: ['Food'],
    availableCapacity: 75,
    matchingScore: 92,
    matchingReasons: [
      'Neighborhood pantry serving over 180 local families weekly',
      'High demand for fresh bakery loaves and canned staples',
      'Equipped with refrigerated intake lockers'
    ],
    contactEmail: 'intake@hopetablepantry.org',
    contactPhone: '+1 (555) 749-2311',
    operatingHours: 'Mon – Sun: 08:00 – 20:00',
    address: '812 Elmwood Avenue',
    rating: 4.8
  },
  {
    id: 'prt-04',
    name: 'Second Chance Shelter & Meal Center',
    organizationType: 'Shelter',
    location: 'West End Community (3.8 km)',
    distanceKm: 3.8,
    acceptedCategories: ['Food'],
    availableCapacity: 82,
    matchingScore: 90,
    matchingReasons: [
      'Serves breakfast and dinner to unhoused youth and families',
      'Immediate absorption capacity for evening catered surplus',
      'Dedicated intake staff for hygiene and temperature checks'
    ],
    contactEmail: 'meals@secondchanceshelter.org',
    contactPhone: '+1 (555) 912-4400',
    operatingHours: 'Daily: 07:00 – 22:00',
    address: '104 West Community Way',
    rating: 4.9
  },
  {
    id: 'prt-05',
    name: 'Saint Jude Bread & Soup Network',
    organizationType: 'Community Kitchen',
    location: 'Southview Parish (4.5 km)',
    distanceKm: 4.5,
    acceptedCategories: ['Food'],
    availableCapacity: 70,
    matchingScore: 88,
    matchingReasons: [
      'Specialized in bread preservation and daily soup kettle service',
      'Partners with local bakeries and supermarkets',
      'Direct distribution to vulnerable senior citizens'
    ],
    contactEmail: 'pantry@stjudesoup.org',
    contactPhone: '+1 (555) 234-8899',
    operatingHours: 'Mon – Fri: 08:00 – 17:00',
    address: '290 Oakridge Street',
    rating: 4.7
  }
];
