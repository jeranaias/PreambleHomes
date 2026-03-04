"use client";

import { useState } from "react";
import { InquiryModal } from "./InquiryModal";
import { SaveButton } from "./SaveButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

interface ListingDetailActionsProps {
  listingId: string;
  listingCity: string;
}

export function ListingDetailActions({ listingId, listingCity }: ListingDetailActionsProps) {
  const [showInquiry, setShowInquiry] = useState(false);

  return (
    <>
      <Card>
        <CardContent className="py-4 space-y-3">
          <h3 className="font-semibold text-gray-900">Interested?</h3>
          <p className="text-sm text-gray-600">
            Send an inquiry and a licensed agent will facilitate the connection.
          </p>
          <Button className="w-full" onClick={() => setShowInquiry(true)}>
            <MessageCircle className="mr-2 h-4 w-4" /> Send Inquiry
          </Button>
          <SaveButton listingId={listingId} />
        </CardContent>
      </Card>

      <InquiryModal
        listingId={listingId}
        listingCity={listingCity}
        isOpen={showInquiry}
        onClose={() => setShowInquiry(false)}
      />
    </>
  );
}
