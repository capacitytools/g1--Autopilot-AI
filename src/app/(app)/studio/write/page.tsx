import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/lib/auth/organization";
import { Metadata } from "next";
import { NativeBlogEditor } from "@/lib/NativeBlogEditor";

export const metadata: Metadata = {
  title: "Write a Post",
};

export default async function WritePage() {
  const org = await getCurrentOrganization();
  const supabase = createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, blog_title")
    .eq("organization_id", org.id);

  return (
    <div className="py-6">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Create a New Post</h1>
        <p className="mt-1 text-sm text-ink-muted">Write a post directly to your public blog.</p>
      </div>
      <NativeBlogEditor projects={projects || []} />
    </div>
  );
}