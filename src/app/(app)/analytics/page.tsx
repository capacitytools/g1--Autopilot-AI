import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/lib/auth/organization";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Visitor Analytics",
};

export default async function AnalyticsPage() {
  const org = await getCurrentOrganization();
  const supabase = createClient();

  // Fetch the user's projects (blogs)
  const { data: projects } = await supabase
    .from("projects")
    .select("id, blog_title, blog_slug")
    .eq("organization_id", org.id)
    .not("blog_slug", "is", null);

  // Fetch the recent analytics data
  const { data: views } = await supabase
    .from("blog_analytics")
    .select(`
      id, created_at, country, device, source,
      articles (title),
      projects (blog_title)
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Visitor Analytics</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Track traffic, devices, and sources for your public blogs.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Blogs List */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Your Active Blogs</h2>
          <div className="space-y-3">
            {projects?.map(p => (
              <div key={p.id} className="flex justify-between items-center p-3 border border-surface-border rounded-md">
                <div>
                  <p className="font-medium">{p.blog_title}</p>
                  <p className="text-xs text-ink-subtle">/blog/{p.blog_slug}</p>
                </div>
                <a href={`/blog/${p.blog_slug}`} target="_blank" className="text-sm text-brand-600 hover:underline">Visit &rarr;</a>
              </div>
            ))}
            {(!projects || projects.length === 0) && <p className="text-sm text-ink-muted">No active blogs found.</p>}
          </div>
        </div>

        {/* Recent Traffic Table */}
        <div className="card overflow-x-auto">
          <h2 className="text-lg font-semibold mb-4">Recent Traffic</h2>
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-ink-subtle uppercase border-b border-surface-border">
              <tr>
                <th className="py-2">Date</th>
                <th className="py-2">Blog</th>
                <th className="py-2">Source</th>
                <th className="py-2">Device</th>
                <th className="py-2">Country</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {views?.map((view) => (
                <tr key={view.id}>
                  <td className="py-2 text-xs">{new Date(view.created_at).toLocaleDateString()}</td>
                  <td className="py-2 text-xs font-medium">{(view.projects as any)?.blog_title}</td>
                  <td className="py-2 text-xs"><span className="pill pill-info">{view.source}</span></td>
                  <td className="py-2 text-xs">{view.device}</td>
                  <td className="py-2 text-xs">{view.country}</td>
                </tr>
              ))}
              {(!views || views.length === 0) && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-ink-muted">No traffic recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}