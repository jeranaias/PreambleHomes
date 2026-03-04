// Database types — mirrors Supabase schema
// Regenerate with: npx supabase gen types typescript --project-id <id> > src/types/database.ts

export type UserRole = "buyer" | "seller" | "agent" | "lender" | "contractor" | "admin";
export type ListingStatus = "draft" | "active" | "pending" | "matched" | "sold" | "withdrawn";
export type PropertyType = "single_family" | "condo" | "townhouse" | "multi_family" | "land" | "other";
export type SubscriptionTier = "basic" | "pro" | "premium";
export type SubscriptionStatus = "trial" | "active" | "past_due" | "cancelled";
export type TimelineFlexibility = "rigid" | "somewhat_flexible" | "very_flexible";
export type InquiryType = "general" | "showing_request" | "price_question" | "timeline_question";
export type InquiryStatus = "new" | "agent_notified" | "responded" | "converted" | "closed";
export type MatchStatus =
  | "matched"
  | "buyer_interested"
  | "seller_interested"
  | "agent_contacted"
  | "in_discussion"
  | "under_contract"
  | "closed_won"
  | "closed_lost"
  | "expired";
export type MatchInitiator = "system" | "buyer" | "seller" | "agent";
export type BuyerSearchStatus = "active" | "paused" | "matched" | "closed";

export interface Profile {
  id: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Agent {
  id: string;
  brokerage: string;
  license_number: string;
  license_state: string;
  bio: string | null;
  headshot_url: string | null;
  subscription_tier: SubscriptionTier | null;
  subscription_status: SubscriptionStatus;
  stripe_customer_id: string | null;
  referral_fee_pct: number;
  is_verified: boolean;
  markets: string[];
  created_at: string;
}

export interface Lender {
  id: string;
  company_name: string;
  nmls_number: string;
  loan_types: string[];
  bio: string | null;
  logo_url: string | null;
  subscription_status: string;
  stripe_customer_id: string | null;
  referral_fee_pct: number;
  markets: string[];
  created_at: string;
}

export interface Listing {
  id: string;
  seller_id: string;
  assigned_agent_id: string | null;
  status: ListingStatus;
  title: string | null;
  property_type: PropertyType;
  address_line1: string | null;
  address_line2: string | null;
  city: string;
  state: string;
  zip: string;
  county: string | null;
  location: unknown | null; // PostGIS geography
  show_exact_address: boolean;
  show_photos: boolean;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
  lot_sqft: number | null;
  year_built: number | null;
  stories: number | null;
  garage_spaces: number | null;
  has_pool: boolean;
  has_hoa: boolean;
  hoa_monthly: number | null;
  asking_price: number;
  price_negotiable: boolean;
  preferred_move_date: string | null;
  earliest_move_date: string | null;
  latest_move_date: string | null;
  seller_notes: string | null;
  views_count: number;
  saves_count: number;
  inquiries_count: number;
  created_at: string;
  updated_at: string;
  expires_at: string;
}

export interface ListingPhoto {
  id: string;
  listing_id: string;
  storage_path: string;
  display_order: number;
  caption: string | null;
  created_at: string;
}

export interface BuyerSearch {
  id: string;
  buyer_id: string;
  assigned_agent_id: string | null;
  property_types: string[];
  min_price: number | null;
  max_price: number | null;
  min_bedrooms: number | null;
  min_bathrooms: number | null;
  min_sqft: number | null;
  target_cities: string[];
  target_zip_codes: string[];
  target_counties: string[];
  search_center: unknown | null; // PostGIS geography
  search_radius_miles: number;
  target_move_date: string | null;
  earliest_move_date: string | null;
  latest_move_date: string | null;
  timeline_flexibility: TimelineFlexibility | null;
  pre_approved: boolean;
  pre_approval_amount: number | null;
  is_investor: boolean;
  is_first_time_buyer: boolean;
  buyer_notes: string | null;
  notify_new_matches: boolean;
  notify_price_changes: boolean;
  status: BuyerSearchStatus;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  listing_id: string;
  buyer_search_id: string;
  match_score: number | null;
  initiated_by: MatchInitiator | null;
  status: MatchStatus;
  handling_agent_id: string | null;
  referral_fee_amount: number | null;
  referral_fee_paid: boolean;
  created_at: string;
  updated_at: string;
}

export interface Inquiry {
  id: string;
  listing_id: string;
  buyer_id: string;
  agent_id: string | null;
  message: string | null;
  inquiry_type: InquiryType;
  status: InquiryStatus;
  created_at: string;
}

export interface SavedListing {
  buyer_id: string;
  listing_id: string;
  created_at: string;
}

// Join types for common queries
export interface ListingWithPhotos extends Listing {
  listing_photos: ListingPhoto[];
}

export interface ListingWithAgent extends Listing {
  agents: Agent | null;
}

export interface MatchWithDetails extends Match {
  listings: ListingWithPhotos;
  buyer_searches: BuyerSearch;
}
