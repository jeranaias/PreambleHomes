"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { X, MessageCircle, CheckCircle } from "lucide-react";

interface InquiryModalProps {
  listingId: string;
  listingCity: string;
  isOpen: boolean;
  onClose: () => void;
}

const inquiryTypes = [
  { value: "general", label: "General Question" },
  { value: "showing_request", label: "Request a Showing" },
  { value: "price_question", label: "Question About Price" },
  { value: "timeline_question", label: "Question About Timeline" },
];

export function InquiryModal({ listingId, listingCity, isOpen, onClose }: InquiryModalProps) {
  const [type, setType] = useState("general");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listing_id: listingId,
        inquiry_type: type,
        message,
      }),
    });

    if (res.ok) {
      setSent(true);
    } else {
      const data = await res.json();
      setError(data.error || "Failed to send inquiry. Please log in first.");
    }
    setLoading(false);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="font-semibold text-gray-900">
            {sent ? "Inquiry Sent" : `Inquire About ${listingCity} Property`}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-4">
          {sent ? (
            <div className="py-6 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <p className="mt-3 font-medium text-gray-900">Inquiry sent successfully</p>
              <p className="mt-1 text-sm text-gray-500">
                A licensed agent will review your inquiry and get back to you.
              </p>
              <Button className="mt-4" onClick={onClose}>Close</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Select
                id="inquiry_type"
                label="What would you like to know?"
                options={inquiryTypes}
                value={type}
                onChange={(e) => setType(e.target.value)}
              />
              <div>
                <label htmlFor="inquiry_message" className="block text-sm font-medium text-gray-700">
                  Message (optional)
                </label>
                <textarea
                  id="inquiry_message"
                  rows={4}
                  className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="Tell us more about what you're looking for..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <p className="text-xs text-gray-400">
                Your inquiry will be routed to a licensed agent who will facilitate the connection.
              </p>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" loading={loading}>
                  <MessageCircle className="mr-1 h-4 w-4" /> Send Inquiry
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
