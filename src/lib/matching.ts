import type { Listing, BuyerSearch } from "@/types/database";

export interface MatchFactors {
  priceAlignment: number; // 0-30
  locationMatch: number; // 0-25
  timelineOverlap: number; // 0-25
  specMatch: number; // 0-15
  propertyTypeMatch: number; // 0-5
  total: number; // 0-100
}

/**
 * Calculate how well a listing matches a buyer's search criteria.
 * Returns a score from 0-100 with breakdown by factor.
 */
export function calculateMatchScore(
  listing: Listing,
  search: BuyerSearch
): MatchFactors {
  const factors: MatchFactors = {
    priceAlignment: 0,
    locationMatch: 0,
    timelineOverlap: 0,
    specMatch: 0,
    propertyTypeMatch: 0,
    total: 0,
  };

  // PRICE (30 pts)
  if (search.min_price != null && search.max_price != null) {
    if (
      listing.asking_price >= search.min_price &&
      listing.asking_price <= search.max_price
    ) {
      factors.priceAlignment = 30;
    } else {
      const midpoint = (search.min_price + search.max_price) / 2;
      const deviation =
        Math.abs(listing.asking_price - midpoint) / midpoint;
      if (deviation < 0.15) {
        factors.priceAlignment = Math.round(30 * (1 - deviation / 0.15));
      }
    }
  } else {
    // No price constraints — give partial credit
    factors.priceAlignment = 15;
  }

  // LOCATION (25 pts) — computed via PostGIS in the query, passed as distance_miles
  // This function is called after a PostGIS query that adds distance_miles to the listing
  const distanceMiles = (listing as Listing & { distance_miles?: number })
    .distance_miles;
  if (distanceMiles != null && search.search_radius_miles) {
    if (distanceMiles <= search.search_radius_miles) {
      factors.locationMatch = Math.round(
        25 * (1 - distanceMiles / search.search_radius_miles)
      );
    }
  } else {
    // Fall back to city/county matching
    const listingCity = listing.city.toLowerCase();
    const listingCounty = (listing.county || "").toLowerCase();
    const targetCities = search.target_cities.map((c) => c.toLowerCase());
    const targetCounties = search.target_counties.map((c) => c.toLowerCase());

    if (targetCities.includes(listingCity)) {
      factors.locationMatch = 25;
    } else if (targetCounties.includes(listingCounty)) {
      factors.locationMatch = 18;
    }
  }

  // TIMELINE OVERLAP (25 pts) — the key differentiator
  factors.timelineOverlap = calculateTimelineScore(listing, search);

  // SPECS (15 pts)
  if (search.min_bedrooms != null && listing.bedrooms != null) {
    if (listing.bedrooms >= search.min_bedrooms) factors.specMatch += 5;
  } else {
    factors.specMatch += 2; // no constraint
  }
  if (search.min_bathrooms != null && listing.bathrooms != null) {
    if (listing.bathrooms >= search.min_bathrooms) factors.specMatch += 5;
  } else {
    factors.specMatch += 2;
  }
  if (search.min_sqft != null && listing.sqft != null) {
    if (listing.sqft >= search.min_sqft) factors.specMatch += 5;
  } else {
    factors.specMatch += 2;
  }

  // PROPERTY TYPE (5 pts)
  if (
    search.property_types.length === 0 ||
    search.property_types.includes(listing.property_type)
  ) {
    factors.propertyTypeMatch = 5;
  }

  factors.total =
    factors.priceAlignment +
    factors.locationMatch +
    factors.timelineOverlap +
    factors.specMatch +
    factors.propertyTypeMatch;

  return factors;
}

function calculateTimelineScore(
  listing: Listing,
  search: BuyerSearch
): number {
  const sellerStart = listing.earliest_move_date || listing.preferred_move_date;
  const sellerEnd = listing.latest_move_date || listing.preferred_move_date;
  const buyerStart = search.earliest_move_date || search.target_move_date;
  const buyerEnd = search.latest_move_date || search.target_move_date;

  if (!sellerStart || !buyerStart) return 12; // No timeline data — partial credit

  const sStart = new Date(sellerStart).getTime();
  const sEnd = new Date(sellerEnd || sellerStart).getTime();
  const bStart = new Date(buyerStart).getTime();
  const bEnd = new Date(buyerEnd || buyerStart).getTime();

  const overlapStart = Math.max(sStart, bStart);
  const overlapEnd = Math.min(sEnd, bEnd);
  const overlapDays = Math.max(
    0,
    (overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)
  );

  if (overlapDays <= 0) return 0;

  // Full points for 30+ days of overlap
  return Math.min(25, Math.round((overlapDays / 30) * 25));
}

/** Minimum score to surface a match to users */
export const MATCH_THRESHOLD = 40;
