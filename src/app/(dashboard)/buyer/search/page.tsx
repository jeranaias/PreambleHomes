"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TimelineSelector } from "@/components/search/TimelineSelector";
import { buyerSearchSchema } from "@/lib/schemas";

const propertyTypes = [
  { value: "single_family", label: "Single Family" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "multi_family", label: "Multi-Family" },
  { value: "land", label: "Land" },
];

export default function BuyerSearchPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    property_types: ["single_family"],
    min_price: "",
    max_price: "",
    min_bedrooms: "",
    min_bathrooms: "",
    min_sqft: "",
    target_cities: "",
    search_radius_miles: "25",
    target_move_date: "",
    earliest_move_date: "",
    latest_move_date: "",
    timeline_flexibility: "" as string,
    pre_approved: false,
    pre_approval_amount: "",
    is_first_time_buyer: false,
    buyer_notes: "",
  });

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("buyer_searches")
        .select("*")
        .eq("buyer_id", user.id)
        .eq("status", "active")
        .single();
      if (data) {
        setExistingId(data.id);
        setForm({
          property_types: data.property_types || ["single_family"],
          min_price: data.min_price?.toString() || "",
          max_price: data.max_price?.toString() || "",
          min_bedrooms: data.min_bedrooms?.toString() || "",
          min_bathrooms: data.min_bathrooms?.toString() || "",
          min_sqft: data.min_sqft?.toString() || "",
          target_cities: (data.target_cities || []).join(", "),
          search_radius_miles: data.search_radius_miles?.toString() || "25",
          target_move_date: data.target_move_date || "",
          earliest_move_date: data.earliest_move_date || "",
          latest_move_date: data.latest_move_date || "",
          timeline_flexibility: data.timeline_flexibility || "",
          pre_approved: data.pre_approved || false,
          pre_approval_amount: data.pre_approval_amount?.toString() || "",
          is_first_time_buyer: data.is_first_time_buyer || false,
          buyer_notes: data.buyer_notes || "",
        });
      }
    }
    load();
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      property_types: form.property_types,
      min_price: form.min_price ? Number(form.min_price) : undefined,
      max_price: form.max_price ? Number(form.max_price) : undefined,
      min_bedrooms: form.min_bedrooms ? Number(form.min_bedrooms) : undefined,
      min_bathrooms: form.min_bathrooms ? Number(form.min_bathrooms) : undefined,
      min_sqft: form.min_sqft ? Number(form.min_sqft) : undefined,
      target_cities: form.target_cities.split(",").map((c) => c.trim()).filter(Boolean),
      search_radius_miles: Number(form.search_radius_miles) || 25,
      target_move_date: form.target_move_date || undefined,
      earliest_move_date: form.earliest_move_date || undefined,
      latest_move_date: form.latest_move_date || undefined,
      timeline_flexibility: form.timeline_flexibility || undefined,
      pre_approved: form.pre_approved,
      pre_approval_amount: form.pre_approval_amount ? Number(form.pre_approval_amount) : undefined,
      is_first_time_buyer: form.is_first_time_buyer,
      buyer_notes: form.buyer_notes || undefined,
    };

    const result = buyerSearchSchema.safeParse(payload);
    if (!result.success) {
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (existingId) {
      await supabase.from("buyer_searches").update(result.data).eq("id", existingId);
    } else {
      await supabase.from("buyer_searches").insert({ ...result.data, buyer_id: user.id });
    }

    // Trigger match scan
    await fetch("/api/matches", { method: "POST" });

    router.push("/buyer");
    router.refresh();
  }

  function togglePropertyType(type: string) {
    setForm((f) => ({
      ...f,
      property_types: f.property_types.includes(type)
        ? f.property_types.filter((t) => t !== type)
        : [...f.property_types, type],
    }));
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        {existingId ? "Edit Search Criteria" : "Set Up Your Search"}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><h2 className="font-semibold">What are you looking for?</h2></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Property Types</label>
              <div className="flex flex-wrap gap-2">
                {propertyTypes.map((pt) => (
                  <button
                    key={pt.value}
                    type="button"
                    onClick={() => togglePropertyType(pt.value)}
                    className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                      form.property_types.includes(pt.value)
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-gray-300 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    {pt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="min_price" label="Min Price" type="number" value={form.min_price}
                onChange={(e) => setForm((f) => ({ ...f, min_price: e.target.value }))}
              />
              <Input
                id="max_price" label="Max Price" type="number" value={form.max_price}
                onChange={(e) => setForm((f) => ({ ...f, max_price: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input
                id="min_bedrooms" label="Min Beds" type="number" value={form.min_bedrooms}
                onChange={(e) => setForm((f) => ({ ...f, min_bedrooms: e.target.value }))}
              />
              <Input
                id="min_bathrooms" label="Min Baths" type="number" step="0.5" value={form.min_bathrooms}
                onChange={(e) => setForm((f) => ({ ...f, min_bathrooms: e.target.value }))}
              />
              <Input
                id="min_sqft" label="Min Sq Ft" type="number" value={form.min_sqft}
                onChange={(e) => setForm((f) => ({ ...f, min_sqft: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h2 className="font-semibold">Where?</h2></CardHeader>
          <CardContent className="space-y-4">
            <Input
              id="target_cities" label="Cities (comma-separated)" placeholder="e.g. Monterey, Carmel, Pacific Grove"
              value={form.target_cities}
              onChange={(e) => setForm((f) => ({ ...f, target_cities: e.target.value }))}
            />
            <Input
              id="search_radius" label="Search Radius (miles)" type="number" min={1} max={100}
              value={form.search_radius_miles}
              onChange={(e) => setForm((f) => ({ ...f, search_radius_miles: e.target.value }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold">When do you want to move?</h2>
            <p className="text-sm text-gray-500">This is your biggest matching advantage</p>
          </CardHeader>
          <CardContent>
            <TimelineSelector
              targetDate={form.target_move_date}
              earliestDate={form.earliest_move_date}
              latestDate={form.latest_move_date}
              flexibility={form.timeline_flexibility as "rigid" | "somewhat_flexible" | "very_flexible" | ""}
              onChange={(field, value) => setForm((f) => ({ ...f, [field]: value }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h2 className="font-semibold">About You</h2></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.pre_approved}
                  onChange={(e) => setForm((f) => ({ ...f, pre_approved: e.target.checked }))}
                  className="rounded border-gray-300" />
                <span className="text-sm text-gray-600">Pre-approved for a mortgage</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_first_time_buyer}
                  onChange={(e) => setForm((f) => ({ ...f, is_first_time_buyer: e.target.checked }))}
                  className="rounded border-gray-300" />
                <span className="text-sm text-gray-600">First-time buyer</span>
              </label>
            </div>
            {form.pre_approved && (
              <Input
                id="pre_approval_amount" label="Pre-Approval Amount" type="number"
                value={form.pre_approval_amount}
                onChange={(e) => setForm((f) => ({ ...f, pre_approval_amount: e.target.value }))}
              />
            )}
            <div>
              <label htmlFor="buyer_notes" className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea id="buyer_notes" rows={3}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                placeholder="e.g. Looking for a fixer-upper, need good schools..."
                value={form.buyer_notes}
                onChange={(e) => setForm((f) => ({ ...f, buyer_notes: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" loading={loading}>
            {existingId ? "Update Search" : "Save & Find Matches"}
          </Button>
        </div>
      </form>
    </div>
  );
}
