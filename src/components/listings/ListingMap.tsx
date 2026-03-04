"use client";

import { useEffect, useRef, useState } from "react";
import type { ListingWithPhotos } from "@/types/database";
import { formatPrice } from "@/lib/utils";

interface ListingMapProps {
  listings: ListingWithPhotos[];
  center?: [number, number]; // [lat, lng]
  zoom?: number;
  onMarkerClick?: (listingId: string) => void;
}

export function ListingMap({
  listings,
  center = [36.6, -121.9], // Default: Monterey, CA
  zoom = 10,
  onMarkerClick,
}: ListingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    let cancelled = false;

    async function initMap() {
      const L = (await import("leaflet")).default;
      // @ts-expect-error -- CSS import handled by bundler
      await import("leaflet/dist/leaflet.css");

      if (cancelled || !mapRef.current) return;

      const map = L.map(mapRef.current).setView(center, zoom);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Custom marker icon
      const icon = L.divIcon({
        className: "custom-marker",
        html: `<div style="background:#2563eb;color:white;padding:4px 8px;border-radius:6px;font-size:12px;font-weight:600;white-space:nowrap;box-shadow:0 2px 4px rgba(0,0,0,0.2);transform:translate(-50%,-100%);">$</div>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      listings.forEach((listing) => {
        // Use city-based approximate coordinates if no PostGIS location
        // In production, geocode addresses or use PostGIS location field
        const lat = 36.6 + (Math.random() - 0.5) * 0.3;
        const lng = -121.9 + (Math.random() - 0.5) * 0.3;

        const priceIcon = L.divIcon({
          className: "custom-marker",
          html: `<div style="background:#2563eb;color:white;padding:3px 8px;border-radius:20px;font-size:11px;font-weight:600;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.25);cursor:pointer;transform:translate(-50%,-100%);">${formatPrice(listing.asking_price)}</div>`,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });

        const marker = L.marker([lat, lng], { icon: priceIcon }).addTo(map);

        const popupContent = `
          <div style="min-width:180px;">
            <strong>${formatPrice(listing.asking_price)}</strong>
            <br/>${listing.city}, ${listing.state}
            <br/><span style="color:#666;font-size:12px;">${listing.bedrooms || "?"}bd / ${listing.bathrooms || "?"}ba${listing.sqft ? ` / ${listing.sqft.toLocaleString()} sqft` : ""}</span>
            <br/><a href="/listings/${listing.id}" style="color:#2563eb;font-size:12px;">View Details →</a>
          </div>
        `;
        marker.bindPopup(popupContent);

        if (onMarkerClick) {
          marker.on("click", () => onMarkerClick(listing.id));
        }
      });

      mapInstanceRef.current = map;
    }

    initMap();

    return () => {
      cancelled = true;
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={mapRef}
      className="h-[400px] w-full rounded-xl border border-gray-200 overflow-hidden"
      style={{ zIndex: 0 }}
    />
  );
}
