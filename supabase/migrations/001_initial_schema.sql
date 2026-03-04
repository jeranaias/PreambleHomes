-- PreambleHomes Initial Schema
-- Run this in the Supabase SQL editor to set up all tables

-- Enable PostGIS
create extension if not exists postgis;

-- ============================================
-- PROFILES
-- ============================================
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
-- AGENTS
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
-- LENDERS
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
-- CONTRACTORS (Phase 3)
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
-- LISTINGS
-- ============================================
create table public.listings (
  id uuid default gen_random_uuid() primary key,
  seller_id uuid references public.profiles not null,
  assigned_agent_id uuid references public.agents,
  status text default 'draft' check (status in ('draft', 'active', 'pending', 'matched', 'sold', 'withdrawn')),
  title text,
  property_type text not null check (property_type in ('single_family', 'condo', 'townhouse', 'multi_family', 'land', 'other')),
  address_line1 text,
  address_line2 text,
  city text not null,
  state text not null default 'CA',
  zip text not null,
  county text,
  location geography(Point, 4326),
  show_exact_address boolean default false,
  show_photos boolean default true,
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
  asking_price numeric(12,2) not null,
  price_negotiable boolean default true,
  preferred_move_date date,
  earliest_move_date date,
  latest_move_date date,
  seller_notes text,
  views_count integer default 0,
  saves_count integer default 0,
  inquiries_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '365 days')
);

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
-- BUYER SEARCHES
-- ============================================
create table public.buyer_searches (
  id uuid default gen_random_uuid() primary key,
  buyer_id uuid references public.profiles not null,
  assigned_agent_id uuid references public.agents,
  property_types text[] default '{"single_family"}',
  min_price numeric(12,2),
  max_price numeric(12,2),
  min_bedrooms integer,
  min_bathrooms numeric(3,1),
  min_sqft integer,
  target_cities text[] default '{}',
  target_zip_codes text[] default '{}',
  target_counties text[] default '{}',
  search_center geography(Point, 4326),
  search_radius_miles numeric(5,1) default 25,
  target_move_date date,
  earliest_move_date date,
  latest_move_date date,
  timeline_flexibility text check (timeline_flexibility in ('rigid', 'somewhat_flexible', 'very_flexible')),
  pre_approved boolean default false,
  pre_approval_amount numeric(12,2),
  is_investor boolean default false,
  is_first_time_buyer boolean default false,
  buyer_notes text,
  notify_new_matches boolean default true,
  notify_price_changes boolean default true,
  status text default 'active' check (status in ('active', 'paused', 'matched', 'closed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- MATCHES
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
-- SAVED LISTINGS
-- ============================================
create table public.saved_listings (
  buyer_id uuid references public.profiles not null,
  listing_id uuid references public.listings not null,
  created_at timestamptz default now(),
  primary key (buyer_id, listing_id)
);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Increment counter (for views, saves, inquiries)
create or replace function increment_counter(
  row_id uuid,
  table_name text,
  column_name text
)
returns void
language plpgsql security definer
as $$
begin
  execute format(
    'update public.%I set %I = %I + 1 where id = $1',
    table_name, column_name, column_name
  ) using row_id;
end;
$$;

-- Nearby listings (PostGIS)
create or replace function nearby_listings(
  lat double precision,
  lng double precision,
  radius_miles double precision default 25
)
returns table (
  id uuid,
  distance_miles double precision
)
language sql stable
as $$
  select
    l.id,
    ST_Distance(
      l.location::geography,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
    ) / 1609.34 as distance_miles
  from public.listings l
  where l.status = 'active'
    and l.location is not null
    and ST_DWithin(
      l.location::geography,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
      radius_miles * 1609.34
    )
  order by distance_miles;
$$;

-- Auto-update updated_at timestamp
create or replace function update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger listings_updated_at
  before update on public.listings
  for each row execute function update_updated_at();

create trigger buyer_searches_updated_at
  before update on public.buyer_searches
  for each row execute function update_updated_at();

create trigger matches_updated_at
  before update on public.matches
  for each row execute function update_updated_at();

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.profiles enable row level security;
alter table public.agents enable row level security;
alter table public.lenders enable row level security;
alter table public.listings enable row level security;
alter table public.listing_photos enable row level security;
alter table public.buyer_searches enable row level security;
alter table public.matches enable row level security;
alter table public.inquiries enable row level security;
alter table public.saved_listings enable row level security;

-- Profiles
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Agents — public read for directory
create policy "Agents are publicly readable"
  on public.agents for select using (true);
create policy "Agents can update own profile"
  on public.agents for all using (auth.uid() = id);

-- Lenders — public read for directory
create policy "Lenders are publicly readable"
  on public.lenders for select using (true);

-- Listings
create policy "Active listings are public"
  on public.listings for select using (status = 'active');
create policy "Sellers manage own listings"
  on public.listings for all using (auth.uid() = seller_id);
create policy "Agents see assigned listings"
  on public.listings for select using (auth.uid() = assigned_agent_id);

-- Listing photos follow listing access
create policy "Photos follow listing access"
  on public.listing_photos for select using (
    exists (
      select 1 from public.listings
      where listings.id = listing_photos.listing_id
      and (listings.status = 'active' or listings.seller_id = auth.uid())
    )
  );
create policy "Sellers manage own listing photos"
  on public.listing_photos for all using (
    exists (
      select 1 from public.listings
      where listings.id = listing_photos.listing_id
      and listings.seller_id = auth.uid()
    )
  );

-- Buyer searches
create policy "Buyers manage own searches"
  on public.buyer_searches for all using (auth.uid() = buyer_id);
create policy "Agents see assigned buyer searches"
  on public.buyer_searches for select using (auth.uid() = assigned_agent_id);

-- Matches
create policy "Match participants can view"
  on public.matches for select using (
    auth.uid() in (
      select seller_id from public.listings where id = listing_id
    ) or auth.uid() in (
      select buyer_id from public.buyer_searches where id = buyer_search_id
    ) or auth.uid() = handling_agent_id
  );
create policy "Match participants can update"
  on public.matches for update using (
    auth.uid() in (
      select seller_id from public.listings where id = listing_id
    ) or auth.uid() in (
      select buyer_id from public.buyer_searches where id = buyer_search_id
    ) or auth.uid() = handling_agent_id
  );

-- Inquiries
create policy "Inquiry participants can view"
  on public.inquiries for select using (
    auth.uid() = buyer_id or auth.uid() = agent_id
    or auth.uid() in (select seller_id from public.listings where id = listing_id)
  );
create policy "Authenticated users can create inquiries"
  on public.inquiries for insert with check (auth.uid() = buyer_id);

-- Saved listings
create policy "Users manage own saved listings"
  on public.saved_listings for all using (auth.uid() = buyer_id);

-- ============================================
-- STORAGE BUCKET
-- ============================================
-- Run this separately in Storage settings or via SQL:
-- insert into storage.buckets (id, name, public) values ('listing-photos', 'listing-photos', true);
