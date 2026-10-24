import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/lib/auth/organization";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { BlogManagerUI } from "@/lib/BlogManagerUI";

export const metadata: Metadata = {
  title: "Blog Manager",
};

export default async function BlogManagerPage({ params }: { params: { id: string } }) {
  const org = await getCurrentOrganization();
  const supabase = createClient();

  // Fetch the specific project/blog
  const { data: project } = await supabase
    .from("projects")
    .select("id, name, blog_title, blog_slug, theme")
    .eq("id", params.id)
    .eq("organization_id", org.id)
    .single();

  if (!project) notFound();

  // Fetch articles for this blog
  const { data: articles } = await supabase
    .from("articles")
    .select("id, title, status, created_at, public_slug")
    .eq("project_id", project.id)
    .order("created_at", { ascending: false });

  // Fetch analytics for this blog
  const { data: views } = await supabase
    .from("blog_analytics")
    .select("id, created_at, country, device, source")
    .eq("project_id", project.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="max-w-6xl mx-auto">
      <BlogManagerUI 
        project={project} 
        articles={articles || []} 
        views={views || []} 
      />
    </div>
  );
}