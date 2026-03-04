export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, timeAgo } from "@/lib/utils";
import { PublishButton } from "@/components/listings/PublishButton";
import { PlusCircle, Eye, Heart, MessageCircle, MapPin } from "lucide-react";
import type { Listing } from "@/types/database";

export default async function SellerDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  const { data: matches } = await supabase
    .from("matches")
    .select("*, listings!inner(seller_id)")
    .eq("listings.seller_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const myListings: any[] = (listings || []) as Listing[];
  const activeCount = myListings.filter((l: any) => l.status === "active").length;
  const totalViews = myListings.reduce((sum: number, l: any) => sum + l.views_count, 0);
  const totalInquiries = myListings.reduce((sum: number, l: any) => sum + l.inquiries_count, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
        <Link href="/seller/new-listing">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> New Profile
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Active Profiles", value: activeCount, icon: MapPin },
          { label: "Total Views", value: totalViews, icon: Eye },
          { label: "Saves", value: myListings.reduce((s: number, l: any) => s + l.saves_count, 0), icon: Heart },
          { label: "Inquiries", value: totalInquiries, icon: MessageCircle },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="py-4">
              <div className="flex items-center gap-2 text-gray-500">
                <stat.icon className="h-4 w-4" />
                <span className="text-xs">{stat.label}</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Listings */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">My Pre-Market Profiles</h2>
        </CardHeader>
        <CardContent>
          {myListings.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-500">No profiles yet</p>
              <Link href="/seller/new-listing" className="mt-2 inline-block text-sm text-brand-600 hover:underline">
                Create your first pre-market profile
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {myListings.map((l) => (
                <div key={l.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatPrice(l.asking_price)} — {l.city}, {l.state}
                    </p>
                    <p className="text-sm text-gray-500">
                      {l.bedrooms}bd / {l.bathrooms}ba · Created {timeAgo(l.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={l.status === "active" ? "success" : l.status === "draft" ? "default" : "warning"}
                    >
                      {l.status}
                    </Badge>
                    <PublishButton listingId={l.id} currentStatus={l.status} />
                    <Link href={`/seller/listing/${l.id}/edit`}>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent matches */}
      {(matches || []).length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Recent Matches</h2>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              {matches!.length} new match{matches!.length !== 1 ? "es" : ""} found
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
