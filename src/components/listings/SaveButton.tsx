"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface SaveButtonProps {
  listingId: string;
  variant?: "button" | "icon";
}

export function SaveButton({ listingId, variant = "button" }: SaveButtonProps) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function checkSaved() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from("saved_listings")
          .select("listing_id")
          .eq("buyer_id", user.id)
          .eq("listing_id", listingId)
          .single();
        setSaved(!!data);
      } catch {
        // Not logged in or not saved
      }
    }
    checkSaved();
  }, [listingId, supabase]);

  async function handleToggle() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login?redirect=" + encodeURIComponent(window.location.pathname);
        return;
      }

      if (saved) {
        await supabase
          .from("saved_listings")
          .delete()
          .eq("buyer_id", user.id)
          .eq("listing_id", listingId);
        setSaved(false);
      } else {
        await supabase
          .from("saved_listings")
          .insert({ buyer_id: user.id, listing_id: listingId });
        setSaved(true);

        // Increment saves count
        await supabase.rpc("increment_counter", {
          row_id: listingId,
          table_name: "listings",
          column_name: "saves_count",
        });
      }
    } catch {
      // Handle error silently
    }
    setLoading(false);
  }

  if (variant === "icon") {
    return (
      <button
        onClick={handleToggle}
        disabled={loading}
        className="rounded-full p-2 transition-colors hover:bg-gray-100"
        aria-label={saved ? "Unsave" : "Save"}
      >
        <Heart
          className={cn("h-5 w-5", saved ? "fill-red-500 text-red-500" : "text-gray-400")}
        />
      </button>
    );
  }

  return (
    <Button variant="outline" className="w-full" onClick={handleToggle} loading={loading}>
      <Heart className={cn("mr-2 h-4 w-4", saved && "fill-red-500 text-red-500")} />
      {saved ? "Saved" : "Save"}
    </Button>
  );
}
