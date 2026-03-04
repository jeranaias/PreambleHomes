"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, XCircle } from "lucide-react";

interface MatchActionsProps {
  matchId: string;
  currentStatus: string;
  viewAs: "buyer" | "seller" | "agent";
}

export function MatchActions({ matchId, currentStatus, viewAs }: MatchActionsProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function updateStatus(newStatus: string) {
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("matches")
      .update({ status: newStatus })
      .eq("id", matchId);
    router.refresh();
    setLoading(false);
  }

  if (currentStatus === "matched") {
    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => updateStatus(viewAs === "buyer" ? "buyer_interested" : "seller_interested")}
          loading={loading}
        >
          <ArrowRight className="mr-1 h-3.5 w-3.5" /> I&apos;m Interested
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => updateStatus("expired")}
          loading={loading}
        >
          <XCircle className="mr-1 h-3.5 w-3.5" /> Not Interested
        </Button>
      </div>
    );
  }

  if (currentStatus === "buyer_interested" && viewAs === "buyer") {
    return (
      <p className="flex items-center gap-1 text-sm text-brand-600">
        <CheckCircle className="h-4 w-4" /> Interest sent — waiting for agent contact
      </p>
    );
  }

  if (currentStatus === "seller_interested" && viewAs === "seller") {
    return (
      <p className="flex items-center gap-1 text-sm text-brand-600">
        <CheckCircle className="h-4 w-4" /> Interest sent — waiting for buyer response
      </p>
    );
  }

  if ((currentStatus === "buyer_interested" || currentStatus === "seller_interested") && viewAs === "agent") {
    return (
      <Button
        size="sm"
        onClick={() => updateStatus("agent_contacted")}
        loading={loading}
      >
        Mark as Contacted
      </Button>
    );
  }

  if (currentStatus === "agent_contacted" || currentStatus === "in_discussion") {
    if (viewAs === "agent") {
      return (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => updateStatus("under_contract")} loading={loading}>
            Under Contract
          </Button>
          <Button variant="outline" size="sm" onClick={() => updateStatus("closed_lost")} loading={loading}>
            Lost
          </Button>
        </div>
      );
    }
    return (
      <p className="text-sm text-gray-500">Agent is facilitating the connection</p>
    );
  }

  if (currentStatus === "under_contract" && viewAs === "agent") {
    return (
      <div className="flex gap-2">
        <Button size="sm" variant="primary" onClick={() => updateStatus("closed_won")} loading={loading}>
          Closed Won
        </Button>
        <Button variant="outline" size="sm" onClick={() => updateStatus("closed_lost")} loading={loading}>
          Closed Lost
        </Button>
      </div>
    );
  }

  return null;
}
