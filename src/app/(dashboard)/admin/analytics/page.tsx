export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BarChart3, Users, FileText, Zap, TrendingUp, DollarSign } from "lucide-react";

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/");

  // User breakdown by role
  const { data: usersByRole } = await supabase.rpc("count_users_by_role").select("*");

  // Listing stats
  const { data: listingsByStatus } = await supabase.rpc("count_listings_by_status").select("*");

  // Match stats
  const { count: totalMatches } = await supabase.from("matches").select("*", { count: "exact", head: true });
  const { count: closedWon } = await supabase.from("matches").select("*", { count: "exact", head: true }).eq("status", "closed_won");
  const { count: totalInquiries } = await supabase.from("inquiries").select("*", { count: "exact", head: true });

  // Referral revenue
  const { data: referralRevenue } = await supabase
    .from("matches")
    .select("referral_fee_amount")
    .eq("status", "closed_won")
    .eq("referral_fee_paid", true);

  const totalRevenue = (referralRevenue || []).reduce(
    (sum, r) => sum + (r.referral_fee_amount || 0), 0
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>

      {/* Revenue */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Referral Revenue</p>
              <p className="text-3xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Matches", value: totalMatches || 0, icon: Zap },
          { label: "Closed Won", value: closedWon || 0, icon: TrendingUp },
          { label: "Conversion Rate", value: totalMatches ? `${Math.round(((closedWon || 0) / totalMatches) * 100)}%` : "0%", icon: BarChart3 },
          { label: "Total Inquiries", value: totalInquiries || 0, icon: FileText },
        ].map((metric) => (
          <Card key={metric.label}>
            <CardContent className="py-4">
              <metric.icon className="h-5 w-5 text-gray-400" />
              <p className="mt-2 text-2xl font-bold text-gray-900">{metric.value}</p>
              <p className="text-xs text-gray-500">{metric.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Note about advanced analytics */}
      <Card>
        <CardContent className="py-6 text-center">
          <BarChart3 className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-2 text-sm text-gray-500">
            Advanced analytics with charts and trends will be available with Vercel Analytics integration.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            For now, key metrics are tracked above. Connect Vercel Analytics for time-series data.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
