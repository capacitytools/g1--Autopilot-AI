import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { trackBlogView } from "@/lib/blog-analytics-actions";

export async function generateMetadata({ params }: { params: { slug: string, articleSlug: string } }): Promise<Metadata> {
  // ... (keep existing metadata code)
}

function formatContent(text: string) {
  // ... (keep existing formatContent code)
}

export default async function BlogArticlePage({
  params,
}: {
  params: { slug: string; articleSlug: string };
}) {
  const supabase = createClient();

  const { data: article } = await supabase
    .from("articles")
    .select("id, title, seo_title, content, created_at, cover_image_url, project_id, projects (blog_slug)")
    .eq("public_slug", params.articleSlug)
    .eq("status", "PUBLISHED")
    .single();

  if (!article) notFound();

  const project = Array.isArray(article.projects) ? article.projects[0] : article.projects;
  if (project?.blog_slug !== params.slug) notFound();

  // Track the view
  await trackBlogView(article.id, article.project_id);

  return (
    <article className="max-w-3xl mx-auto py-8">
      {article.cover_image_url && (
        <div className="mb-8 rounded-xl overflow-hidden shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={article.cover_image_url} alt={article.seo_title || article.title} className="w-full h-auto max-h-[500px] object-cover" />
        </div>
      )}
      <header className="mb-8 space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink leading-tight">
          {article.seo_title || article.title}
        </h1>
        <p className="text-sm text-ink-subtle flex items-center gap-2">
          Published on {new Date(article.created_at).toLocaleDateString()}
        </p>
      </header>
      <div className="prose prose-lg max-w-none text-ink-muted leading-relaxed" dangerouslySetInnerHTML={{ __html: formatContent(article.content) }} />
    </article>
  );
}