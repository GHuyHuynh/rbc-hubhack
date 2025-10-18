import type { Badge, Level, LevelName } from './types';

// App Configuration
export const APP_NAME = 'Community Food Connect';
export const HALIFAX_CENTER = { lat: 44.6488, lng: -63.5752 };
export const MAX_ACTIVE_REQUESTS = 3;

// Points Configuration
export const POINTS = {
  DELIVERY_BASE: 100,
  FIRST_OF_DAY_BONUS: 25,
  ON_TIME_BONUS: 50,
  FIVE_STAR_BONUS: 25,
  WEEKLY_STREAK_BONUS: 200,
} as const;

// Level Configuration
export const LEVELS: Record<LevelName, Level> = {
  'Beginner': { name: 'Beginner', minPoints: 0, maxPoints: 499 },
  'Helper': { name: 'Helper', minPoints: 500, maxPoints: 999 },
  'Hero': { name: 'Hero', minPoints: 1000, maxPoints: 2499 },
  'Super Hero': { name: 'Super Hero', minPoints: 2500, maxPoints: 4999 },
  'Champion': { name: 'Champion', minPoints: 5000, maxPoints: Infinity },
};

export const LEVEL_ORDER: LevelName[] = [
  'Beginner',
  'Helper',
  'Hero',
  'Super Hero',
  'Champion',
];

// Badge Configuration
export const BADGES: Record<string, Badge> = {
  first_delivery: {
    id: 'first_delivery',
    name: 'First Delivery',
    description: 'Complete your first delivery',
    icon: '🎉',
    criteria: 'deliveries',
    requirement: 1,
  },
  reliable: {
    id: 'reliable',
    name: 'Reliable',
    description: 'Complete 5 deliveries',
    icon: '⭐',
    criteria: 'deliveries',
    requirement: 5,
  },
  dedicated: {
    id: 'dedicated',
    name: 'Dedicated',
    description: 'Complete 10 deliveries',
    icon: '💪',
    criteria: 'deliveries',
    requirement: 10,
  },
  champion: {
    id: 'champion',
    name: 'Community Champion',
    description: 'Complete 25 deliveries',
    icon: '🏆',
    criteria: 'deliveries',
    requirement: 25,
  },
  early_bird: {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete 3 morning deliveries (before 10am)',
    icon: '🌅',
    criteria: 'morning_deliveries',
    requirement: 3,
  },
  weekend_warrior: {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Complete 5 weekend deliveries',
    icon: '🎯',
    criteria: 'weekend_deliveries',
    requirement: 5,
  },
  full_cart: {
    id: 'full_cart',
    name: 'Full Cart',
    description: 'Deliver family-size orders 5 times',
    icon: '🛒',
    criteria: 'family_deliveries',
    requirement: 5,
  },
  neighborhood_hero: {
    id: 'neighborhood_hero',
    name: 'Neighborhood Hero',
    description: 'Complete 10 deliveries in the same area',
    icon: '🏘️',
    criteria: 'neighborhood_deliveries',
    requirement: 10,
  },
};

// Coupon Configuration
export const COUPON_TIERS = [
  {
    id: 'coffee_5',
    value: 5,
    business: 'Local Coffee Shop',
    description: '$5 off your next purchase',
    pointsRequired: 500,
  },
  {
    id: 'grocery_10',
    value: 10,
    business: 'Community Grocery',
    description: '$10 off groceries',
    pointsRequired: 1000,
  },
  {
    id: 'restaurant_20',
    value: 20,
    business: 'Halifax Restaurant',
    description: '$20 dining credit',
    pointsRequired: 2500,
  },
  {
    id: 'giftcard_50',
    value: 50,
    business: 'Local Business Alliance',
    description: '$50 gift card',
    pointsRequired: 5000,
  },
];

// Status Colors
export const STATUS_COLORS = {
  pending: '#FBBF24', // Yellow
  accepted: '#3B82F6', // Blue
  in_progress: '#8B5CF6', // Purple
  completed: '#10B981', // Green
  cancelled: '#6B7280', // Gray
} as const;

// Brand Colors (matching PRD)
export const COLORS = {
  primary: '#10B981', // Green
  secondary: '#3B82F6', // Blue
  accent: '#F59E0B', // Amber
  background: '#FFFFFF',
  cardBg: '#F9FAFB',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
} as const;

// Food Type Labels
export const FOOD_TYPE_LABELS = {
  produce: '🥬 Produce',
  canned_goods: '🥫 Canned Goods',
  bread: '🍞 Bread & Bakery',
  dairy: '🥛 Dairy',
  mixed: '📦 Mixed Box',
} as const;

// Quantity Labels
export const QUANTITY_LABELS = {
  single: 'Single Person',
  family_2_4: 'Family of 2-4',
  family_5_plus: 'Family of 5+',
} as const;

// Transit Configuration
export const TRANSIT_CONFIG = {
  MAX_WALKING_DISTANCE: 500, // meters to nearest stop
  GTFS_FEED_URL: 'https://gtfs.halifax.ca/static/google_transit.zip',
  DEPARTURE_LIMIT: 3, // show next 3 departures
  ROUTE_SUGGESTIONS: 3, // show up to 3 route options
} as const;

// LocalStorage Keys
export const STORAGE_KEYS = {
  USERS: 'cfc_users',
  REQUESTS: 'cfc_requests',
  CURRENT_USER: 'cfc_current_user',
  SEED_VERSION: 'cfc_seed_version',
} as const;

// Date/Time Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM d, yyyy',
  DISPLAY_WITH_TIME: 'MMM d, yyyy h:mm a',
  TIME_ONLY: 'h:mm a',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
} as const;
