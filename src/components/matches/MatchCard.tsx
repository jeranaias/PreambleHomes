import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDate } from "@/lib/utils";
import { MapPin, Calendar, ArrowRight } from "lucide-react";
import type { MatchWithDetails } from "@/types/database";

interface MatchCardProps {
  match: MatchWithDetails;
  viewAs: "buyer" | "seller";
  onAction?: (matchId: string, action: string) => void;
}

const statusColors: Record<string, "default" | "success" | "warning" | "info" | "danger"> = {
  matched: "info",
  buyer_interested: "info",
  seller_interested: "info",
  agent_contacted: "warning",
  in_discussion: "warning",
  under_contract: "success",
  closed_won: "success",
  closed_lost: "danger",
  expired: "default",
};

export function MatchCard({ match, viewAs, onAction }: MatchCardProps) {
  const listing = match.listings;

  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-4">
        {/* Photo thumbnail */}
        <div className="h-20 w-20 shrink-0 rounded-lg bg-gray-100 overflow-hidden">
          {listing.listing_photos?.[0] ? (
            <img
              src={listing.listing_photos[0].storage_path}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-gray-400">
              No photo
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900">
              {formatPrice(listing.asking_price)}
            </p>
            {match.match_score != null && (
              <Badge variant={match.match_score >= 70 ? "success" : "info"}>
                {match.match_score}% match
              </Badge>
            )}
            <Badge variant={statusColors[match.status] || "default"}>
              {match.status.replace(/_/g, " ")}
            </Badge>
          </div>
          <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {listing.city}, {listing.state}
            </span>
            {listing.preferred_move_date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(listing.preferred_move_date)}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="shrink-0">
          {match.status === "matched" && (
            <Button
              size="sm"
              onClick={() => onAction?.(match.id, viewAs === "buyer" ? "buyer_interested" : "seller_interested")}
            >
              I&apos;m Interested <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          )}
          {match.status === "buyer_interested" && viewAs === "seller" && (
            <Button
              size="sm"
              onClick={() => onAction?.(match.id, "agent_contacted")}
            >
              Contact Agent
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
