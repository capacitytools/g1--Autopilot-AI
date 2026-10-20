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
  
  // If somehow there is no user, the layout should have caught this.
  // But we add a fallback just in case.
  if (!user) return null; 

  const org = await getCurrentOrganization();
  const supabase = createClient();

  // Fetch projects. We handle any database errors safely.
  const { data: projects, error } = await supabase
    .from("projects")
    .select(`
      id, 
      name, 
      status, 
      created_at,
      websites (
        domain
      )
    `)
    .eq("organization_id", org.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Dashboard fetch error:", error);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Welcome back, {user.displayName || user.username}. Here is your workspace.
          </p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex h-10 items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
        >
          Create Project
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card">
          <h2 className="text-sm font-medium text-ink-subtle">Total Projects</h2>
          <p className="mt-2 text-3xl font-semibold">{projects?.length || 0}</p>
        </div>
        <div className="card">
          <h2 className="text-sm font-medium text-ink-subtle">Articles Generated</h2>
          <p className="mt-2 text-3xl font-semibold">0</p>
        </div>
        <div className="card">
          <h2 className="text-sm font-medium text-ink-subtle">Active Workflows</h2>
          <p className="mt-2 text-3xl font-semibold">0</p>
        </div>
      </div>

      {(!projects || projects.length === 0) ? (
        <div className="card flex flex-col items-center justify-center py-12 text-center">
          <h2 className="text-lg font-semibold">No projects yet</h2>
          <p className="mt-2 max-w-md text-sm text-ink-muted">
            Get started by creating your first project. SEO Master will help you research topics, write articles, and optimize for search.
          </p>
          <Link
            href="/projects/new"
            className="mt-6 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Create your first project
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          <h2 className="text-lg font-semibold mt-4">Your Projects</h2>
          {projects.map((project) => {
            // Safely extract the domain. Supabase sometimes returns 
            // an array or an object depending on the relationship inference.
            const websiteData = project.websites as any;
            const domain = Array.isArray(websiteData) 
              ? websiteData[0]?.domain 
              : websiteData?.domain;

            return (
              <div key={project.id} className="card flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-ink">{project.name}</h3>
                  <p className="text-sm text-ink-subtle mt-1">
                    {domain || "No domain connected"}
                  </p>
                </div>
                <span className="pill pill-success capitalize">{project.status}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}