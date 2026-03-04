export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { ListingGrid } from "@/components/listings/ListingGrid";
import { SearchFilters } from "@/components/search/SearchFilters";
import { MapSearch } from "@/components/search/MapSearch";
import type { ListingWithPhotos } from "@/types/database";

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function ListingsPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("listings")
    .select("*, listing_photos(*)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(50);

  if (params.city) {
    query = query.ilike("city", `%${params.city}%`);
  }
  if (params.minPrice) {
    query = query.gte("asking_price", Number(params.minPrice));
  }
  if (params.maxPrice) {
    query = query.lte("asking_price", Number(params.maxPrice));
  }
  if (params.propertyType) {
    query = query.eq("property_type", params.propertyType);
  }
  if (params.minBeds) {
    query = query.gte("bedrooms", Number(params.minBeds));
  }
  if (params.minBaths) {
    query = query.gte("bathrooms", Number(params.minBaths));
  }
  if (params.moveBy) {
    query = query.lte("preferred_move_date", params.moveBy);
  }

  const { data: listings } = await query;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pre-Market Profiles</h1>
        <p className="mt-1 text-sm text-gray-500">
          Browse properties from sellers exploring their options before listing
        </p>
      </div>

      <div className="mb-6">
        <SearchFilters />
      </div>

      <MapSearch listings={(listings as ListingWithPhotos[]) || []} />

      <ListingGrid listings={(listings as ListingWithPhotos[]) || []} />
    </div>
  );
}
