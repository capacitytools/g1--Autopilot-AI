"use client";

import { useState } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { updatePost } from "@/lib/blog-analytics-actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function EditPostModal({ 
  article, 
  projectId,
  onClose 
}: { 
  article: any; 
  projectId: string;
  onClose: () => void;
}) {
  const [coverImage, setCoverImage] = useState(article.cover_image_url || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadToCloudinary(file);
      setCoverImage(url);
    } catch (err) {
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(formData: FormData) {
    setSaving(true);
    formData.append("articleId", article.id);
    formData.append("projectId", projectId);
    formData.append("coverImageUrl", coverImage);
    await updatePost(formData);
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Edit Post</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink text-2xl">&times;</button>
        </div>

        <form action={handleSubmit} className="space-y-4">
          <Input label="Title" name="title" defaultValue={article.title} required />

          <div>
            <label className="block text-sm font-medium mb-2">Cover Image</label>
            {coverImage ? (
              <div className="relative mb-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverImage} alt="Cover" className="w-full h-32 object-cover rounded-md" />
                <button type="button" onClick={() => setCoverImage("")} className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded">X</button>
              </div>
            ) : (
              <label className="flex items-center justify-center h-20 border-2 border-dashed rounded-md cursor-pointer hover:bg-surface-muted mb-2">
                <span className="text-sm text-ink-muted">{uploading ? "Uploading..." : "Upload New Image"}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <textarea 
              name="content" 
              defaultValue={article.content} 
              rows={10}
              className="w-full rounded-md border border-surface-border px-3 py-2 text-sm font-mono"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={saving}>Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}