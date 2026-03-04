export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, timeAgo } from "@/lib/utils";
import { DollarSign, Users, CheckCircle, Clock } from "lucide-react";

export default async function LenderDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: referrals } = await supabase
    .from("lender_referrals")
    .select("*, profiles!lender_referrals_buyer_id_fkey(first_name, last_name, email)")
    .eq("lender_id", user.id)
    .order("created_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allReferrals: any[] = referrals || [];
  const activeReferrals = allReferrals.filter((r: any) => !["funded", "lost"].includes(r.status));
  const funded = allReferrals.filter((r: any) => r.status === "funded");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Lender Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Referrals", value: allReferrals.length, icon: Users },
          { label: "Active", value: activeReferrals.length, icon: Clock },
          { label: "Funded", value: funded.length, icon: CheckCircle },
          { label: "Revenue", value: `$${funded.reduce((s: number, r: any) => s + (r.referral_fee_amount || 0), 0).toLocaleString()}`, icon: DollarSign },
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

      {/* Active referrals */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Active Referrals</h2>
        </CardHeader>
        <CardContent>
          {activeReferrals.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-500">No active referrals</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {activeReferrals.map((ref) => {
                const buyer = ref.profiles as Record<string, string>;
                return (
                  <div key={ref.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        {buyer?.first_name} {buyer?.last_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {ref.source?.replace("_", " ")} · {timeAgo(ref.created_at)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        ref.status === "pre_approved" ? "success" :
                        ref.status === "application_started" ? "warning" : "info"
                      }
                    >
                      {ref.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
