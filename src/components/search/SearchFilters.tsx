"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Search, SlidersHorizontal, X } from "lucide-react";

const propertyTypeOptions = [
  { value: "", label: "All Types" },
  { value: "single_family", label: "Single Family" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "multi_family", label: "Multi-Family" },
  { value: "land", label: "Land" },
];

export function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [filters, setFilters] = useState({
    city: searchParams.get("city") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    propertyType: searchParams.get("propertyType") || "",
    minBeds: searchParams.get("minBeds") || "",
    minBaths: searchParams.get("minBaths") || "",
    moveBy: searchParams.get("moveBy") || "",
  });

  function applyFilters() {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    router.push(`/listings?${params.toString()}`);
  }

  function clearFilters() {
    setFilters({
      city: "", minPrice: "", maxPrice: "", propertyType: "",
      minBeds: "", minBaths: "", moveBy: "",
    });
    router.push("/listings");
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      {/* Primary filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input
            id="city"
            label="City"
            placeholder="e.g. Monterey"
            value={filters.city}
            onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
          />
        </div>
        <div className="w-32">
          <Input
            id="minPrice"
            label="Min Price"
            type="number"
            placeholder="$0"
            value={filters.minPrice}
            onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
          />
        </div>
        <div className="w-32">
          <Input
            id="maxPrice"
            label="Max Price"
            type="number"
            placeholder="Any"
            value={filters.maxPrice}
            onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
          />
        </div>
        <Button onClick={applyFilters}>
          <Search className="mr-1 h-4 w-4" /> Search
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <SlidersHorizontal className="mr-1 h-4 w-4" />
          {showAdvanced ? "Less" : "More"}
        </Button>
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-gray-100 pt-4">
          <div className="w-40">
            <Select
              id="propertyType"
              label="Type"
              options={propertyTypeOptions}
              value={filters.propertyType}
              onChange={(e) => setFilters((f) => ({ ...f, propertyType: e.target.value }))}
            />
          </div>
          <div className="w-24">
            <Input
              id="minBeds"
              label="Min Beds"
              type="number"
              min={0}
              value={filters.minBeds}
              onChange={(e) => setFilters((f) => ({ ...f, minBeds: e.target.value }))}
            />
          </div>
          <div className="w-24">
            <Input
              id="minBaths"
              label="Min Baths"
              type="number"
              min={0}
              step={0.5}
              value={filters.minBaths}
              onChange={(e) => setFilters((f) => ({ ...f, minBaths: e.target.value }))}
            />
          </div>
          <div className="w-40">
            <Input
              id="moveBy"
              label="Move by"
              type="date"
              value={filters.moveBy}
              onChange={(e) => setFilters((f) => ({ ...f, moveBy: e.target.value }))}
            />
          </div>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 h-3.5 w-3.5" /> Clear
          </Button>
        </div>
      )}
    </div>
  );
}
