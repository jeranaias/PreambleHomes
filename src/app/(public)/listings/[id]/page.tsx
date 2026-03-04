export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ListingDetailActions } from "@/components/listings/ListingDetailActions";
import { formatPrice, formatDate } from "@/lib/utils";
import { MapPin, Bed, Bath, Maximize, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ListingWithPhotos } from "@/types/database";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: listing } = await supabase
    .from("listings")
    .select("*, listing_photos(*)")
    .eq("id", id)
    .single();

  if (!listing) notFound();

  const l = listing as ListingWithPhotos;
  const photos = l.listing_photos || [];
  const locationText = l.show_exact_address
    ? `${l.address_line1}, ${l.city}, ${l.state} ${l.zip}`
    : `${l.city}, ${l.state}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/listings" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to browse
      </Link>

      {/* Photos */}
      {photos.length > 0 && l.show_photos && (
        <div className="mb-6 grid gap-2 sm:grid-cols-2">
          <div className="aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
            <img src={photos[0].storage_path} alt="" className="h-full w-full object-cover" />
          </div>
          {photos.length > 1 && (
            <div className="grid grid-cols-2 gap-2">
              {photos.slice(1, 5).map((p) => (
                <div key={p.id} className="aspect-square overflow-hidden rounded-xl bg-gray-100">
                  <img src={p.storage_path} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            {l.title && <h1 className="text-2xl font-bold text-gray-900">{l.title}</h1>}
            <p className="mt-1 text-3xl font-bold text-brand-600">{formatPrice(l.asking_price)}</p>
            {l.price_negotiable && <Badge variant="default" className="mt-1">Negotiable</Badge>}
            <div className="mt-2 flex items-center gap-1 text-gray-600">
              <MapPin className="h-4 w-4" />
              {locationText}
            </div>
          </div>

          {/* Specs */}
          <div className="flex flex-wrap gap-6 text-gray-700">
            {l.bedrooms != null && (
              <span className="flex items-center gap-1"><Bed className="h-5 w-5" /> {l.bedrooms} Bedrooms</span>
            )}
            {l.bathrooms != null && (
              <span className="flex items-center gap-1"><Bath className="h-5 w-5" /> {l.bathrooms} Bathrooms</span>
            )}
            {l.sqft != null && (
              <span className="flex items-center gap-1"><Maximize className="h-5 w-5" /> {l.sqft.toLocaleString()} sqft</span>
            )}
          </div>

          {/* Timeline */}
          {(l.preferred_move_date || l.earliest_move_date || l.latest_move_date) && (
            <Card>
              <CardContent className="py-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> Seller Timeline
                </h3>
                <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                  {l.earliest_move_date && (
                    <div>
                      <p className="text-gray-500">Earliest</p>
                      <p className="font-medium">{formatDate(l.earliest_move_date)}</p>
                    </div>
                  )}
                  {l.preferred_move_date && (
                    <div>
                      <p className="text-gray-500">Preferred</p>
                      <p className="font-medium">{formatDate(l.preferred_move_date)}</p>
                    </div>
                  )}
                  {l.latest_move_date && (
                    <div>
                      <p className="text-gray-500">Latest</p>
                      <p className="font-medium">{formatDate(l.latest_move_date)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {l.seller_notes && (
            <div>
              <h3 className="font-semibold text-gray-900">Seller Notes</h3>
              <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">{l.seller_notes}</p>
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-xs text-gray-400 border-t border-gray-100 pt-4">
            This is a pre-market intent profile and does not constitute a property listing.
            No listing agreement exists between any parties through this platform.
            Once a formal listing agreement is established, all applicable MLS rules apply.
          </p>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <ListingDetailActions listingId={l.id} listingCity={l.city} />

          {/* Property details card */}
          <Card>
            <CardContent className="py-4">
              <h3 className="font-semibold text-gray-900 mb-3">Details</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Type</dt>
                  <dd className="font-medium capitalize">{l.property_type.replace("_", " ")}</dd>
                </div>
                {l.year_built && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Year Built</dt>
                    <dd className="font-medium">{l.year_built}</dd>
                  </div>
                )}
                {l.lot_sqft && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Lot Size</dt>
                    <dd className="font-medium">{l.lot_sqft.toLocaleString()} sqft</dd>
                  </div>
                )}
                {l.garage_spaces != null && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Garage</dt>
                    <dd className="font-medium">{l.garage_spaces} spaces</dd>
                  </div>
                )}
                {l.has_pool && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Pool</dt>
                    <dd className="font-medium">Yes</dd>
                  </div>
                )}
                {l.has_hoa && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">HOA</dt>
                    <dd className="font-medium">{l.hoa_monthly ? `$${l.hoa_monthly}/mo` : "Yes"}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
