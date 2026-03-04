import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { inquirySchema } from "@/lib/schemas";
import { sendInquiryNotification } from "@/lib/notifications";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = inquirySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Get the listing and its assigned agent
    const { data: listing } = await supabase
      .from("listings")
      .select("*, agents(*)")
      .eq("id", result.data.listing_id)
      .single();

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const agentId = listing.assigned_agent_id;

    // Create inquiry
    const { data: inquiry, error } = await supabase
      .from("inquiries")
      .insert({
        listing_id: result.data.listing_id,
        buyer_id: user.id,
        agent_id: agentId,
        message: result.data.message,
        inquiry_type: result.data.inquiry_type,
        status: agentId ? "agent_notified" : "new",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Increment inquiry count
    await supabase.rpc("increment_counter", {
      row_id: listing.id,
      table_name: "listings",
      column_name: "inquiries_count",
    });

    // Send notification to agent if assigned
    if (agentId && listing.agents) {
      const { data: agentProfile } = await supabase
        .from("profiles")
        .select("email, first_name")
        .eq("id", agentId)
        .single();

      const { data: buyerProfile } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", user.id)
        .single();

      if (agentProfile && buyerProfile) {
        try {
          await sendInquiryNotification(agentProfile.email, {
            agentName: agentProfile.first_name,
            buyerName: `${buyerProfile.first_name} ${buyerProfile.last_name}`,
            listingAddress: `${listing.city}, ${listing.state}`,
            inquiryType: result.data.inquiry_type,
            message: result.data.message || "",
            dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/agent`,
          });
        } catch {
          // Don't fail the request if email fails
          console.error("Failed to send inquiry notification");
        }
      }
    }

    return NextResponse.json({ inquiry });
  } catch (error) {
    console.error("Inquiry error:", error);
    return NextResponse.json({ error: "Failed to create inquiry" }, { status: 500 });
  }
}
