# PreMarket Real Estate Platform — Full Project Plan

---

## Naming Research & Recommendation

### Top 3 Available Names (Verified March 2026)

| Rank | Name | Why It Works | Conflicts Found |
|------|------|-------------|-----------------|
| 1 | **PreambleHomes** | "Preamble" = introductory statement before the main event. Perfect metaphor for pre-market. Professional tone. Zero real estate conflicts. | None |
| 2 | **EarlyDoor** | Intuitive real estate metaphor — getting through the door early. British expression "early doors" = at an early stage. Memorable, short. | Tiny unrelated venture studio in Toronto (not RE) |
| 3 | **SeedNest** | "Seed" (early stage) + "Nest" (home). Tells the product story in two syllables. Quirky but professional. | Cannabis seed shop uses "theseedneststore.com" (different industry) |

### Names Researched & Rejected

| Name | Reason |
|------|--------|
| Prelude Homes | Taken — Prelude Residential (Ashton Woods subsidiary), Prelude Custom Homes |
| OffMarket.io | Direct competitor — Off-Market.io launched 2023, $500M+ in deals digitized |
| PreList / PreListed | Both taken — existing RE listing platforms |
| NestReady | Acquired by Homebot in 2021 |
| NestIntent | Google Nest trademark risk |
| BeforeMarket / PreMarketHQ | Extremely crowded space — premarket.nyc, premarket.homes, BlueBid, offMLS |
| HomeSignal | Domain taken by telecom comparison site |
| FirstLook Homes | 5+ existing RE companies with this name |
| Threshold | Target's private-label brand + Threshold Brands (home services franchise) |
| Hearthstone | Blizzard Entertainment trademark + Hearthstone Inc. (RE investment since 1992) |
| Keyline / KeylineHomes | Multiple existing RE developers (US, Australia) |
| VantagePoint Homes | 6-7 existing "Vantage Point" RE companies across the US |

### Domain Check Next Steps

Before committing, verify:
1. WHOIS lookup at [ICANN Lookup](https://lookup.icann.org/) for: PreambleHomes.com, EarlyDoor.com, SeedNest.com
2. [USPTO trademark search](https://trademarkcenter.uspto.gov/) for chosen name
3. State business name registration in California

### Recommended Domains to Try

- **PreambleHomes.com** / GetPreamble.com / Preamble.io
- **EarlyDoor.com** / EarlyDoor.io / EarlyDoors.com
- **SeedNest.com** / SeedNest.io

---

## Platform Summary

A consumer-facing, agent-mediated marketplace where future home sellers and buyers connect months or years before a property hits the MLS. Revenue from agent subscriptions, lender referral partnerships, and contractor/handyman referral fees.

**Key Differentiator:** Timeline matching — connecting buyers and sellers based on *when* they want to transact, not just *what* they want.

---

## Legal & Compliance Strategy (Critical)

### Clear Cooperation Policy (CCP) Compliance

The platform MUST be designed to avoid triggering CCP obligations. Here's how:

1. **Language matters — call them "Pre-Market Profiles," not "Listings"**
   - Sellers create "intent profiles" or "pre-market profiles"
   - They indicate interest in selling, a price range (not an asking price), and a timeline
   - This is a planning tool, not a marketing channel

2. **No exclusive listing agreements through the platform**
   - Explicitly state the platform does not create, imply, or substitute for any listing agreement
   - If a seller and agent formalize a listing, they do so through normal channels — CCP kicks in at that point

3. **Agent-mediated from the start**
   - All connections go through licensed agents
   - Platform facilitates professional relationships, not direct property marketing

4. **Privacy controls are a feature**
   - Sellers choose what to show: neighborhood only (no address), price range (not exact), general specs
   - The less it looks like a Zillow listing, the safer from CCP

5. **Disclaimer on every profile**
   > "This is a pre-market intent profile and does not constitute a property listing. No listing agreement exists between any parties through this platform. Once a formal listing agreement is established, all applicable MLS rules apply."

6. **One-to-one matching, not broadcast marketing**
   - NAR clarified that one-to-one broker-to-broker communications don't trigger CCP
   - Platform matches a buyer with a seller and routes through a single agent = one-to-one communication

7. **Built for the "delayed marketing" future**
   - Industry moving toward more pre-market flexibility
   - CCP relaxation expected to create influx of monetizable off-market intent
   - Platform rides this wave, not fights against it

### Legal Must-Dos Before Launch

- [ ] Consult real estate attorney RE: CCP compliance
- [ ] Frame all seller content as "intent to sell" not formal listings
- [ ] Terms of service: platform is NOT a brokerage
- [ ] Privacy policy (PII, property data collection)
- [ ] Agent license verification process
- [ ] Referral fee agreements structured per state law

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | **Next.js 14+ (App Router)** | SSR for SEO, API routes, React Server Components |
| Database | **Supabase (PostgreSQL)** | Free: 500MB DB, 1GB storage, 50K MAU |
| Auth | **Supabase Auth** | Email/password + magic links. Role-based |
| File Storage | **Supabase Storage** | Property photos, agent headshots, documents |
| Hosting | **Vercel (free tier)** | Auto-deploy from GitHub, edge functions, 100GB BW |
| Email | **Resend (free tier)** | 100 emails/day — match notifications, lead alerts |
| Search | **PostgreSQL full-text + PostGIS** | Geo-based property search, no extra service |
| Payments (Phase 2) | **Stripe** | Agent subscriptions, referral fee tracking |
| Analytics | **Vercel Analytics** or **Plausible** | Usage tracking without bloat |
| Maps | **Mapbox GL JS** or **Leaflet + OpenStreetMap** | Property location display, area browsing |

### Free Tier Constraints

| Service | Free Limit | Upgrade Trigger | Monthly Cost |
|---|---|---|---|
| Supabase | 500MB DB, 1GB storage, 50K MAU | ~200 listings with photos | $25 |
| Vercel | 100GB bandwidth, 100K invocations | ~10K monthly visitors | $20 |
| Resend | 100 emails/day | Multiple daily matches | $20 |
| Mapbox | 50K map loads/mo | Heavy browse traffic | $0 up to 50K |
| Stripe | 2.9% + $0.30 per txn | When charging starts | No monthly fee |

**Total cost to launch MVP: $0/mo**
**Estimated upgrade point: ~500 active users → ~$65/mo**

---

## Database Schema

### Core Tables

```sql
-- ============================================
-- USERS & ROLES
-- ============================================

-- Extends Supabase auth.users
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null check (role in ('buyer', 'seller', 'agent', 'lender', 'contractor', 'admin')),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- AGENT PROFILES (paid subscribers)
-- ============================================

create table public.agents (
  id uuid references public.profiles on delete cascade primary key,
  brokerage text not null,
  license_number text not null,
  license_state text not null default 'CA',
  bio text,
  headshot_url text,
  subscription_tier text check (subscription_tier in ('basic', 'pro', 'premium')),
  subscription_status text default 'trial' check (subscription_status in ('trial', 'active', 'past_due', 'cancelled')),
  stripe_customer_id text,
  referral_fee_pct numeric(4,2) default 25.00,
  is_verified boolean default false,
  markets text[] default '{}',
  created_at timestamptz default now()
);

-- ============================================
-- LENDER PROFILES (paid partners)
-- ============================================

create table public.lenders (
  id uuid references public.profiles on delete cascade primary key,
  company_name text not null,
  nmls_number text not null,
  loan_types text[] default '{}',
  bio text,
  logo_url text,
  subscription_status text default 'trial',
  stripe_customer_id text,
  referral_fee_pct numeric(4,2) default 20.00,
  markets text[] default '{}',
  created_at timestamptz default now()
);

-- ============================================
-- CONTRACTOR PROFILES (Phase 3)
-- ============================================

create table public.contractors (
  id uuid references public.profiles on delete cascade primary key,
  company_name text not null,
  license_number text,
  specialty text[] default '{}',
  bio text,
  logo_url text,
  service_area text[] default '{}',
  subscription_status text default 'trial',
  referral_fee_flat numeric(8,2) default 50.00,
  avg_rating numeric(3,2),
  review_count integer default 0,
  created_at timestamptz default now()
);

-- ============================================
-- SELLER INTENT PROFILES (the core product)
-- ============================================
-- NOTE: Called "listings" in code for simplicity,
-- but presented as "pre-market intent profiles" in UI

create table public.listings (
  id uuid default gen_random_uuid() primary key,
  seller_id uuid references public.profiles not null,
  assigned_agent_id uuid references public.agents,

  -- Status
  status text default 'draft' check (status in ('draft', 'active', 'pending', 'matched', 'sold', 'withdrawn')),
  title text,
  property_type text not null check (property_type in ('single_family', 'condo', 'townhouse', 'multi_family', 'land', 'other')),

  -- Location (PostGIS)
  address_line1 text,
  address_line2 text,
  city text not null,
  state text not null default 'CA',
  zip text not null,
  county text,
  location geography(Point, 4326),

  -- Privacy controls (CCP compliance)
  show_exact_address boolean default false,
  show_photos boolean default true,

  -- Specs
  bedrooms integer,
  bathrooms numeric(3,1),
  sqft integer,
  lot_sqft integer,
  year_built integer,
  stories integer,
  garage_spaces integer,
  has_pool boolean default false,
  has_hoa boolean default false,
  hoa_monthly numeric(8,2),

  -- Seller's terms
  asking_price numeric(12,2) not null,
  price_negotiable boolean default true,
  preferred_move_date date,       -- KEY DIFFERENTIATOR
  earliest_move_date date,
  latest_move_date date,
  seller_notes text,

  -- Metadata
  views_count integer default 0,
  saves_count integer default 0,
  inquiries_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '365 days')
);

-- Enable PostGIS
create extension if not exists postgis;

-- Indexes
create index idx_listings_location on public.listings using gist(location);
create index idx_listings_status on public.listings(status);
create index idx_listings_price on public.listings(asking_price);
create index idx_listings_move_date on public.listings(preferred_move_date);

-- ============================================
-- LISTING PHOTOS
-- ============================================

create table public.listing_photos (
  id uuid default gen_random_uuid() primary key,
  listing_id uuid references public.listings on delete cascade not null,
  storage_path text not null,
  display_order integer default 0,
  caption text,
  created_at timestamptz default now()
);

-- ============================================
-- BUYER SEARCH CRITERIA
-- ============================================

create table public.buyer_searches (
  id uuid default gen_random_uuid() primary key,
  buyer_id uuid references public.profiles not null,
  assigned_agent_id uuid references public.agents,

  -- What
  property_types text[] default '{"single_family"}',
  min_price numeric(12,2),
  max_price numeric(12,2),
  min_bedrooms integer,
  min_bathrooms numeric(3,1),
  min_sqft integer,

  -- Where
  target_cities text[] default '{}',
  target_zip_codes text[] default '{}',
  target_counties text[] default '{}',
  search_center geography(Point, 4326),
  search_radius_miles numeric(5,1) default 25,

  -- When (KEY DIFFERENTIATOR)
  target_move_date date,
  earliest_move_date date,
  latest_move_date date,
  timeline_flexibility text check (timeline_flexibility in ('rigid', 'somewhat_flexible', 'very_flexible')),

  -- Context
  pre_approved boolean default false,
  pre_approval_amount numeric(12,2),
  is_investor boolean default false,
  is_first_time_buyer boolean default false,
  buyer_notes text,

  -- Notifications
  notify_new_matches boolean default true,
  notify_price_changes boolean default true,

  status text default 'active' check (status in ('active', 'paused', 'matched', 'closed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- MATCHES (buyer <-> listing connections)
-- ============================================

create table public.matches (
  id uuid default gen_random_uuid() primary key,
  listing_id uuid references public.listings not null,
  buyer_search_id uuid references public.buyer_searches not null,
  match_score numeric(5,2),
  initiated_by text check (initiated_by in ('system', 'buyer', 'seller', 'agent')),
  status text default 'matched' check (status in (
    'matched', 'buyer_interested', 'seller_interested',
    'agent_contacted', 'in_discussion', 'under_contract',
    'closed_won', 'closed_lost', 'expired'
  )),
  handling_agent_id uuid references public.agents,
  referral_fee_amount numeric(10,2),
  referral_fee_paid boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(listing_id, buyer_search_id)
);

-- ============================================
-- INQUIRIES
-- ============================================

create table public.inquiries (
  id uuid default gen_random_uuid() primary key,
  listing_id uuid references public.listings not null,
  buyer_id uuid references public.profiles not null,
  agent_id uuid references public.agents,
  message text,
  inquiry_type text default 'general' check (inquiry_type in ('general', 'showing_request', 'price_question', 'timeline_question')),
  status text default 'new' check (status in ('new', 'agent_notified', 'responded', 'converted', 'closed')),
  created_at timestamptz default now()
);

-- ============================================
-- LENDER REFERRALS
-- ============================================

create table public.lender_referrals (
  id uuid default gen_random_uuid() primary key,
  lender_id uuid references public.lenders not null,
  buyer_id uuid references public.profiles not null,
  referring_agent_id uuid references public.agents,
  source text check (source in ('buyer_request', 'agent_referral', 'platform_direct')),
  status text default 'referred' check (status in ('referred', 'contacted', 'application_started', 'pre_approved', 'funded', 'lost')),
  referral_fee_amount numeric(10,2),
  referral_fee_paid boolean default false,
  created_at timestamptz default now()
);

-- ============================================
-- CONTRACTOR REFERRALS (Phase 3)
-- ============================================

create table public.contractor_referrals (
  id uuid default gen_random_uuid() primary key,
  contractor_id uuid references public.contractors not null,
  user_id uuid references public.profiles not null,
  service_needed text not null,
  description text,
  status text default 'referred' check (status in ('referred', 'contacted', 'quoted', 'hired', 'completed', 'lost')),
  referral_fee_amount numeric(8,2),
  referral_fee_paid boolean default false,
  created_at timestamptz default now()
);

-- ============================================
-- INVESTOR PROFILES (Phase 3)
-- ============================================

create table public.investor_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles not null,
  investment_strategy text[] default '{}',
  min_budget numeric(12,2),
  max_budget numeric(12,2),
  target_markets text[] default '{}',
  property_conditions text[] default '{}',
  is_cash_buyer boolean default false,
  portfolio_size integer,
  subscription_tier text check (subscription_tier in ('basic', 'premium')),
  created_at timestamptz default now()
);

-- ============================================
-- SAVED / FAVORITED LISTINGS
-- ============================================

create table public.saved_listings (
  buyer_id uuid references public.profiles not null,
  listing_id uuid references public.listings not null,
  created_at timestamptz default now(),
  primary key (buyer_id, listing_id)
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.buyer_searches enable row level security;
alter table public.matches enable row level security;
alter table public.inquiries enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Active listings are public"
  on public.listings for select using (status = 'active');

create policy "Sellers manage own listings"
  on public.listings for all using (auth.uid() = seller_id);

create policy "Agents see assigned listings"
  on public.listings for select using (auth.uid() = assigned_agent_id);

create policy "Buyers manage own searches"
  on public.buyer_searches for all using (auth.uid() = buyer_id);

create policy "Match participants can view"
  on public.matches for select using (
    auth.uid() in (
      select seller_id from public.listings where id = listing_id
    ) or auth.uid() in (
      select buyer_id from public.buyer_searches where id = buyer_search_id
    ) or auth.uid() = handling_agent_id
  );
```

---

## App Structure (Next.js App Router)

```
src/
├── app/
│   ├── layout.tsx                  # Root layout, nav, auth provider
│   ├── page.tsx                    # Landing / marketing page
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx         # Role selection during signup
│   │   └── callback/route.ts      # Supabase auth callback
│   ├── (public)/
│   │   ├── listings/
│   │   │   ├── page.tsx            # Browse/search with map
│   │   │   └── [id]/page.tsx       # Individual listing detail
│   │   └── how-it-works/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Auth dashboard shell
│   │   ├── seller/
│   │   │   ├── page.tsx            # My listings, matches, inquiries
│   │   │   ├── new-listing/page.tsx
│   │   │   └── listing/[id]/edit/page.tsx
│   │   ├── buyer/
│   │   │   ├── page.tsx            # Saved, matches, search criteria
│   │   │   ├── search/page.tsx     # Edit search criteria
│   │   │   └── matches/page.tsx
│   │   ├── agent/
│   │   │   ├── page.tsx            # Leads, clients, active matches
│   │   │   ├── leads/page.tsx
│   │   │   ├── clients/page.tsx
│   │   │   └── listings/page.tsx
│   │   ├── lender/
│   │   │   └── page.tsx            # Referrals, leads
│   │   ├── investor/
│   │   │   └── page.tsx            # Off-market deals, filters
│   │   └── admin/
│   │       ├── page.tsx            # Users, revenue, moderation
│   │       ├── agents/page.tsx
│   │       └── analytics/page.tsx
│   └── api/
│       ├── matches/route.ts        # Matching algorithm endpoint
│       ├── inquiries/route.ts      # Create inquiry -> notify agent
│       ├── notifications/route.ts  # Send email notifications
│       ├── webhooks/stripe/route.ts
│       └── cron/match-scan/route.ts # Periodic match scanning
├── components/
│   ├── ui/                         # Buttons, inputs, cards, modals
│   ├── listings/
│   │   ├── ListingCard.tsx
│   │   ├── ListingGrid.tsx
│   │   ├── ListingForm.tsx
│   │   ├── ListingMap.tsx
│   │   └── PhotoUploader.tsx
│   ├── search/
│   │   ├── SearchFilters.tsx
│   │   ├── PriceRangeSlider.tsx
│   │   ├── TimelineSelector.tsx    # Key differentiator UI
│   │   └── MapSearch.tsx
│   ├── matches/
│   │   ├── MatchCard.tsx
│   │   └── MatchTimeline.tsx
│   ├── agents/
│   │   ├── AgentCard.tsx
│   │   └── AgentDirectory.tsx
│   └── layout/
│       ├── Navbar.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser client
│   │   ├── server.ts               # Server client
│   │   └── middleware.ts            # Auth middleware
│   ├── matching.ts                 # Match scoring algorithm
│   ├── geo.ts                      # PostGIS helpers
│   ├── notifications.ts            # Email logic
│   └── utils.ts
├── types/
│   └── database.ts                 # Generated from Supabase
└── middleware.ts                    # Auth route protection
```

---

## Matching Algorithm

The secret sauce. Runs on cron (Vercel cron, free tier = daily) and on-demand when new listings/searches are created.

```typescript
// lib/matching.ts

interface MatchFactors {
  priceAlignment: number;      // 0-30 points
  locationMatch: number;       // 0-25 points
  timelineOverlap: number;     // 0-25 points — THE DIFFERENTIATOR
  specMatch: number;           // 0-15 points
  propertyTypeMatch: number;   // 0-5 points
}

function calculateMatchScore(listing: Listing, search: BuyerSearch): number {
  let score = 0;

  // PRICE (30 pts)
  if (listing.asking_price >= search.min_price &&
      listing.asking_price <= search.max_price) {
    score += 30;
  } else {
    const midpoint = (search.min_price + search.max_price) / 2;
    const deviation = Math.abs(listing.asking_price - midpoint) / midpoint;
    if (deviation < 0.15) score += 30 * (1 - deviation / 0.15);
  }

  // LOCATION (25 pts) — PostGIS distance
  const distanceMiles = calculateDistance(listing.location, search.search_center);
  if (distanceMiles <= search.search_radius_miles) {
    score += 25 * (1 - distanceMiles / search.search_radius_miles);
  }

  // TIMELINE OVERLAP (25 pts) — what makes us different
  const sellerWindow = {
    start: listing.earliest_move_date || listing.preferred_move_date,
    end: listing.latest_move_date || listing.preferred_move_date
  };
  const buyerWindow = {
    start: search.earliest_move_date || search.target_move_date,
    end: search.latest_move_date || search.target_move_date
  };
  const overlap = calculateDateOverlap(sellerWindow, buyerWindow);
  if (overlap > 0) {
    score += Math.min(25, overlap / 30 * 25); // Full points for 30+ days overlap
  }

  // SPECS (15 pts)
  if (listing.bedrooms >= search.min_bedrooms) score += 5;
  if (listing.bathrooms >= search.min_bathrooms) score += 5;
  if (listing.sqft >= search.min_sqft) score += 5;

  // PROPERTY TYPE (5 pts)
  if (search.property_types.includes(listing.property_type)) score += 5;

  return score;
}
```

---

## Key User Flows

### 1. Seller Creates a Pre-Market Intent Profile

```
Sign up (role: seller) →
  Fill out property details (address, specs, photos) →
    Set price range + preferred timeline →
      Choose privacy settings (show address? show photos?) →
        Publish → system scans for matching buyers →
          Matches shown in seller dashboard →
            Buyer inquires → routed through agent →
              Direct conversation facilitated
```

### 2. Buyer Creates a Search Profile

```
Sign up (role: buyer) →
  Set criteria (price, location, size, type) →
    Set timeline (when do you want to move?) →
      Set flexibility level →
        System shows existing matches →
          New matches emailed as they appear →
            Buyer clicks "I'm interested" → routed to agent →
              Agent facilitates introduction
```

### 3. Agent Signs Up (revenue stream)

```
Sign up (role: agent) →
  Verify license →
    Choose subscription tier →
      Assigned to geographic market →
        Receives leads from unrepresented buyers/sellers →
          Facilitates matches → platform tracks referral fee →
            Closes deal → referral fee paid
```

### 4. Lender Receives Referral (revenue stream)

```
Buyer indicates "want to talk to a lender" →
  OR agent refers buyer to preferred lender list →
    Lender receives lead with buyer context →
      Lender contacts buyer →
        Pre-approval issued →
          If loan funds → referral fee tracked/paid
```

---

## MVP Feature Priorities

### Phase 1 — Core (Build First)

- [ ] Auth (email/password, role-based signup)
- [ ] Seller listing creation with photos
- [ ] Buyer search profile creation
- [ ] Listing browse/search with map
- [ ] Basic matching algorithm
- [ ] Match notifications (email via Resend)
- [ ] Inquiry system (buyer → agent → seller)
- [ ] Seller/Buyer dashboards
- [ ] Mobile-responsive design
- [ ] Password-protected demo access

### Phase 2 — Revenue (Build After Validation)

- [ ] Agent subscription system (Stripe)
- [ ] Agent dashboard with lead management
- [ ] Lender directory and referral tracking
- [ ] Referral fee tracking
- [ ] Agent verification flow
- [ ] Enhanced matching (ML-based scoring)

### Phase 3 — Expansion

- [ ] Contractor/handyman directory + referrals
- [ ] Investor panel with premium filters
- [ ] In-app messaging (replace email-only)
- [ ] Seller analytics (views, saves, engagement)
- [ ] Comparative market data integration
- [ ] Native mobile app (React Native or Expo)

---

## Deployment Architecture

```
GitHub Repo
    │
    ├── Push to main → Vercel auto-deploys
    │
    ├── Vercel (Next.js)
    │   ├── SSR pages (listings, search)
    │   ├── API routes (matches, inquiries, webhooks)
    │   ├── Cron jobs (daily match scan)
    │   └── Edge middleware (auth checks)
    │
    ├── Supabase (hosted PostgreSQL + PostGIS)
    │   ├── Database (all tables)
    │   ├── Auth (users, sessions, JWT)
    │   ├── Storage (property photos, documents)
    │   ├── Realtime (optional: live notifications)
    │   └── Row Level Security (data isolation)
    │
    ├── Resend (transactional email)
    │   ├── Match notifications
    │   ├── Inquiry alerts
    │   └── Welcome emails
    │
    └── Stripe (Phase 2)
        ├── Agent subscriptions
        └── Webhook → Supabase status updates
```

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Resend
RESEND_API_KEY=

# Stripe (Phase 2)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# App
NEXT_PUBLIC_APP_URL=
DEMO_PASSWORD=
NEXT_PUBLIC_MAPBOX_TOKEN=
```

---

## Security

1. **RLS everywhere** — every table has row-level security. Users only see what they should.
2. **No direct seller↔buyer contact** — all communication routed through agents (business model + safety).
3. **Photo moderation** — manual review queue (Phase 2: AI moderation).
4. **Rate limiting** — Next.js middleware on API routes.
5. **Input sanitization** — Zod schemas for all server-side validation.
6. **Demo password** — middleware check for password-protected launch.

---

## Build Order

1. Supabase project setup — tables, PostGIS, auth config
2. Next.js scaffold — app router, auth flow, basic layout
3. Listing creation flow — form, photo upload, save to DB
4. Listing browse/search — map view, filters, SSR pages
5. Buyer search profile — criteria form, save to DB
6. Matching engine — scoring algorithm, run on create
7. Dashboards — seller, buyer views with matches/inquiries
8. Email notifications — Resend integration
9. Demo password gate — middleware
10. Deploy — Vercel, ship it
