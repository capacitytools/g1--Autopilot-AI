import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { slug: string, articleSlug: string } }): Promise<Metadata> {
  const supabase = createClient();
  
  const { data: article } = await supabase
    .from("articles")
    .select("seo_title, meta_description, cover_image_url")
    .eq("public_slug", params.articleSlug)
    .single();

  return {
    title: article?.seo_title || "Article",
    description: article?.meta_description || "",
    openGraph: {
      images: article?.cover_image_url ? [article.cover_image_url] : [],
    }
  };
}

// A simple function to format basic Markdown (Bold, Italics, Headers, Links)
function formatContent(text: string) {
  return text
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-8 mb-4 text-ink">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-10 mb-4 text-ink">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-12 mb-6 text-ink">$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    // Italics
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    // Links
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" class="text-brand-600 hover:underline">$1</a>')
    // Line breaks
    .replace(/\n/gim, '<br />');
}

export default async function BlogArticlePage({
  params,
}: {
  params: { slug: string; articleSlug: string };
}) {
  const supabase = createClient();

  const { data: article } = await supabase
    .from("articles")
    .select("id, title, seo_title, content, created_at, cover_image_url, projects (blog_slug)")
    .eq("public_slug", params.articleSlug)
    .eq("status", "PUBLISHED")
    .single();

  if (!article) notFound();

  const project = Array.isArray(article.projects) ? article.projects[0] : article.projects;
  if (project?.blog_slug !== params.slug) notFound();

  return (
    <article className="max-w-3xl mx-auto py-8">
      {/* Cover Image */}
      {article.cover_image_url && (
        <div className="mb-8 rounded-xl overflow-hidden shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={article.cover_image_url} 
            alt={article.seo_title || article.title} 
            className="w-full h-auto max-h-[500px] object-cover"
          />
        </div>
      )}

      <header className="mb-8 space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink leading-tight">
          {article.seo_title || article.title}
        </h1>
        <p className="text-sm text-ink-subtle flex items-center gap-2">
          Published on {new Date(article.created_at).toLocaleDateString(undefined, {
            year: 'numeric', month: 'long', day: 'numeric'
          })}
        </p>
      </header>

      {/* Formatted Content */}
      <div 
        className="prose prose-lg max-w-none text-ink-muted leading-relaxed"
        dangerouslySetInnerHTML={{ __html: formatContent(article.content) }}
      />
    </article>
  );
}