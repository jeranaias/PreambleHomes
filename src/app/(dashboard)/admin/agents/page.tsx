export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AgentVerifyButton } from "@/components/agents/AgentVerifyButton";
import { getInitials, timeAgo } from "@/lib/utils";

export default async function AdminAgentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/");

  const { data: agents } = await supabase
    .from("agents")
    .select("*, profiles!agents_id_fkey(first_name, last_name, email)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Agent Management</h1>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">All Agents ({(agents || []).length})</h2>
        </CardHeader>
        <CardContent>
          {(agents || []).length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-500">No agents registered</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {(agents || []).map((agent) => {
                const p = agent.profiles as Record<string, string>;
                return (
                  <div key={agent.id} className="flex items-center gap-4 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                      {p ? getInitials(p.first_name, p.last_name) : "??"}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {p?.first_name} {p?.last_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {agent.brokerage} · License: {agent.license_number} ({agent.license_state})
                      </p>
                      <p className="text-xs text-gray-400">
                        Markets: {(agent.markets || []).join(", ") || "None set"} · Joined {timeAgo(agent.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={agent.subscription_status === "active" ? "success" : "default"}>
                        {agent.subscription_status}
                      </Badge>
                      <AgentVerifyButton agentId={agent.id} isVerified={agent.is_verified} />
                    </div>
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
