import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/lib/auth/organization";
import { WordPressForm } from "@/components/settings/WordPressForm";
import { BlogSettingsForm } from "@/lib/BlogSettingsForm";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const org = await getCurrentOrganization();
  const supabase = createClient();

  // Fetch WordPress websites for the user's organization
  const { data: websites } = await supabase
    .from("websites")
    .select("id, domain")
    .eq("organization_id", org.id);

  // Fetch the user's public blog settings (if they have created one yet)
  const { data: blog } = await supabase
    .from("blogs")
    .select("*")
    .eq("organization_id", org.id)
    .maybeSingle();

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings & Integrations</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Connect your websites and configure your public blog.
        </p>
      </div>

      {/* Public Blog Settings Card */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Public Blog Settings</h2>
        <p className="text-sm text-ink-muted mb-6">
          Claim your public URL to start sharing your published articles.
        </p>
        <BlogSettingsForm existingBlog={blog} />
      </div>

      {/* WordPress Integration Card */}
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