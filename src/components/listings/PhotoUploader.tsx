"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, X, GripVertical } from "lucide-react";

interface PhotoUploaderProps {
  listingId: string;
  existingPhotos?: { id: string; storage_path: string; display_order: number; caption: string | null }[];
  onPhotosChange?: (photos: { storage_path: string; display_order: number }[]) => void;
}

export function PhotoUploader({ listingId, existingPhotos = [], onPhotosChange }: PhotoUploaderProps) {
  const [photos, setPhotos] = useState(existingPhotos);
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newPhotos = [...photos];

    for (const file of Array.from(files)) {
      // Validate
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 5 * 1024 * 1024) continue; // 5MB limit

      const ext = file.name.split(".").pop();
      const path = `listings/${listingId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage
        .from("listing-photos")
        .upload(path, file);

      if (!error) {
        const { data: { publicUrl } } = supabase.storage
          .from("listing-photos")
          .getPublicUrl(path);

        newPhotos.push({
          id: crypto.randomUUID(),
          storage_path: publicUrl,
          display_order: newPhotos.length,
          caption: null,
        });
      }
    }

    setPhotos(newPhotos);
    onPhotosChange?.(newPhotos.map((p, i) => ({ storage_path: p.storage_path, display_order: i })));
    setUploading(false);
    e.target.value = "";
  }, [listingId, photos, supabase, onPhotosChange]);

  const removePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index).map((p, i) => ({ ...p, display_order: i }));
    setPhotos(updated);
    onPhotosChange?.(updated.map((p, i) => ({ storage_path: p.storage_path, display_order: i })));
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">Photos</label>

      {/* Preview grid */}
      {photos.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {photos.map((photo, i) => (
            <div key={photo.id || i} className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img src={photo.storage_path} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-start justify-between bg-black/0 p-1.5 opacity-0 transition-opacity group-hover:bg-black/20 group-hover:opacity-100">
                <GripVertical className="h-5 w-5 text-white drop-shadow cursor-grab" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="rounded-full bg-red-600 p-1 text-white shadow hover:bg-red-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-8 transition-colors hover:border-brand-400 hover:bg-brand-50">
        <Upload className="h-8 w-8 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {uploading ? "Uploading..." : "Click to upload photos"}
        </p>
        <p className="mt-1 text-xs text-gray-400">JPG, PNG up to 5MB each</p>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
        />
      </label>
    </div>
  );
}
