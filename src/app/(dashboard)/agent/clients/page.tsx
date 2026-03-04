export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import { UserCircle } from "lucide-react";

export default async function AgentClientsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Sellers assigned to this agent
  const { data: sellerListings } = await supabase
    .from("listings")
    .select("seller_id, profiles!listings_seller_id_fkey(id, first_name, last_name, email, role)")
    .eq("assigned_agent_id", user.id);

  // Buyers assigned to this agent
  const { data: buyerSearches } = await supabase
    .from("buyer_searches")
    .select("buyer_id, profiles!buyer_searches_buyer_id_fkey(id, first_name, last_name, email, role)")
    .eq("assigned_agent_id", user.id);

  type ClientInfo = { id: string; first_name: string; last_name: string; email: string; role: string };
  const clientMap = new Map<string, ClientInfo>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (sellerListings || []).forEach((l: any) => {
    const p = l.profiles as unknown as ClientInfo;
    if (p?.id) clientMap.set(p.id, p);
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (buyerSearches || []).forEach((s: any) => {
    const p = s.profiles as unknown as ClientInfo;
    if (p?.id) clientMap.set(p.id, p);
  });
  const clients = Array.from(clientMap.values());

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Clients</h1>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">
            My Clients ({clients.length})
          </h2>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="py-8 text-center">
              <UserCircle className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-2 text-gray-500">No clients yet</p>
              <p className="text-sm text-gray-400">
                Clients will appear here when sellers or buyers are assigned to you
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {clients.map((client) => (
                <div key={client.id} className="flex items-center gap-3 py-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                    {getInitials(client.first_name, client.last_name)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {client.first_name} {client.last_name}
                    </p>
                    <p className="text-sm text-gray-500">{client.email}</p>
                  </div>
                  <Badge variant="info">{client.role}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
