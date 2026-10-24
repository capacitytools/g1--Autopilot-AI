import { getCurrentUser } from "@/lib/auth/adapter";
import { getCurrentOrganization } from "@/lib/auth/organization";
import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Overview",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const org = await getCurrentOrganization();
  const supabase = createClient();

  // Fetch data
  const { data: articles } = await supabase.from("articles").select("id, status").eq("organization_id", org.id);
  const totalArticles = articles?.length || 0;
  const published = articles?.filter(a => a.status === "PUBLISHED").length || 0;
  const drafts = articles?.filter(a => ["DRAFT_READY", "EDITOR_REVIEW"].includes(a.status)).length || 0;

  const { data: blogs } = await supabase.from("projects").select("id, blog_title, blog_slug").eq("organization_id", org.id).not("blog_slug", "is", null);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Overview</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Welcome back, {user.displayName || user.username}. Here is your publishing snapshot.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/seo"
            className="inline-flex h-10 items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700 shadow-sm"
          >
            + Create Article
          </Link>
        </div>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card border-l-4 border-l-brand-500">
          <h2 className="text-sm font-medium text-ink-subtle">Total Websites</h2>
          <p className="mt-2 text-3xl font-bold text-ink">{blogs?.length || 0}</p>
        </div>
        <div className="card border-l-4 border-l-green-500">
          <h2 className="text-sm font-medium text-ink-subtle">Published</h2>
          <p className="mt-2 text-3xl font-bold text-ink">{published}</p>
        </div>
        <div className="card border-l-4 border-l-yellow-500">
          <h2 className="text-sm font-medium text-ink-subtle">Drafts in Progress</h2>
          <p className="mt-2 text-3xl font-bold text-ink">{drafts}</p>
        </div>
        <div className="card border-l-4 border-l-blue-500">
          <h2 className="text-sm font-medium text-ink-subtle">Total Articles</h2>
          <p className="mt-2 text-3xl font-bold text-ink">{totalArticles}</p>
        </div>
      </div>

      {/* Websites Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-ink">Your Active Websites</h2>
        {(!blogs || blogs.length === 0) ? (
          <div className="card text-center py-12 border-dashed border-2 border-surface-border bg-surface-muted/50">
            <h3 className="font-semibold text-ink">No websites yet</h3>
            <p className="text-sm text-ink-muted mt-2 mb-6">Create your first premium blog to start publishing.</p>
            <Link href="/blogs/new" className="inline-flex h-10 items-center justify-center rounded-md bg-brand-600 px-6 text-sm font-medium text-white hover:bg-brand-700">
              Create a Blog
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <div key={blog.id} className="card group hover:border-brand-300 transition-colors">
                <div className="aspect-[2/1] bg-brand-50 rounded-md mb-4 flex items-center justify-center relative overflow-hidden">
                  <span className="font-serif text-2xl font-bold text-brand-300 z-10">{blog.blog_title.substring(0, 2)}</span>
                </div>
                <h3 className="font-semibold text-lg text-ink">{blog.blog_title}</h3>
                <p className="text-sm text-ink-muted mb-4">/blog/{blog.blog_slug}</p>
                <div className="flex gap-2">
                  <Link href={`/blogs/${blog.id}`} className="flex-1 inline-flex h-9 items-center justify-center rounded-md bg-surface border border-surface-border text-sm font-medium text-ink hover:bg-surface-muted">
                    Manage
                  </Link>
                  <a href={`/blog/${blog.blog_slug}`} target="_blank" className="flex-1 inline-flex h-9 items-center justify-center rounded-md bg-brand-600 text-sm font-medium text-white hover:bg-brand-700">
                    Visit
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}