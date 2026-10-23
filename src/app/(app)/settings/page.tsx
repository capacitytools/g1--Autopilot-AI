import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/lib/auth/organization";
import { WordPressForm } from "@/components/settings/WordPressForm";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const org = await getCurrentOrganization();
  const supabase = createClient();

  // Fetch websites that belong to this org
  const { data: websites } = await supabase
    .from("websites")
    .select("id, domain")
    .eq("organization_id", org.id);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings & Integrations</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Connect your websites and tools to automate your workflow.
        </p>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">WordPress Publishing</h2>
        <p className="text-sm text-ink-muted mb-6">
          Connect your WordPress site to automatically publish approved articles.
        </p>
        <WordPressForm websites={websites || []} />
      </div>
    </div>
  );
}