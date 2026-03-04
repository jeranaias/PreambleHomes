import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { calculateMatchScore, MATCH_THRESHOLD } from "@/lib/matching";
import type { Listing, BuyerSearch } from "@/types/database";

export async function POST() {
  try {
    const supabase = await createServiceClient();

    // Get all active listings
    const { data: listings } = await supabase
      .from("listings")
      .select("*")
      .eq("status", "active");

    // Get all active buyer searches
    const { data: searches } = await supabase
      .from("buyer_searches")
      .select("*")
      .eq("status", "active");

    if (!listings || !searches) {
      return NextResponse.json({ matched: 0 });
    }

    let matchCount = 0;
    const newMatchIds: string[] = [];

    for (const listing of listings as Listing[]) {
      for (const search of searches as BuyerSearch[]) {
        const factors = calculateMatchScore(listing, search);

        if (factors.total >= MATCH_THRESHOLD) {
          // Check if match already exists
          const { data: existing } = await supabase
            .from("matches")
            .select("id")
            .eq("listing_id", listing.id)
            .eq("buyer_search_id", search.id)
            .single();

          if (!existing) {
            const { data: newMatch } = await supabase.from("matches").insert({
              listing_id: listing.id,
              buyer_search_id: search.id,
              match_score: Math.round(factors.total),
              initiated_by: "system",
              status: "matched",
            }).select("id").single();

            if (newMatch) {
              newMatchIds.push(newMatch.id);
            }
            matchCount++;
          }
        }
      }
    }

    // Send email notifications for new matches (fire and forget)
    if (newMatchIds.length > 0 && process.env.RESEND_API_KEY) {
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchIds: newMatchIds }),
      }).catch(() => {});
    }

    return NextResponse.json({ matched: matchCount });
  } catch (error) {
    console.error("Match scan error:", error);
    return NextResponse.json({ error: "Match scan failed" }, { status: 500 });
  }
}
