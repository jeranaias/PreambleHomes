import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import { MapPin, CheckCircle } from "lucide-react";
import type { Agent } from "@/types/database";

interface AgentCardProps {
  agent: Agent & { profiles?: { first_name: string; last_name: string; email: string } };
}

export function AgentCard({ agent }: AgentCardProps) {
  const name = agent.profiles
    ? `${agent.profiles.first_name} ${agent.profiles.last_name}`
    : "Agent";

  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 overflow-hidden">
          {agent.headshot_url ? (
            <img src={agent.headshot_url} alt={name} className="h-full w-full object-cover" />
          ) : (
            agent.profiles ? getInitials(agent.profiles.first_name, agent.profiles.last_name) : "??"
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-900">{name}</p>
            {agent.is_verified && (
              <CheckCircle className="h-4 w-4 text-brand-600" />
            )}
          </div>
          <p className="text-sm text-gray-500">{agent.brokerage}</p>
          {agent.markets.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {agent.markets.slice(0, 3).map((market) => (
                <Badge key={market} variant="default">
                  <MapPin className="mr-0.5 h-3 w-3" /> {market}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <Badge variant={agent.subscription_status === "active" ? "success" : "default"}>
          {agent.subscription_tier || "trial"}
        </Badge>
      </CardContent>
    </Card>
  );
}
