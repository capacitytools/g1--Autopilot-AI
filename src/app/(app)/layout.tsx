import { requireUser } from "@/lib/auth/adapter";
import { getCurrentOrganization } from "@/lib/auth/organization";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/layout/AppSidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const org = await getCurrentOrganization();
  const supabase = createClient();

  // Fetch user's blogs for the website switcher
  const { data: blogs } = await supabase
    .from("projects")
    .select("id, blog_title, blog_slug")
    .eq("organization_id", org.id)
    .not("blog_slug", "is", null);

  return (
    <div className="min-h-screen bg-surface-muted flex">
      <AppSidebar userEmail={user.email} blogs={blogs || []} />
      
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}