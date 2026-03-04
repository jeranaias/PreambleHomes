"use client";

import { useState } from "react";
import { ListingMap } from "@/components/listings/ListingMap";
import { Button } from "@/components/ui/button";
import { Map, List } from "lucide-react";
import type { ListingWithPhotos } from "@/types/database";

interface MapSearchProps {
  listings: ListingWithPhotos[];
}

export function MapSearch({ listings }: MapSearchProps) {
  const [showMap, setShowMap] = useState(false);

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowMap(!showMap)}
        >
          {showMap ? (
            <><List className="mr-1 h-4 w-4" /> List View</>
          ) : (
            <><Map className="mr-1 h-4 w-4" /> Map View</>
          )}
        </Button>
      </div>
      {showMap && <ListingMap listings={listings} />}
    </div>
  );
}
