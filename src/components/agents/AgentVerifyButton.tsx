"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

interface AgentVerifyButtonProps {
  agentId: string;
  isVerified: boolean;
}

export function AgentVerifyButton({ agentId, isVerified }: AgentVerifyButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleToggle() {
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("agents")
      .update({ is_verified: !isVerified })
      .eq("id", agentId);
    router.refresh();
    setLoading(false);
  }

  return (
    <Button
      variant={isVerified ? "outline" : "primary"}
      size="sm"
      onClick={handleToggle}
      loading={loading}
    >
      {isVerified ? (
        <><XCircle className="mr-1 h-3.5 w-3.5" /> Unverify</>
      ) : (
        <><CheckCircle className="mr-1 h-3.5 w-3.5" /> Verify</>
      )}
    </Button>
  );
}
