export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, timeAgo } from "@/lib/utils";
import { Users, Zap, FileText, DollarSign } from "lucide-react";

export default async function AgentDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: agent } = await supabase
    .from("agents")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: assignedListings } = await supabase
    .from("listings")
    .select("*")
    .eq("assigned_agent_id", user.id)
    .order("created_at", { ascending: false });

  const { data: handledMatches } = await supabase
    .from("matches")
    .select("*, listings(*)")
    .eq("handling_agent_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: inquiries } = await supabase
    .from("inquiries")
    .select("*, listings(*)")
    .eq("agent_id", user.id)
    .eq("status", "new")
    .order("created_at", { ascending: false });

  const listings = assignedListings || [];
  const matches = handledMatches || [];
  const newInquiries = inquiries || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Agent Dashboard</h1>
        {agent && (
          <Badge variant={agent.is_verified ? "success" : "warning"}>
            {agent.is_verified ? "Verified" : "Pending Verification"}
          </Badge>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Active Listings", value: listings.filter((l) => l.status === "active").length, icon: FileText },
          { label: "Active Matches", value: matches.filter((m) => !["closed_won", "closed_lost", "expired"].includes(m.status)).length, icon: Zap },
          { label: "New Inquiries", value: newInquiries.length, icon: Users },
          { label: "Closed Deals", value: matches.filter((m) => m.status === "closed_won").length, icon: DollarSign },
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

      {/* New inquiries */}
      {newInquiries.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">
              New Inquiries <Badge variant="danger">{newInquiries.length}</Badge>
            </h2>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-gray-100">
              {newInquiries.map((inq) => (
                <div key={inq.id} className="py-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">
                      {(inq.listings as Record<string, unknown>)?.city as string} — {formatPrice((inq.listings as Record<string, unknown>)?.asking_price as number)}
                    </p>
                    <span className="text-xs text-gray-400">{timeAgo(inq.created_at)}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {inq.inquiry_type.replace("_", " ")}
                    {inq.message && `: "${inq.message.slice(0, 100)}${inq.message.length > 100 ? "..." : ""}"`}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active matches */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Active Matches</h2>
        </CardHeader>
        <CardContent>
          {matches.length === 0 ? (
            <p className="py-4 text-center text-gray-500">No active matches yet</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {matches.slice(0, 5).map((m) => (
                <div key={m.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900">
                      {(m.listings as Record<string, unknown>)?.city as string} — {formatPrice((m.listings as Record<string, unknown>)?.asking_price as number)}
                    </p>
                    <p className="text-sm text-gray-500">{m.match_score}% match</p>
                  </div>
                  <Badge variant={m.status === "in_discussion" ? "warning" : "info"}>
                    {m.status.replace(/_/g, " ")}
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
