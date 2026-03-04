export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/utils";
import { Zap, MapPin, Calendar, Bed, Bath, Maximize } from "lucide-react";
import Link from "next/link";
import { MatchActions } from "@/components/matches/MatchActions";

export default async function BuyerMatchesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: matches } = await supabase
    .from("matches")
    .select("*, listings(*, listing_photos(*)), buyer_searches!inner(buyer_id)")
    .eq("buyer_searches.buyer_id", user.id)
    .order("match_score", { ascending: false });

  const allMatches = matches || [];
  const activeMatches = allMatches.filter(
    (m) => !["closed_won", "closed_lost", "expired"].includes(m.status)
  );
  const closedMatches = allMatches.filter(
    (m) => ["closed_won", "closed_lost", "expired"].includes(m.status)
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Your Matches</h1>

      {activeMatches.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
          <Zap className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No matches yet</p>
          <p className="mt-1 text-sm text-gray-400">
            We&apos;ll notify you when sellers match your search criteria
          </p>
          <Link href="/buyer/search" className="mt-3 inline-block text-sm text-brand-600 hover:underline">
            Update search criteria
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {activeMatches.map((match) => {
            const listing = match.listings as Record<string, unknown>;
            const photos = (listing?.listing_photos as Record<string, unknown>[]) || [];
            const photo = photos[0];

            return (
              <Card key={match.id}>
                <CardContent className="py-4">
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <Link href={`/listings/${listing?.id}`} className="shrink-0">
                      <div className="h-24 w-32 rounded-lg bg-gray-100 overflow-hidden">
                        {photo ? (
                          <img
                            src={photo.storage_path as string}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-gray-400">
                            No photo
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/listings/${listing?.id}`}
                          className="text-lg font-bold text-gray-900 hover:text-brand-600"
                        >
                          {formatPrice(listing?.asking_price as number)}
                        </Link>
                        <Badge variant={match.match_score >= 70 ? "success" : match.match_score >= 40 ? "info" : "default"}>
                          {match.match_score}% match
                        </Badge>
                        <Badge variant="default">
                          {match.status.replace(/_/g, " ")}
                        </Badge>
                      </div>

                      <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="h-3.5 w-3.5" />
                        {listing?.city as string}, {listing?.state as string}
                      </div>

                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                        {listing?.bedrooms != null && (
                          <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" /> {listing.bedrooms as number}bd</span>
                        )}
                        {listing?.bathrooms != null && (
                          <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> {listing.bathrooms as number}ba</span>
                        )}
                        {listing?.sqft != null && (
                          <span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5" /> {(listing.sqft as number).toLocaleString()} sqft</span>
                        )}
                        {listing?.preferred_move_date ? (
                          <span className="flex items-center gap-1 text-brand-600">
                            <Calendar className="h-3.5 w-3.5" /> {formatDate(listing.preferred_move_date as string)}
                          </span>
                        ) : null}
                      </div>

                      {/* Actions */}
                      <div className="mt-3">
                        <MatchActions matchId={match.id} currentStatus={match.status} viewAs="buyer" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {closedMatches.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Past Matches</h2>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-gray-100">
              {closedMatches.map((m) => {
                const listing = m.listings as Record<string, unknown>;
                return (
                  <div key={m.id} className="flex items-center justify-between py-3">
                    <span className="text-sm text-gray-600">
                      {listing?.city as string} — {formatPrice(listing?.asking_price as number)}
                    </span>
                    <Badge variant={m.status === "closed_won" ? "success" : "default"}>
                      {m.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
