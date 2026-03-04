import { z } from "zod/v4";

export const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.email("Invalid email"),
  phone: z.string().optional(),
  role: z.enum(["buyer", "seller", "agent", "lender"]),
});

export const listingSchema = z.object({
  property_type: z.enum([
    "single_family", "condo", "townhouse", "multi_family", "land", "other",
  ]),
  city: z.string().min(1, "City is required"),
  state: z.string().min(2).max(2).default("CA"),
  zip: z.string().min(5, "ZIP code is required"),
  county: z.string().optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  show_exact_address: z.boolean().default(false),
  show_photos: z.boolean().default(true),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  sqft: z.number().int().min(0).optional(),
  lot_sqft: z.number().int().min(0).optional(),
  year_built: z.number().int().min(1800).max(2030).optional(),
  stories: z.number().int().min(1).optional(),
  garage_spaces: z.number().int().min(0).optional(),
  has_pool: z.boolean().default(false),
  has_hoa: z.boolean().default(false),
  hoa_monthly: z.number().min(0).optional(),
  asking_price: z.number().min(1, "Price is required"),
  price_negotiable: z.boolean().default(true),
  preferred_move_date: z.string().optional(),
  earliest_move_date: z.string().optional(),
  latest_move_date: z.string().optional(),
  seller_notes: z.string().max(2000).optional(),
  title: z.string().max(200).optional(),
});

export const buyerSearchSchema = z.object({
  property_types: z.array(z.string()).default(["single_family"]),
  min_price: z.number().min(0).optional(),
  max_price: z.number().min(0).optional(),
  min_bedrooms: z.number().int().min(0).optional(),
  min_bathrooms: z.number().min(0).optional(),
  min_sqft: z.number().int().min(0).optional(),
  target_cities: z.array(z.string()).default([]),
  target_zip_codes: z.array(z.string()).default([]),
  target_counties: z.array(z.string()).default([]),
  search_radius_miles: z.number().min(1).max(100).default(25),
  target_move_date: z.string().optional(),
  earliest_move_date: z.string().optional(),
  latest_move_date: z.string().optional(),
  timeline_flexibility: z.enum(["rigid", "somewhat_flexible", "very_flexible"]).optional(),
  pre_approved: z.boolean().default(false),
  pre_approval_amount: z.number().min(0).optional(),
  is_investor: z.boolean().default(false),
  is_first_time_buyer: z.boolean().default(false),
  buyer_notes: z.string().max(2000).optional(),
});

export const inquirySchema = z.object({
  listing_id: z.string().uuid(),
  message: z.string().max(2000).optional(),
  inquiry_type: z.enum(["general", "showing_request", "price_question", "timeline_question"]).default("general"),
});

export type ListingFormData = z.infer<typeof listingSchema>;
export type BuyerSearchFormData = z.infer<typeof buyerSearchSchema>;
export type InquiryFormData = z.infer<typeof inquirySchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
