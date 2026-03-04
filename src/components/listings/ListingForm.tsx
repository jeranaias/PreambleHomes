"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { PhotoUploader } from "./PhotoUploader";
import { listingSchema, type ListingFormData } from "@/lib/schemas";
import type { Listing } from "@/types/database";

const propertyTypeOptions = [
  { value: "single_family", label: "Single Family" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "multi_family", label: "Multi-Family" },
  { value: "land", label: "Land" },
  { value: "other", label: "Other" },
];

interface ListingFormProps {
  listing?: Listing;
  mode: "create" | "edit";
}

export function ListingForm({ listing, mode }: ListingFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<{ storage_path: string; display_order: number }[]>([]);

  const [form, setForm] = useState<Partial<ListingFormData>>({
    property_type: listing?.property_type || "single_family",
    city: listing?.city || "",
    state: listing?.state || "CA",
    zip: listing?.zip || "",
    county: listing?.county || "",
    address_line1: listing?.address_line1 || "",
    show_exact_address: listing?.show_exact_address || false,
    show_photos: listing?.show_photos ?? true,
    bedrooms: listing?.bedrooms ?? undefined,
    bathrooms: listing?.bathrooms ?? undefined,
    sqft: listing?.sqft ?? undefined,
    lot_sqft: listing?.lot_sqft ?? undefined,
    year_built: listing?.year_built ?? undefined,
    garage_spaces: listing?.garage_spaces ?? undefined,
    has_pool: listing?.has_pool || false,
    has_hoa: listing?.has_hoa || false,
    hoa_monthly: listing?.hoa_monthly ?? undefined,
    asking_price: listing?.asking_price ?? undefined,
    price_negotiable: listing?.price_negotiable ?? true,
    preferred_move_date: listing?.preferred_move_date || "",
    earliest_move_date: listing?.earliest_move_date || "",
    latest_move_date: listing?.latest_move_date || "",
    seller_notes: listing?.seller_notes || "",
    title: listing?.title || "",
  });

  function updateField(field: string, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const result = listingSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join(".");
        fieldErrors[path] = issue.message;
      }
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (mode === "create") {
      const { data: newListing, error } = await supabase
        .from("listings")
        .insert({ ...result.data, seller_id: user.id, status: "draft" })
        .select("id")
        .single();

      if (error) {
        setErrors({ _form: error.message });
        setLoading(false);
        return;
      }

      // Insert photos
      if (photos.length > 0 && newListing) {
        await supabase.from("listing_photos").insert(
          photos.map((p) => ({
            listing_id: newListing.id,
            storage_path: p.storage_path,
            display_order: p.display_order,
          }))
        );
      }

      router.push(`/seller`);
    } else if (listing) {
      await supabase
        .from("listings")
        .update(result.data)
        .eq("id", listing.id);

      router.push(`/seller`);
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Property Details</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              id="title"
              label="Headline (optional)"
              placeholder="e.g. Charming 3BR near downtown"
              value={form.title || ""}
              onChange={(e) => updateField("title", e.target.value)}
            />
            <Select
              id="property_type"
              label="Property Type"
              options={propertyTypeOptions}
              value={form.property_type}
              onChange={(e) => updateField("property_type", e.target.value)}
              error={errors.property_type}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="city"
                label="City"
                value={form.city || ""}
                onChange={(e) => updateField("city", e.target.value)}
                error={errors.city}
                required
              />
              <Input
                id="zip"
                label="ZIP Code"
                value={form.zip || ""}
                onChange={(e) => updateField("zip", e.target.value)}
                error={errors.zip}
                required
              />
            </div>
            <Input
              id="address_line1"
              label="Address (optional — only shown if you choose)"
              value={form.address_line1 || ""}
              onChange={(e) => updateField("address_line1", e.target.value)}
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.show_exact_address}
                onChange={(e) => updateField("show_exact_address", e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-600">Show exact address to matched buyers</span>
            </label>
          </CardContent>
        </Card>

        {/* Specs */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Specifications</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Input
                id="bedrooms"
                label="Bedrooms"
                type="number"
                min={0}
                value={form.bedrooms ?? ""}
                onChange={(e) => updateField("bedrooms", e.target.value ? Number(e.target.value) : undefined)}
              />
              <Input
                id="bathrooms"
                label="Bathrooms"
                type="number"
                min={0}
                step={0.5}
                value={form.bathrooms ?? ""}
                onChange={(e) => updateField("bathrooms", e.target.value ? Number(e.target.value) : undefined)}
              />
              <Input
                id="sqft"
                label="Sq Ft"
                type="number"
                min={0}
                value={form.sqft ?? ""}
                onChange={(e) => updateField("sqft", e.target.value ? Number(e.target.value) : undefined)}
              />
              <Input
                id="lot_sqft"
                label="Lot Sq Ft"
                type="number"
                min={0}
                value={form.lot_sqft ?? ""}
                onChange={(e) => updateField("lot_sqft", e.target.value ? Number(e.target.value) : undefined)}
              />
              <Input
                id="year_built"
                label="Year Built"
                type="number"
                min={1800}
                max={2030}
                value={form.year_built ?? ""}
                onChange={(e) => updateField("year_built", e.target.value ? Number(e.target.value) : undefined)}
              />
              <Input
                id="garage_spaces"
                label="Garage Spaces"
                type="number"
                min={0}
                value={form.garage_spaces ?? ""}
                onChange={(e) => updateField("garage_spaces", e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
            <div className="mt-4 flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.has_pool}
                  onChange={(e) => updateField("has_pool", e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">Pool</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.has_hoa}
                  onChange={(e) => updateField("has_hoa", e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">HOA</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Price & Timeline */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Price & Timeline</h2>
            <p className="text-sm text-gray-500">Your timeline is key to finding the right match</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              id="asking_price"
              label="Asking Price"
              type="number"
              min={1}
              value={form.asking_price ?? ""}
              onChange={(e) => updateField("asking_price", e.target.value ? Number(e.target.value) : undefined)}
              error={errors.asking_price}
              required
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.price_negotiable}
                onChange={(e) => updateField("price_negotiable", e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-600">Price is negotiable</span>
            </label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input
                id="preferred_move_date"
                label="Preferred Move Date"
                type="date"
                value={form.preferred_move_date || ""}
                onChange={(e) => updateField("preferred_move_date", e.target.value)}
              />
              <Input
                id="earliest_move_date"
                label="Earliest"
                type="date"
                value={form.earliest_move_date || ""}
                onChange={(e) => updateField("earliest_move_date", e.target.value)}
              />
              <Input
                id="latest_move_date"
                label="Latest"
                type="date"
                value={form.latest_move_date || ""}
                onChange={(e) => updateField("latest_move_date", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="seller_notes" className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                id="seller_notes"
                rows={3}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                placeholder="e.g. Open to lease-back, needs minor repairs..."
                value={form.seller_notes || ""}
                onChange={(e) => updateField("seller_notes", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Photos */}
        {mode === "create" && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Photos</h2>
            </CardHeader>
            <CardContent>
              <PhotoUploader
                listingId={listing?.id || "new"}
                onPhotosChange={setPhotos}
              />
            </CardContent>
          </Card>
        )}

        {errors._form && (
          <p className="text-sm text-red-600">{errors._form}</p>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {mode === "create" ? "Create Profile" : "Save Changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}
