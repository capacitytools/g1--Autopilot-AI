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

  // 1. Fetch article counts
  const { data: articles } = await supabase
    .from("articles")
    .select("id, status")
    .eq("organization_id", org.id);

  const totalArticles = articles?.length || 0;
  const publishedArticles = articles?.filter(a => a.status === "PUBLISHED").length || 0;
  const drafts = articles?.filter(a => ["DRAFT_READY", "EDITOR_REVIEW"].includes(a.status)).length || 0;

  // 2. Fetch workflow runs
  const { data: workflows } = await supabase
    .from("workflow_runs")
    .select("id, status")
    .eq("organization_id", org.id);

  const totalWorkflows = workflows?.length || 0;
  const failedWorkflows = workflows?.filter(w => w.status === "failed").length || 0;

  // 3. Fetch revenue (from our Monetization Hub)
  const { data: products } = await supabase
    .from("affiliate_products")
    .select("affiliate_links (revenue)")
    .eq("organization_id", org.id);

  let totalRevenue = 0;
  products?.forEach(p => {
    const links = p.affiliate_links as any[];
    links?.forEach(l => {
      totalRevenue += Number(l.revenue || 0);
    });
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Welcome back, {user.displayName || user.username}. Here is your business overview.
          </p>
        </div>
        <Link
          href="/seo"
          className="inline-flex h-10 items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
        >
          Create New Article
        </Link>
      </div>

      {/* Top Level Metrics */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <h2 className="text-sm font-medium text-ink-subtle">Total Articles</h2>
          <p className="mt-2 text-3xl font-semibold">{totalArticles}</p>
        </div>
        <div className="card">
          <h2 className="text-sm font-medium text-ink-subtle">Published</h2>
          <p className="mt-2 text-3xl font-semibold text-green-600">{publishedArticles}</p>
        </div>
        <div className="card">
          <h2 className="text-sm font-medium text-ink-subtle">Drafts In Progress</h2>
          <p className="mt-2 text-3xl font-semibold text-yellow-600">{drafts}</p>
        </div>
        <div className="card">
          <h2 className="text-sm font-medium text-ink-subtle">Est. Revenue</h2>
          <p className="mt-2 text-3xl font-semibold text-brand-600">${totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* System Health & Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Workflows */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Workflow Engine</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-ink-muted">Total Runs</span>
              <span className="font-medium">{totalWorkflows}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-ink-muted">Failed Runs</span>
              <span className={`font-medium ${failedWorkflows > 0 ? 'text-red-500' : 'text-ink'}`}>
                {failedWorkflows}
              </span>
            </div>
          </div>
          <div className="mt-6">
            <Link href="/workflows" className="text-sm text-brand-600 hover:underline">
              Manage Workflows &rarr;
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-col gap-3">
            <Link href="/seo" className="flex items-center justify-between p-3 rounded-md border border-surface-border hover:bg-surface-muted">
              <span className="text-sm font-medium">Generate New SEO Article</span>
              <span className="text-ink-subtle">&rarr;</span>
            </Link>
            <Link href="/autoblog" className="flex items-center justify-between p-3 rounded-md border border-surface-border hover:bg-surface-muted">
              <span className="text-sm font-medium">View Published Blog Posts</span>
              <span className="text-ink-subtle">&rarr;</span>
            </Link>
            <Link href="/monetization" className="flex items-center justify-between p-3 rounded-md border border-surface-border hover:bg-surface-muted">
              <span className="text-sm font-medium">Add Affiliate Product</span>
              <span className="text-ink-subtle">&rarr;</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}