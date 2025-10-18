// Core type definitions for Community Food Connect

export type UserType = 'hero' | 'requester';
export type TransportMethod = 'car' | 'bike' | 'walking' | 'transit';

export type RequestStatus =
  | 'pending'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type FoodType =
  | 'produce'
  | 'canned_goods'
  | 'bread'
  | 'dairy'
  | 'mixed';

export type Quantity = 'single' | 'family_2_4' | 'family_5_plus';

export type DeliveryTimeliness = 'on_time' | 'slightly_late' | 'late';
export type FoodQuality = 'good' | 'acceptable' | 'poor';

// User Types
export interface BaseUser {
  id: string;
  email: string;
  password: string; // hashed
  name: string;
  phone: string;
  neighborhood: string;
  type: UserType;
  createdAt: string;
}

export interface Hero extends BaseUser {
  type: 'hero';
  transportMethod: TransportMethod;
  points: number;
  level: number;
  badges: string[]; // badge IDs
  claimedCoupons: string[]; // coupon IDs
  averageRating: number;
  totalDeliveries: number;
}

export interface Requester extends BaseUser {
  type: 'requester';
  deliveryHistory: string[]; // request IDs
}

export type User = Hero | Requester;

// Food Request
export interface FoodRequest {
  id: string;
  requesterId: string;
  heroId: string | null;
  status: RequestStatus;
  foodType: FoodType;
  quantity: Quantity;
  deliveryAddress: string;
  deliveryLat: number;
  deliveryLng: number;
  preferredTimeStart: string; // ISO date
  preferredTimeEnd: string; // ISO date
  specialNotes: string;
  contactMethod: string;
  rating: Rating | null;
  createdAt: string;
  acceptedAt: string | null;
  inProgressAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
}

// Rating & Feedback
export interface Rating {
  stars: number; // 1-5
  feedback: string;
  timeliness: DeliveryTimeliness;
  foodQuality: FoodQuality;
  createdAt: string;
}

// Food Resources
export interface FoodBank {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  hours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  phone: string;
  email: string;
  website: string;
  requirements: string;
  foodTypes: FoodType[];
  specialPrograms: string[];
  accessibilityNotes: string;
  languages: string[];
}

export interface FarmersMarket {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  schedule: {
    [key: string]: string; // day of week -> hours
  };
  seasonal: boolean;
  months: string;
  phone: string;
  website: string;
  vendors: string;
  acceptsPayment: string[];
  parkingAvailable: boolean;
  transitAccessible: boolean;
  nearestBusStop: string;
}

// Gamification
export type BadgeId =
  | 'first_delivery'
  | 'reliable'
  | 'dedicated'
  | 'champion'
  | 'early_bird'
  | 'weekend_warrior'
  | 'full_cart'
  | 'neighborhood_hero';

export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  requirement: number; // number needed to unlock
}

export interface Coupon {
  id: string;
  value: number; // dollar amount
  business: string;
  description: string;
  pointsRequired: number;
  qrCode?: string; // generated on claim
  claimedAt?: string;
  expiresAt?: string; // 90 days from claim
}

export type LevelName = 'Beginner' | 'Helper' | 'Hero' | 'Super Hero' | 'Champion';

export interface Level {
  name: LevelName;
  minPoints: number;
  maxPoints: number;
  color?: string;
}

// GTFS Types
export interface GTFSStop {
  stop_id: string;
  stop_code: string;
  stop_name: string;
  stop_lat: number;
  stop_lon: number;
  zone_id: string;
}

export interface GTFSRoute {
  route_id: string;
  route_short_name: string;
  route_long_name: string;
  route_type: string;
}

export interface GTFSTrip {
  route_id: string;
  service_id: string;
  trip_id: string;
  trip_headsign: string;
  direction_id: string;
}

export interface GTFSStopTime {
  trip_id: string;
  arrival_time: string;
  departure_time: string;
  stop_id: string;
  stop_sequence: number;
}

export interface TransitRoute {
  routeNumber: string;
  routeName: string;
  fromStop: GTFSStop;
  toStop: GTFSStop;
  nextDepartures: string[]; // times
  estimatedDuration: number; // minutes
  walkingDistanceToStop: number; // meters
  walkingDistanceFromStop: number; // meters
}

// LocalStorage Data Structure
export interface AppData {
  users: User[];
  requests: FoodRequest[];
  currentUserId: string | null;
}

// Point Calculation Bonus
export interface PointBonus {
  firstOfDay?: boolean;
  onTime?: boolean;
  fiveStarRating?: boolean;
  weeklyStreak?: boolean;
}
