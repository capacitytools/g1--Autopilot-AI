"use client";

import { useState } from "react";
import { createNewBlog } from "@/lib/create-blog-action";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function CreateBlogForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await createNewBlog(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-ink">Create Your Free SEO Blog</h1>
        <p className="mt-2 text-ink-muted">
          Launch a beautifully optimized blog in seconds. No hosting required.
        </p>
      </div>

      <div className="card space-y-6">
        {error && <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}

        <form action={handleSubmit} className="space-y-4">
          <Input
            label="Blog Title"
            name="blogTitle"
            placeholder="e.g., The Goat Farming Expert"
            required
          />

          <div>
            <Input
              label="Blog URL"
              name="blogSlug"
              placeholder="e.g., goat-farming"
              required
            />
            <p className="mt-1 text-xs text-ink-subtle">
              Your blog will be live at: <strong>g1-autopilot-ai.vercel.app/blog/your-slug</strong>
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Description (Optional)</label>
            <textarea
              name="blogDescription"
              rows={3}
              placeholder="A short description of what your blog is about..."
              className="w-full rounded-md border border-surface-border px-3 py-2 text-sm bg-surface focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="pt-4">
            <Button type="submit" loading={loading} className="w-full h-12 text-base">
              Create Blog
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}