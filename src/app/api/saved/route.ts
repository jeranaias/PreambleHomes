import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { listing_id, action } = await request.json();

  if (action === "save") {
    await supabase.from("saved_listings").insert({
      buyer_id: user.id,
      listing_id,
    });
    await supabase.rpc("increment_counter", {
      row_id: listing_id,
      table_name: "listings",
      column_name: "saves_count",
    });
  } else if (action === "unsave") {
    await supabase.from("saved_listings").delete()
      .eq("buyer_id", user.id)
      .eq("listing_id", listing_id);
  }

  return NextResponse.json({ success: true });
}
