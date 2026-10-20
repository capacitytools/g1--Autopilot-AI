import { getCurrentUser } from "@/lib/auth/adapter";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Welcome back, {user?.displayName || user?.username}.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card">
          <h2 className="text-sm font-medium text-ink-subtle">Total Projects</h2>
          <p className="mt-2 text-3xl font-semibold">0</p>
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

      <div className="card flex flex-col items-center justify-center py-12 text-center">
        <h2 className="text-lg font-semibold">No projects yet</h2>
        <p className="mt-2 max-w-md text-sm text-ink-muted">
          Get started by creating your first project. SEO Master will help you research topics, write articles, and optimize for search.
        </p>
        <button className="mt-6 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700" disabled title="Coming in Phase 3">
          Create Project (Coming Soon)
        </button>
      </div>
    </div>
  );
}