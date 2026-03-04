export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListingGrid } from "@/components/listings/ListingGrid";
import { formatPrice } from "@/lib/utils";
import { TrendingUp, Target, DollarSign, Filter } from "lucide-react";
import type { ListingWithPhotos } from "@/types/database";

export default async function InvestorDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("investor_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Get listings that might interest investors
  // Prioritize: price negotiable, cash-friendly, fixer-uppers
  const { data: listings } = await supabase
    .from("listings")
    .select("*, listing_photos(*)")
    .eq("status", "active")
    .eq("price_negotiable", true)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Investor Panel</h1>
        <Badge variant="info">Phase 3 Preview</Badge>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active Opportunities", value: (listings || []).length, icon: Target },
          { label: "Negotiable", value: (listings || []).filter((l: any) => l.price_negotiable).length, icon: DollarSign },
          { label: "New This Week", value: (listings || []).filter((l: any) => {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return new Date(l.created_at) > weekAgo;
          }).length, icon: TrendingUp },
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

      {/* Investment criteria setup */}
      {!profile && (
        <Card>
          <CardContent className="py-6 text-center">
            <Filter className="mx-auto h-8 w-8 text-brand-600" />
            <h3 className="mt-2 font-semibold text-gray-900">Set Up Investment Criteria</h3>
            <p className="mt-1 text-sm text-gray-500">
              Define your budget, strategy, and target markets to get personalized opportunities
            </p>
            <Button className="mt-4">Set Up Criteria</Button>
          </CardContent>
        </Card>
      )}

      {/* Opportunities */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Pre-Market Opportunities</h2>
        <ListingGrid listings={(listings as ListingWithPhotos[]) || []} />
      </div>
    </div>
  );
}
