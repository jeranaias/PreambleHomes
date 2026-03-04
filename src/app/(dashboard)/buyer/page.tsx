export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { Search, Heart, Zap, MapPin } from "lucide-react";

export default async function BuyerDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: searches } = await supabase
    .from("buyer_searches")
    .select("*")
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false });

  const { data: savedListings } = await supabase
    .from("saved_listings")
    .select("*, listings(*)")
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: matches } = await supabase
    .from("matches")
    .select("*, listings(*), buyer_searches!inner(buyer_id)")
    .eq("buyer_searches.buyer_id", user.id)
    .order("match_score", { ascending: false })
    .limit(10);

  const activeSearches = (searches || []).filter((s) => s.status === "active");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Buyer Dashboard</h1>
        <Link href="/buyer/search">
          <Button>
            <Search className="mr-2 h-4 w-4" /> Edit Search
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active Searches", value: activeSearches.length, icon: Search },
          { label: "Matches", value: (matches || []).length, icon: Zap },
          { label: "Saved", value: (savedListings || []).length, icon: Heart },
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

      {/* Search criteria summary */}
      {activeSearches.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Your Search Criteria</h2>
          </CardHeader>
          <CardContent>
            {activeSearches.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-2">
                <div>
                  <div className="flex flex-wrap gap-2">
                    {s.target_cities?.map((city: string) => (
                      <Badge key={city} variant="info">
                        <MapPin className="mr-1 h-3 w-3" /> {city}
                      </Badge>
                    ))}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {s.min_price || s.max_price
                      ? `${s.min_price ? formatPrice(s.min_price) : "$0"} - ${s.max_price ? formatPrice(s.max_price) : "Any"}`
                      : "Any price"
                    }
                    {s.min_bedrooms ? ` · ${s.min_bedrooms}+ beds` : ""}
                  </p>
                </div>
                <Link href="/buyer/search">
                  <Button variant="ghost" size="sm">Edit</Button>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Matches */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Your Matches</h2>
            <Link href="/buyer/matches">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {(matches || []).length === 0 ? (
            <div className="py-8 text-center">
              <Zap className="mx-auto h-8 w-8 text-gray-300" />
              <p className="mt-2 text-gray-500">No matches yet</p>
              <p className="text-sm text-gray-400">
                {activeSearches.length === 0
                  ? "Set up your search criteria to start getting matches"
                  : "We'll notify you when we find matching pre-market profiles"
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {(matches || []).slice(0, 5).map((m: Record<string, unknown>) => (
                <div key={m.id as string} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatPrice((m.listings as Record<string, unknown>)?.asking_price as number)} —{" "}
                      {(m.listings as Record<string, unknown>)?.city as string},{" "}
                      {(m.listings as Record<string, unknown>)?.state as string}
                    </p>
                  </div>
                  <Badge variant={(m.match_score as number) >= 70 ? "success" : "info"}>
                    {m.match_score as number}% match
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
