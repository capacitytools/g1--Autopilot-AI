import { Metadata } from "next";
import { SEOForm } from "@/components/seo/SEOForm";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/lib/auth/organization";

export const metadata: Metadata = {
  title: "SEO Master",
};

export default async function SEOPage() {
  const org = await getCurrentOrganization();
  const supabase = createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name")
    .eq("organization_id", org.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">SEO Master</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Research smarter. Write better. Optimize for search.
        </p>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-6">Start a New Article</h2>
        <SEOForm projects={projects || []} />
      </div>
    </div>
  );
}