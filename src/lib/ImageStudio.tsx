"use client";

import { useState } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { saveMediaAsset, deleteMediaAsset } from "@/lib/media-actions";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

type MediaAsset = {
  id: string;
  url: string;
  alt_text: string | null;
};

export function ImageStudio({ 
  articleId, 
  existingMedia 
}: { 
  articleId: string; 
  existingMedia: MediaAsset[];
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      // 1. Upload to Cloudinary
      const { url, width, height } = await uploadToCloudinary(file);
      
      // 2. Save to Supabase
      const result = await saveMediaAsset({
        articleId,
        url,
        width,
        height,
        altText: "Generated Image",
      });

      if (result.error) throw new Error(result.error);
      
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to upload image.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(mediaId: string) {
    if (!window.confirm("Delete this image?")) return;
    setDeletingId(mediaId);
    const result = await deleteMediaAsset(mediaId, articleId);
    if (result.error) setError(result.error);
    else router.refresh();
    setDeletingId(null);
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <h3 className="font-semibold text-lg mb-2">Featured Image</h3>
        <p className="text-sm text-ink-muted mb-4">
          Upload a featured image for this article (stored on Cloudinary).
        </p>
        
        {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded mb-4">{error}</p>}

        <div className="flex items-center gap-4">
          <label className={`cursor-pointer bg-brand-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-700 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {uploading ? "Uploading..." : "Upload Image"}
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
        </div>

        {existingMedia.length > 0 && (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {existingMedia.map((media) => (
              <div key={media.id} className="relative group rounded-md overflow-hidden border border-surface-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={media.url} alt={media.alt_text || "Article image"} className="w-full h-32 object-cover" />
                <button
                  onClick={() => handleDelete(media.id)}
                  disabled={deletingId === media.id}
                  className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                >
                  {deletingId === media.id ? "..." : "X"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
