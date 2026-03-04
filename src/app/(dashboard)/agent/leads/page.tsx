export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, timeAgo } from "@/lib/utils";
import { MessageCircle, Phone, Mail } from "lucide-react";

export default async function AgentLeadsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: inquiries } = await supabase
    .from("inquiries")
    .select("*, listings(*), profiles!inquiries_buyer_id_fkey(*)")
    .eq("agent_id", user.id)
    .order("created_at", { ascending: false });

  const leads = inquiries || [];
  const newLeads = leads.filter((l) => l.status === "new" || l.status === "agent_notified");
  const respondedLeads = leads.filter((l) => l.status === "responded" || l.status === "converted");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Leads</h1>

      {/* New leads */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">
            New Leads {newLeads.length > 0 && <Badge variant="danger">{newLeads.length}</Badge>}
          </h2>
        </CardHeader>
        <CardContent>
          {newLeads.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-500">No new leads</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {newLeads.map((lead) => {
                const listing = lead.listings as Record<string, string | number>;
                const buyer = lead.profiles as Record<string, string | number> | null;
                return (
                  <div key={lead.id} className="py-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {buyer?.first_name as string} {buyer?.last_name as string}
                        </p>
                        <p className="text-sm text-gray-500">
                          {lead.inquiry_type.replace("_", " ")} — {listing?.city as string},{" "}
                          {formatPrice(listing?.asking_price as number)}
                        </p>
                        {lead.message && (
                          <p className="mt-1 text-sm text-gray-600 italic">
                            &ldquo;{lead.message}&rdquo;
                          </p>
                        )}
                        <p className="mt-1 text-xs text-gray-400">{timeAgo(lead.created_at)}</p>
                      </div>
                      <div className="flex gap-2">
                        {buyer?.phone ? (
                          <Button variant="outline" size="sm">
                            <Phone className="h-3.5 w-3.5" />
                          </Button>
                        ) : null}
                        <Button variant="outline" size="sm">
                          <Mail className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm">Respond</Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Previous leads */}
      {respondedLeads.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Previous Leads</h2>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-gray-100">
              {respondedLeads.map((lead) => {
                const buyer = lead.profiles as Record<string, unknown>;
                return (
                  <div key={lead.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {buyer?.first_name as string} {buyer?.last_name as string}
                      </p>
                      <p className="text-xs text-gray-500">{timeAgo(lead.created_at)}</p>
                    </div>
                    <Badge variant={lead.status === "converted" ? "success" : "default"}>
                      {lead.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
