import { requireUser } from "@/lib/auth/adapter";
import { AppNav } from "@/components/layout/AppNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="min-h-screen bg-surface-muted flex flex-col">
      <AppNav userEmail={user.email} />
      
      <main id="main-content" className="flex-1 py-8">
        <div className="container-app">
          {children}
        </div>
      </main>
    </div>
  );
}