export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, timeAgo } from "@/lib/utils";
import { FileText, MapPin, Eye, Heart, MessageCircle } from "lucide-react";
import type { Listing } from "@/types/database";

export default async function AgentListingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("assigned_agent_id", user.id)
    .order("created_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const myListings: any[] = (listings || []) as Listing[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Client Listings</h1>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">
            Assigned Listings ({myListings.length})
          </h2>
        </CardHeader>
        <CardContent>
          {myListings.length === 0 ? (
            <div className="py-8 text-center">
              <FileText className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-2 text-gray-500">No listings assigned to you yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {myListings.map((l) => (
                <div key={l.id} className="py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link href={`/listings/${l.id}`} className="font-medium text-gray-900 hover:text-brand-600">
                        {formatPrice(l.asking_price)} — {l.city}, {l.state}
                      </Link>
                      <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                        <span>{l.bedrooms}bd / {l.bathrooms}ba</span>
                        {l.sqft && <span>{l.sqft.toLocaleString()} sqft</span>}
                        <span>Created {timeAgo(l.created_at)}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {l.views_count} views</span>
                        <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {l.saves_count} saves</span>
                        <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {l.inquiries_count} inquiries</span>
                      </div>
                    </div>
                    <Badge
                      variant={l.status === "active" ? "success" : l.status === "draft" ? "default" : "warning"}
                    >
                      {l.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
