import { getCurrentUser } from "@/lib/auth/adapter";
import { getCurrentOrganization } from "@/lib/auth/organization";
import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const org = await getCurrentOrganization();
  const supabase = createClient();

  const { data: blogs } = await supabase
    .from("projects")
    .select("id, name, blog_title, blog_slug")
    .eq("organization_id", org.id)
    .not("blog_slug", "is", null);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-ink-muted">Welcome back, {user.displayName || user.username}.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/seo"
            className="inline-flex h-10 items-center justify-center rounded-md border border-surface-border bg-surface px-4 text-sm font-medium text-ink hover:bg-surface-muted"
          >
            SEO Master
          </Link>
          <Link
            href="/blogs/new"
            className="inline-flex h-10 items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
          >
            + Create New Blog
          </Link>
        </div>
      </div>

      {/* Blog List */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Your Blogs</h2>
        {(!blogs || blogs.length === 0) ? (
          <div className="card text-center py-16 border-dashed border-2 border-brand-200 bg-brand-50">
            <h3 className="text-xl font-bold text-brand-900">Start Your First Blog</h3>
            <p className="text-sm text-brand-700 mt-2 mb-6 max-w-md mx-auto">
              Create a free, SEO-optimized blog on G1-Autopilot. No coding or hosting required. Start publishing instantly.
            </p>
            <Link
              href="/blogs/new"
              className="inline-flex h-12 items-center justify-center rounded-md bg-brand-600 px-6 text-base font-medium text-white hover:bg-brand-700"
            >
              Create a Free SEO Blog
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {blogs.map((blog) => (
              <div key={blog.id} className="card flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{blog.blog_title}</h3>
                  <p className="text-sm text-ink-muted">/blog/{blog.blog_slug}</p>
                </div>
                <div className="mt-6 flex gap-3">
                  <Link href={`/blogs/${blog.id}`} className="flex-1 inline-flex h-9 items-center justify-center rounded-md bg-brand-600 text-sm font-medium text-white hover:bg-brand-700">
                    Manage Blog
                  </Link>
                  <a href={`/blog/${blog.blog_slug}`} target="_blank" className="flex-1 inline-flex h-9 items-center justify-center rounded-md border border-surface-border text-sm font-medium text-ink hover:bg-surface-muted">
                    View Live
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