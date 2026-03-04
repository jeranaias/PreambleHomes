"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle, Eye, EyeOff } from "lucide-react";

interface PublishButtonProps {
  listingId: string;
  currentStatus: string;
}

export function PublishButton({ listingId, currentStatus }: PublishButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleToggle() {
    setLoading(true);
    const supabase = createClient();
    const newStatus = currentStatus === "active" ? "withdrawn" : "active";

    await supabase
      .from("listings")
      .update({ status: newStatus })
      .eq("id", listingId);

    // Trigger match scan when publishing
    if (newStatus === "active") {
      await fetch("/api/matches", { method: "POST" });
    }

    router.refresh();
    setLoading(false);
  }

  if (currentStatus === "active") {
    return (
      <Button variant="outline" size="sm" onClick={handleToggle} loading={loading}>
        <EyeOff className="mr-1 h-4 w-4" /> Unpublish
      </Button>
    );
  }

  return (
    <Button size="sm" onClick={handleToggle} loading={loading}>
      <Eye className="mr-1 h-4 w-4" /> Publish
    </Button>
  );
}
