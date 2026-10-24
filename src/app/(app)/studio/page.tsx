import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Content Studio",
};

export default function StudioPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Content Studio</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Write a post directly to your blog or generate one with AI.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Native Editor Card */}
        <div className="card hover:border-brand-500 cursor-pointer transition-colors">
          <Link href="/studio/write">
            <h2 className="text-lg font-semibold mb-2">Write a New Post</h2>
            <p className="text-sm text-ink-muted mb-4">
              Create a custom blog post with images and formatting.
            </p>
            <span className="text-brand-600 font-medium text-sm">Start Writing &rarr;</span>
          </Link>
        </div>

        {/* AI Generator Card */}
        <div className="card hover:border-brand-500 cursor-pointer transition-colors">
          <Link href="/seo">
            <h2 className="text-lg font-semibold mb-2">Generate with SEO Master</h2>
            <p className="text-sm text-ink-muted mb-4">
              Use the AI to research, write, and optimize your article.
            </p>
            <span className="text-brand-600 font-medium text-sm">Go to SEO Master &rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}