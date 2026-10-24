"use client";

import { useState } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { createNativeArticle } from "@/lib/native-editor-actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export function NativeBlogEditor({ projects }: { projects: any[] }) {
  const [coverImage, setCoverImage] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const { url } = await uploadToCloudinary(file);
      setCoverImage(url);
    } catch (err: any) {
      setError(err.message || "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    setError(null);
    // Append the Cloudinary URL to the form data
    formData.append("coverImageUrl", coverImage);
    
    const result = await createNativeArticle(formData);
    if (result.error) {
      setError(result.error);
      setSubmitting(false);
    }
  }

  if (projects.length === 0) {
    return <div className="p-4 bg-yellow-50 text-yellow-800 rounded">Create a project first.</div>;
  }

  return (
    <form action={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
      {error && <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Target Blog</label>
          <select name="projectId" required className="w-full rounded-md border border-surface-border px-3 py-2 text-sm bg-surface">
            {projects.map(p => <option key={p.id} value={p.id}>{p.blog_title || p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Category</label>
          <select name="categorySlug" className="w-full rounded-md border border-surface-border px-3 py-2 text-sm bg-surface">
            <option value="">Uncategorized</option>
            <option value="bedroom-ideas">Bedroom Ideas</option>
            <option value="living-room-ideas">Living Room</option>
            <option value="kitchen-ideas">Kitchen</option>
            <option value="bathroom-ideas">Bathroom</option>
            <option value="small-space-design">Small Spaces</option>
            <option value="diy-home-decor">DIY Decor</option>
          </select>
        </div>
      </div>

      <Input label="Article Title" name="title" required placeholder="Enter a catchy title..." />

      {/* Cover Image Upload */}
      <div className="card bg-surface-muted">
        <label className="block text-sm font-medium text-ink mb-2">Cover Image</label>
        {coverImage ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverImage} alt="Cover" className="w-full h-48 object-cover rounded-md" />
            <button type="button" onClick={() => setCoverImage("")} className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded">X</button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-surface-border rounded-md cursor-pointer hover:bg-surface">
            <span className="text-sm text-ink-muted">{uploading ? "Uploading..." : "Click to upload cover image"}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
          </label>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Content (Markdown or Text)</label>
        <textarea 
          name="content" 
          required 
          rows={12}
          placeholder="Write your article here. You can use Markdown for formatting (# Heading, **Bold**, [Link](url))."
          className="w-full rounded-md border border-surface-border px-3 py-2 text-sm bg-surface font-mono"
        />
      </div>

      <Button type="submit" loading={submitting} className="w-full">
        Publish to Blog
      </Button>
    </form>
  );
}