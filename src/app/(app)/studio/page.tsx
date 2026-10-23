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
          Transform your articles into social media content.
        </p>
      </div>

      <div className="card text-center py-12">
        <h2 className="text-lg font-semibold">How to use the Content Studio</h2>
        <p className="mt-2 text-sm text-ink-muted max-w-md mx-auto">
          To generate Pinterest pins, Facebook posts, and video scripts, you need to open an existing article. The distribution tools are located inside the Article Workspace.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Link
            href="/seo"
            className="inline-flex h-10 items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
          >
            Go to SEO Master
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center justify-center rounded-md border border-surface-border bg-surface px-4 text-sm font-medium text-ink hover:bg-surface-muted"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}