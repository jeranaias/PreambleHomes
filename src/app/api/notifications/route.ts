import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendMatchNotification } from "@/lib/notifications";
import type { Profile, Listing, BuyerSearch } from "@/types/database";

/**
 * Send match notification emails for new matches.
 * Called after the match scan finds new matches.
 */
export async function POST(request: Request) {
  try {
    const { matchIds } = await request.json() as { matchIds: string[] };
    if (!matchIds || matchIds.length === 0) {
      return NextResponse.json({ sent: 0 });
    }

    const supabase = await createServiceClient();
    let sent = 0;

    for (const matchId of matchIds) {
      const { data: match } = await supabase
        .from("matches")
        .select("*, listings(*), buyer_searches(*)")
        .eq("id", matchId)
        .single();

      if (!match) continue;

      const listing = match.listings as unknown as Listing;
      const search = match.buyer_searches as unknown as BuyerSearch;

      // Notify the buyer
      const { data: buyerProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", search.buyer_id)
        .single();

      if (buyerProfile && search.notify_new_matches) {
        try {
          await sendMatchNotification((buyerProfile as Profile).email, {
            recipientName: (buyerProfile as Profile).first_name,
            matchScore: match.match_score || 0,
            listingCity: listing.city,
            listingPrice: listing.asking_price,
            matchUrl: `${process.env.NEXT_PUBLIC_APP_URL}/buyer/matches`,
          });
          sent++;
        } catch {
          console.error(`Failed to send match notification to ${(buyerProfile as Profile).email}`);
        }
      }

      // Notify the seller
      const { data: sellerProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", listing.seller_id)
        .single();

      if (sellerProfile) {
        try {
          await sendMatchNotification((sellerProfile as Profile).email, {
            recipientName: (sellerProfile as Profile).first_name,
            matchScore: match.match_score || 0,
            listingCity: listing.city,
            listingPrice: listing.asking_price,
            matchUrl: `${process.env.NEXT_PUBLIC_APP_URL}/seller`,
          });
          sent++;
        } catch {
          console.error(`Failed to send match notification to ${(sellerProfile as Profile).email}`);
        }
      }
    }

    return NextResponse.json({ sent });
  } catch (error) {
    console.error("Notification error:", error);
    return NextResponse.json({ error: "Failed to send notifications" }, { status: 500 });
  }
}
