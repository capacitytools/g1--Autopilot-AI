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

  // Fetch articles count
  const { data: articles } = await supabase
    .from("articles")
    .select("id, status")
    .eq("organization_id", org.id);

  const totalArticles = articles?.length || 0;
  const publishedArticles = articles?.filter(a => a.status === "PUBLISHED").length || 0;

  // Fetch user's blogs (projects)
  const { data: blogs } = await supabase
    .from("projects")
    .select("id, name, blog_title, blog_slug")
    .eq("organization_id", org.id)
    .not("blog_slug", "is", null);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Welcome back, {user.displayName || user.username}.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/seo"
            className="inline-flex h-10 items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
          >
            Create with SEO Master
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="card">
          <h2 className="text-sm font-medium text-ink-subtle">Total Articles</h2>
          <p className="mt-2 text-3xl font-semibold">{totalArticles}</p>
        </div>
        <div className="card">
          <h2 className="text-sm font-medium text-ink-subtle">Published</h2>
          <p className="mt-2 text-3xl font-semibold text-green-600">{publishedArticles}</p>
        </div>
        <div className="card bg-brand-50 border-brand-200">
          <h2 className="text-sm font-medium text-brand-800">Your Blogs</h2>
          <p className="mt-2 text-3xl font-semibold text-brand-700">{blogs?.length || 0}</p>
        </div>
      </div>

      {/* Blog Manager Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Manage Your Blogs</h2>
        {(!blogs || blogs.length === 0) ? (
          <div className="card text-center py-12">
            <h3 className="font-semibold">No blogs created yet</h3>
            <p className="text-sm text-ink-muted mt-2 mb-4">Create your first free blog to start publishing.</p>
            <Link
              href="/settings"
              className="inline-flex h-10 items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
            >
              Create a Free Blog
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
                  <Link
                    href={`/blogs/${blog.id}`}
                    className="flex-1 inline-flex h-9 items-center justify-center rounded-md bg-brand-600 text-sm font-medium text-white hover:bg-brand-700"
                  >
                    Manage Blog
                  </Link>
                  <a
                    href={`/blog/${blog.blog_slug}`}
                    target="_blank"
                    className="flex-1 inline-flex h-9 items-center justify-center rounded-md border border-surface-border text-sm font-medium text-ink hover:bg-surface-muted"
                  >
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