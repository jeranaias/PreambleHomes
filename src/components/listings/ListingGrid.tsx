import { ListingCard } from "./ListingCard";
import type { ListingWithPhotos } from "@/types/database";

interface ListingGridProps {
  listings: ListingWithPhotos[];
  matchScores?: Record<string, number>;
}

export function ListingGrid({ listings, matchScores }: ListingGridProps) {
  if (listings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
        <p className="text-gray-500">No pre-market profiles found</p>
        <p className="mt-1 text-sm text-gray-400">Try adjusting your search criteria</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          matchScore={matchScores?.[listing.id]}
        />
      ))}
    </div>
  );
}
