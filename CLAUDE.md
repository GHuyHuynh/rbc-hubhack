# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Community Food Connect is a gamified web platform connecting people experiencing food insecurity with volunteer "Community Heroes" who collect and distribute food from local food banks and farmers markets in Halifax, Nova Scotia.

## Common Commands

```bash
# Development
npm run dev          # Start development server with Turbopack (http://localhost:3000)
npm run build        # Build production bundle with Turbopack
npm start            # Start production server

# Demo Accounts
# Hero: hero@demo.com / demo123
# Requester: requester@demo.com / demo123
```

## Architecture Overview

### Tech Stack
- **Next.js 15** with App Router and Turbopack
- **TypeScript 5** with strict mode
- **Tailwind CSS v4** for styling
- **Zustand** for global auth state management
- **LocalStorage** for all data persistence (users, requests)
- **Shadcn/ui** components with Radix UI primitives

### Path Aliases
- `@/*` maps to `./src/*` (configured in tsconfig.json)

### Dual User System

The application has two distinct user types with completely separate workflows:

1. **Heroes (Volunteers)**: Browse and accept food delivery requests, earn gamification rewards
2. **Requesters**: Submit food assistance requests, track delivery status

All users are stored in localStorage under the key `cfc_users` with a discriminated union type (`'hero' | 'requester'`).

### Data Architecture

**Client-side only architecture** - no backend API. All data persists in browser localStorage:

- **Users**: `src/lib/localStorage.ts` provides CRUD operations
  - Heroes have: points, level, badges, claimedCoupons, averageRating, totalDeliveries
  - Requesters have: deliveryHistory array
- **Requests**: Full lifecycle tracking (pending → accepted → in_progress → completed)
- **Session**: currentUserId stored separately for auth state

Key storage functions:
- `getAllUsers()`, `getUserById()`, `getUserByEmail()`
- `getAllRequests()`, `getRequestById()`, `getRequestsByStatus()`
- `acceptRequest()`, `markRequestInProgress()`, `completeRequest()`
- `updateUser()`, `updateRequest()`

### State Management

**Authentication** is managed via Zustand store (`src/store/authStore.ts`):
```typescript
const { user, login, register, logout, refreshUser } = useAuthStore();
```

Helper hooks:
- `useUser()` - get current user
- `useIsHero()`, `useIsRequester()` - type checks
- `useHero()`, `useRequesterUser()` - type-safe user getters

**All other state** is ephemeral page-level state or directly read from localStorage. No global store for requests/resources.

### Gamification System

Core logic in `src/lib/gamification.ts`:

**Points System**:
- Base: 100 points per delivery
- Bonuses: first of day (+25), on-time (+50), 5-star rating (+25), weekly streak (+200)
- Points determine level and unlock coupons

**5 Levels**: Beginner (0-499) → Helper (500-999) → Hero (1000-2499) → Super Hero (2500-4999) → Champion (5000+)

**8 Badges** (auto-awarded via `checkAndAwardBadges()`):
- Milestone: first_delivery, reliable (5), dedicated (10), champion (25)
- Contextual: early_bird, weekend_warrior, full_cart, neighborhood_hero

**Rewards**: 4-tier coupon system ($5, $10, $20, $50) redeemable with points

Key functions:
- `calculatePoints(bonuses)` - compute points with bonuses
- `determineBonuses(hero, request)` - auto-detect eligible bonuses
- `awardPoints(hero, points)` - add points and update level
- `checkAndAwardBadges(hero)` - check all badge criteria, auto-award new ones
- `claimCoupon(hero, couponId)` - deduct points, generate QR code

### Page Routes

```
/                           # Landing page
/auth/login                 # Login (hero or requester)
/auth/register              # Registration with user type selection

# Hero Routes (volunteers)
/hero/dashboard             # Points, active deliveries, quick actions
/hero/requests              # Browse pending food requests
/hero/requests/[id]         # Request detail with nearby food banks
/hero/profile               # Badges, stats, rewards, leaderboard
/hero/map                   # Interactive map view (WIP)

# Requester Routes
/requester/dashboard        # Request food CTA, active requests
/requester/new-request      # Create new food delivery request
/requester/my-requests      # Track request status, rate deliveries

# Shared
/resources                  # Food banks and farmers markets directory
```

### Type System

All types defined in `src/lib/types.ts`:

**Core discriminated unions**:
- `User = Hero | Requester` (discriminator: `type: 'hero' | 'requester'`)
- `FoodRequest` with `status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'`

**Key interfaces**:
- `Hero extends BaseUser` - includes gamification fields
- `Requester extends BaseUser` - minimal, has deliveryHistory
- `FoodRequest` - complete delivery lifecycle with timestamps
- `Rating` - 5-star rating with timeliness and foodQuality
- `FoodBank`, `FarmersMarket` - resource listings with geo data

**Type guards** in localStorage.ts:
```typescript
isHero(user: User): user is Hero
isRequester(user: User): user is Requester
```

### Constants

Defined in `src/lib/constants.ts`:

- `STORAGE_KEYS` - localStorage key names
- `POINTS` - point values for actions and bonuses
- `LEVELS` - level thresholds and names
- `BADGES` - badge metadata and unlock criteria
- `COUPON_TIERS` - reward tiers with point requirements

### Seed Data

`src/lib/initSeedData.ts` and `src/data/seedData.ts` provide:
- 5 demo heroes with varying progress (0-850 points, levels 0-2)
- 4 demo requesters
- 5 sample food requests in different states
- Auto-initialized via `<SeedDataInitializer />` in root layout

Static resource data:
- `src/data/foodBanks.json` - 10 Halifax food banks with real addresses, hours, contact info
- `src/data/farmersMarkets.json` - 7 regional farmers markets with schedules

### Mobile-First Design

- Fully responsive from 320px
- Bottom navigation component (`<BottomNav />`) for thumb-friendly navigation
- 44px minimum touch targets
- Custom brand colors: Green (#10B981), Blue (#3B82F6), Amber (#F59E0B)

## Development Notes

### Authentication Flow
1. Users register via `/auth/register` → creates user in localStorage with hashed password (bcryptjs)
2. Login sets currentUserId in localStorage and updates Zustand store
3. All pages check auth via `useUser()` hook - redirect if not authenticated
4. Hero/Requester-specific pages check user type and redirect to correct dashboard

### Request Lifecycle
1. Requester creates request via `/requester/new-request` → status: 'pending'
2. Hero views in `/hero/requests` → accepts → status: 'accepted', sets acceptedAt
3. Hero marks in progress → status: 'in_progress', sets inProgressAt
4. Hero marks completed → status: 'completed', sets completedAt
5. Requester rates delivery → adds Rating object to request
6. On completion: `determineBonuses()` → `awardPoints()` → `checkAndAwardBadges()` auto-runs

### Hero Constraints
- Maximum 3 active requests (accepted or in_progress) enforced in `acceptRequest()`
- Active requests shown on dashboard, must complete before accepting more

### Transit Integration (Partial)
- `src/lib/gtfsRealtimeService.ts` - GTFS realtime API wrapper (Halifax Transit)
- `src/lib/transitDirections.ts` - Transit route calculation
- These are partially implemented but not fully integrated into UI yet

### Map Integration (Partial)
- Leaflet and react-leaflet dependencies installed
- `/hero/map` route exists but implementation incomplete
- All requests and resources have lat/lng coordinates ready for mapping
