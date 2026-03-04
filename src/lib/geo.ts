/**
 * PostGIS helper functions for geographic queries.
 * These build SQL fragments for use with Supabase's .rpc() calls.
 */

/** Convert address to a PostGIS point string for insertion */
export function toPointWKT(lng: number, lat: number): string {
  return `SRID=4326;POINT(${lng} ${lat})`;
}

/**
 * Build a Supabase RPC call to find listings within a radius.
 * Requires a Supabase function `nearby_listings` to be created:
 *
 * ```sql
 * create or replace function nearby_listings(
 *   lat double precision,
 *   lng double precision,
 *   radius_miles double precision default 25
 * )
 * returns table (
 *   id uuid,
 *   distance_miles double precision
 * )
 * language sql stable
 * as $$
 *   select
 *     id,
 *     ST_Distance(
 *       location::geography,
 *       ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
 *     ) / 1609.34 as distance_miles
 *   from public.listings
 *   where status = 'active'
 *     and ST_DWithin(
 *       location::geography,
 *       ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
 *       radius_miles * 1609.34
 *     )
 *   order by distance_miles;
 * $$;
 * ```
 */
export interface NearbyParams {
  lat: number;
  lng: number;
  radius_miles?: number;
}

/**
 * Simple distance calculation (Haversine) for client-side approximations.
 * For accurate distances, use PostGIS on the server.
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3958.8; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
