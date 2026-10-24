import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { slug: string, articleSlug: string } }): Promise<Metadata> {
  const supabase = createClient();
  
  const { data: article } = await supabase
    .from("articles")
    .select("seo_title, meta_description")
    .eq("public_slug", params.articleSlug)
    .single();

  return {
    title: article?.seo_title || "Article",
    description: article?.meta_description || "",
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: { slug: string; articleSlug: string };
}) {
  const supabase = createClient();

  // Fetch the specific article
  const { data: article } = await supabase
    .from("articles")
    .select("id, title, seo_title, content, created_at, projects (blog_slug)")
    .eq("public_slug", params.articleSlug)
    .eq("status", "PUBLISHED")
    .single();

  if (!article) notFound();

  // Verify the article belongs to the blog in the URL
  const project = Array.isArray(article.projects) ? article.projects[0] : article.projects;
  if (project?.blog_slug !== params.slug) notFound();

  return (
    <article className="max-w-3xl mx-auto py-8">
      <header className="mb-8 space-y-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink leading-tight">
          {article.seo_title || article.title}
        </h1>
        <p className="text-sm text-ink-subtle">
          Published on {new Date(article.created_at).toLocaleDateString()}
        </p>
      </header>

      {/* 
        Note: Since the AI outputs Markdown or raw text, we render it as plain text for now. 
        In a future update, we will add a Markdown parser library to format the H2s and bold text.
      */}
      <div className="prose prose-lg max-w-none text-ink-muted">
        <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed">
          {article.content}
        </pre>
      </div>
    </article>
  );
}