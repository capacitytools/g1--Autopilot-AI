import { requireUser } from "@/lib/auth/adapter";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will redirect to /login if the user is not authenticated.
  const user = await requireUser();

  return (
    <div className="min-h-screen bg-surface-muted flex flex-col">
      <header className="border-b border-surface-border bg-surface">
        <div className="container-app flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-brand-600" aria-hidden="true" />
              <span className="text-lg font-semibold tracking-tight">G1-Autopilot</span>
            </Link>
            <nav className="hidden sm:flex items-center gap-4 text-sm font-medium text-ink-muted">
              <Link href="/dashboard" className="hover:text-ink">Dashboard</Link>
              <span className="text-ink-subtle cursor-not-allowed" title="Coming in Phase 4">SEO Master</span>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-ink-muted hidden sm:inline-block">
              {user.email}
            </span>
            <form action="/auth/logout" method="POST">
              <Button variant="secondary" size="sm" type="submit">
                Log out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1 py-8">
        <div className="container-app">
          {children}
        </div>
      </main>
    </div>
  );
}