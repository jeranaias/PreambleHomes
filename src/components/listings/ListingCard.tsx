import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/utils";
import { MapPin, Bed, Bath, Maximize, Calendar } from "lucide-react";
import type { ListingWithPhotos } from "@/types/database";

interface ListingCardProps {
  listing: ListingWithPhotos;
  matchScore?: number;
}

export function ListingCard({ listing, matchScore }: ListingCardProps) {
  const photo = listing.listing_photos?.[0];
  const locationText = listing.show_exact_address
    ? `${listing.address_line1}, ${listing.city}`
    : `${listing.city}, ${listing.state}`;

  return (
    <Link href={`/listings/${listing.id}`}>
      <Card className="group overflow-hidden transition-shadow hover:shadow-md">
        {/* Photo */}
        <div className="relative aspect-[4/3] bg-gray-100">
          {photo ? (
            <img
              src={photo.storage_path}
              alt={listing.title || locationText}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              No photos
            </div>
          )}
          {matchScore != null && (
            <div className="absolute right-2 top-2">
              <Badge variant={matchScore >= 70 ? "success" : matchScore >= 40 ? "info" : "default"}>
                {matchScore}% match
              </Badge>
            </div>
          )}
          {listing.status !== "active" && (
            <div className="absolute left-2 top-2">
              <Badge variant="warning">{listing.status}</Badge>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-4">
          <div className="flex items-start justify-between">
            <p className="text-lg font-bold text-gray-900">{formatPrice(listing.asking_price)}</p>
            {listing.price_negotiable && (
              <Badge variant="default">Negotiable</Badge>
            )}
          </div>

          <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="h-3.5 w-3.5" />
            {locationText}
          </div>

          {/* Specs */}
          <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
            {listing.bedrooms != null && (
              <span className="flex items-center gap-1">
                <Bed className="h-3.5 w-3.5" /> {listing.bedrooms} bd
              </span>
            )}
            {listing.bathrooms != null && (
              <span className="flex items-center gap-1">
                <Bath className="h-3.5 w-3.5" /> {listing.bathrooms} ba
              </span>
            )}
            {listing.sqft != null && (
              <span className="flex items-center gap-1">
                <Maximize className="h-3.5 w-3.5" /> {listing.sqft.toLocaleString()} sqft
              </span>
            )}
          </div>

          {/* Timeline */}
          {listing.preferred_move_date && (
            <div className="mt-3 flex items-center gap-1 text-xs text-brand-600">
              <Calendar className="h-3.5 w-3.5" />
              Target: {formatDate(listing.preferred_move_date)}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
