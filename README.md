# Community Food Connect - Halifax

A gamified web platform connecting people experiencing food insecurity with volunteer "Community Heroes" who collect and distribute food from local food banks and farmers markets in Halifax, Nova Scotia.

![Tech Stack](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)

## 🌟 Features

### ✅ Completed Features

#### **Dual User System**
- **Community Heroes**: Volunteers who deliver food
- **Requesters**: People in need of food assistance
- Separate dashboards and workflows for each user type

#### **Authentication & User Management**
- Beautiful registration flow with user type selection
- Email/password authentication with Zustand state management
- Demo accounts for testing:
  - **Hero**: `hero@demo.com` / `demo123`
  - **Requester**: `requester@demo.com` / `demo123`

#### **Gamification System** 🎮
- **Points System**: Base 100 points per delivery with bonuses
  - First delivery of the day: +25 pts
  - On-time delivery: +50 pts
  - 5-star rating: +25 pts
  - Weekly streak (7 days): +200 pts
- **5 Level Tiers**: Beginner → Helper → Hero → Super Hero → Champion
- **8 Unlockable Badges**:
  - First Delivery, Reliable (5), Dedicated (10), Champion (25)
  - Early Bird, Weekend Warrior, Full Cart, Neighborhood Hero
- **Leaderboard**: Weekly and all-time rankings
- **Rewards**: 4-tier coupon system ($5, $10, $20, $50)

#### **Food Request System**
- Create food requests with:
  - Food type (produce, canned goods, bread, dairy, mixed)
  - Quantity (single, family 2-4, family 5+)
  - Delivery address and time window
  - Special notes (allergies, dietary restrictions)
- Browse available requests (Hero view)
- Accept/Complete delivery workflow
- Real-time status tracking (Pending → Accepted → In Progress → Completed)

#### **Hero Features**
- Dashboard with points display, active deliveries, and quick actions
- Browse and filter food requests
- View request details with nearby food bank suggestions
- Accept requests (max 3 active)
- Mark deliveries as in-progress and completed
- Profile page with badges, stats, and rewards
- Automatic points and badge awarding

#### **Requester Features**
- Dashboard with large "Request Food" CTA
- Create new food delivery requests
- Track active requests
- View delivery history
- Rate completed deliveries

#### **Food Resources** 🏪
- **10 Food Banks** in Halifax with:
  - Real addresses and operating hours
  - Contact information
  - Requirements and special programs
  - Transit directions integration
- **7 Farmers Markets** across Halifax region with:
  - Weekly schedules
  - Seasonal availability
  - Payment methods accepted
  - Vendor information

#### **Mobile-First Design** 📱
- Fully responsive (320px+)
- Bottom navigation for easy thumb access
- 44px minimum touch targets
- Optimized for mobile usage
- Beautiful gradient headers
- Custom brand colors (Green #10B981, Blue #3B82F6, Amber #F59E0B)

#### **Data Management**
- LocalStorage persistence layer
- Seed data with 5 heroes, 4 requesters, 5 sample requests
- CRUD operations for users and requests
- Type-safe with comprehensive TypeScript coverage

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd rbc-hubhack
```

2. **Install dependencies**
```bash
npm install
```

3. **Run the development server**
```bash
npm run dev
```

4. **Open the app**
Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🎯 Quick Start Guide

### For Community Heroes (Volunteers)

1. **Register as a Hero**
   - Visit http://localhost:3000
   - Click "Get Started" → Choose "Community Hero"
   - Fill in your details (name, email, neighborhood, transportation method)

2. **Browse Food Requests**
   - Login with hero credentials
   - View dashboard showing available requests
   - Click "Browse Requests" to see all pending requests

3. **Accept & Complete Deliveries**
   - Click on a request to view details
   - See suggested nearby food banks
   - Click "Accept This Request"
   - Mark as "In Progress" when picking up food
   - Mark as "Completed" after delivery
   - **Earn points and badges automatically!**

4. **Track Your Progress**
   - View your points and level on the dashboard
   - Check your badges in the Profile page
   - Redeem points for coupons from local businesses

### For Requesters (People in Need)

1. **Register as a Requester**
   - Visit http://localhost:3000
   - Click "Get Started" → Choose "Request Assistance"
   - Fill in your details

2. **Request Food Delivery**
   - Login with requester credentials
   - Click "Request Food Delivery" on the dashboard
   - Fill out the form:
     - Select food type needed
     - Choose quantity
     - Enter delivery address
     - Set preferred time window
     - Add any special notes

3. **Track Your Request**
   - View status on "My Requests" page
   - Get notified when a Hero accepts
   - See delivery progress (Accepted → In Progress → Completed)

4. **Rate Your Delivery**
   - After delivery is completed, rate the Hero
   - Provide feedback to improve service

---

## 🧪 Testing with Demo Accounts

### Hero Demo Account
```
Email: hero@demo.com
Password: demo123

Pre-loaded with:
- 850 points (Level 2 - Hero)
- 12 completed deliveries
- 3 badges unlocked
- 4.8 average rating
```

### Requester Demo Account
```
Email: requester@demo.com
Password: demo123

Pre-loaded with:
- 1 active accepted request
- Clean delivery history
```

---

## 📂 Project Structure

```
src/
├── app/
│   ├── auth/                     # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── hero/                     # Hero (volunteer) pages
│   │   ├── dashboard/
│   │   ├── requests/
│   │   │   └── [id]/            # Request detail page
│   │   └── profile/
│   ├── requester/                # Requester pages
│   │   ├── dashboard/
│   │   ├── new-request/
│   │   └── my-requests/
│   ├── resources/                # Food banks & markets
│   ├── layout.tsx
│   ├── page.tsx                  # Landing page
│   └── globals.css
├── components/
│   ├── ui/                       # Shadcn/ui components
│   └── shared/
│       ├── BottomNav.tsx
│       ├── PointsBadge.tsx
│       ├── StatusBadge.tsx
│       └── SeedDataInitializer.tsx
├── lib/
│   ├── types.ts                  # TypeScript types
│   ├── constants.ts              # App constants
│   ├── utils.ts                  # Utility functions
│   ├── localStorage.ts           # Data persistence layer
│   ├── gamification.ts           # Points, badges, levels logic
│   └── initSeedData.ts           # Seed data initializer
├── store/
│   └── authStore.ts              # Zustand auth state
└── data/
    ├── foodBanks.json            # 10 Halifax food banks
    ├── farmersMarkets.json       # 7 farmers markets
    └── seedData.ts               # Demo users & requests
```

---

## 🎨 Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript 5**: Type-safe development
- **Tailwind CSS v4**: Utility-first styling
- **Shadcn/ui**: Beautiful component library
- **Lucide React**: Icon library
- **Zustand**: Lightweight state management
- **date-fns**: Date formatting

### Data Management
- **LocalStorage**: Client-side persistence (sufficient for demo)
- **Nanoid**: UUID generation
- **JSON files**: Static food resource data

### Design System
- **Primary Color**: #10B981 (Green) - Growth, community
- **Secondary Color**: #3B82F6 (Blue) - Trust, reliability
- **Accent Color**: #F59E0B (Amber) - Warmth, rewards
- **Mobile-first**: 320px minimum breakpoint
- **Touch-friendly**: 44px minimum touch targets

---

## 🏆 Gamification Details

### Points Breakdown
| Action | Base Points | Possible Bonuses |
|--------|------------|------------------|
| Complete delivery | 100 pts | - |
| First delivery of day | - | +25 pts |
| On-time delivery | - | +50 pts |
| 5-star rating | - | +25 pts |
| Weekly streak (7 days) | - | +200 pts |

### Level System
| Level | Name | Points Required |
|-------|------|----------------|
| 0 | Beginner | 0 - 499 |
| 1 | Helper | 500 - 999 |
| 2 | Hero | 1,000 - 2,499 |
| 3 | Super Hero | 2,500 - 4,999 |
| 4 | Champion | 5,000+ |

### Reward Tiers
| Points | Reward |
|--------|--------|
| 500 | $5 Coffee Shop Coupon |
| 1,000 | $10 Grocery Coupon |
| 2,500 | $20 Restaurant Coupon |
| 5,000 | $50 Local Business Gift Card |

---

## 🗺️ Food Resources

### Food Banks (10 locations)
- Parker Street Food Bank
- Feed Nova Scotia - Main Distribution
- St. George's Round Church Food Bank
- St. Vincent de Paul Society
- The Salvation Army - Halifax Citadel
- North Grove Community Food Bank
- Dartmouth North Community Food Centre
- Soul's Harbour Rescue Mission
- Chebucto Connections Food Bank
- Hope Cottage Food Bank

### Farmers Markets (7 locations)
- Halifax Seaport Farmers Market (year-round)
- Alderney Landing Farmers Market (year-round)
- Bedford Farmers Market (seasonal)
- Wolfville Farmers Market (year-round)
- Sackville Farmers Market (seasonal)
- Dartmouth Farmers Market (seasonal)
- Tantallon Farmers Market (seasonal)

---

## 🔮 Future Enhancements

### Phase 2 Features (Not Yet Implemented)
- [ ] **Halifax Transit GTFS Integration**: Real transit directions with routes and schedules
- [ ] **Interactive Map**: Leaflet.js map with request pins, food bank markers, and clusters
- [ ] **Real-time Updates**: WebSocket integration for live request status updates
- [ ] **Push Notifications**: Browser notifications for new requests and updates
- [ ] **Rating System**: Complete post-delivery rating flow with reviews
- [ ] **Photo Upload**: Delivery proof photos
- [ ] **SMS Notifications**: Text updates for users without smartphone data
- [ ] **Admin Dashboard**: Platform monitoring and management
- [ ] **Analytics Dashboard**: Track impact metrics

### Production Considerations
- Move from localStorage to proper database (PostgreSQL/MongoDB)
- Implement proper backend API (Node.js/Express or serverless)
- Add authentication with OAuth (Google, Facebook)
- Implement real geocoding API (Google Maps, Mapbox)
- Add background checks/verification for heroes
- Integrate with actual food bank inventory systems
- Add multi-language support (French, Arabic, etc.)
- Implement proper error logging and monitoring

---

## 📊 Demo Data

The app comes pre-loaded with realistic demo data:

- **5 Community Heroes** with varying levels and badges
- **4 Requesters** in different Halifax neighborhoods
- **5 Sample Food Requests** in various states
- **10 Food Banks** with real Halifax addresses
- **7 Farmers Markets** across the region

All data is seeded automatically on first app load.

---

## 🤝 Contributing

This is a tech demo project built for a hackathon. Contributions are welcome!

---

## 📄 License

MIT License - feel free to use this project as a starting point for your own community food assistance platform.

---

## 🙏 Acknowledgments

- **Feed Nova Scotia** - Food bank data source
- **Farmers Markets Nova Scotia** - Market information
- **Halifax Transit** - GTFS data (future integration)
- **Shadcn/ui** - Beautiful component library
- **Vercel** - Deployment platform

---

## 📞 Support

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ for the Halifax community**

🌟 Star this repo if you found it helpful!
