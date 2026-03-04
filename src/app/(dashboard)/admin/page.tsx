export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/utils";
import { Users, FileText, Zap, DollarSign, Shield, BarChart3 } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verify admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/");

  // Aggregate stats
  const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true });
  const { count: totalListings } = await supabase.from("listings").select("*", { count: "exact", head: true });
  const { count: activeListings } = await supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "active");
  const { count: totalMatches } = await supabase.from("matches").select("*", { count: "exact", head: true });
  const { count: totalAgents } = await supabase.from("agents").select("*", { count: "exact", head: true });
  const { count: verifiedAgents } = await supabase.from("agents").select("*", { count: "exact", head: true }).eq("is_verified", true);

  // Recent activity
  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: recentListings } = await supabase
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Users", value: totalUsers || 0, icon: Users },
          { label: "Listings", value: totalListings || 0, icon: FileText },
          { label: "Active", value: activeListings || 0, icon: FileText },
          { label: "Matches", value: totalMatches || 0, icon: Zap },
          { label: "Agents", value: totalAgents || 0, icon: Shield },
          { label: "Verified", value: verifiedAgents || 0, icon: Shield },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="py-3">
              <stat.icon className="h-4 w-4 text-gray-400" />
              <p className="mt-1 text-xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent users */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Recent Signups</h2>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-gray-100">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(recentUsers || []).map((u: any) => (
                <div key={u.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {u.first_name} {u.last_name}
                    </p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="info">{u.role}</Badge>
                    <span className="text-xs text-gray-400">{timeAgo(u.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent listings */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Recent Listings</h2>
          </CardHeader>
          <CardContent>
            {(recentListings || []).length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-500">No listings yet</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(recentListings || []).map((l: any) => (
                  <div key={l.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {l.city}, {l.state} — ${Number(l.asking_price).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {l.property_type.replace("_", " ")} · {timeAgo(l.created_at)}
                      </p>
                    </div>
                    <Badge
                      variant={l.status === "active" ? "success" : l.status === "draft" ? "default" : "warning"}
                    >
                      {l.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div className="flex gap-3">
        <Link href="/admin/agents">
          <Button variant="outline">
            <Shield className="mr-2 h-4 w-4" /> Manage Agents
          </Button>
        </Link>
        <Link href="/admin/analytics">
          <Button variant="outline">
            <BarChart3 className="mr-2 h-4 w-4" /> Analytics
          </Button>
        </Link>
      </div>
    </div>
  );
}
