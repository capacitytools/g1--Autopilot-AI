import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function BlogHomePage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("id, blog_title, blog_description")
    .eq("blog_slug", params.slug)
    .single();

  if (!project) notFound();

  const { data: articles } = await supabase
    .from("articles")
    .select("id, title, seo_title, meta_description, created_at, public_slug, content, cover_image_url")
    .eq("project_id", project.id)
    .eq("status", "PUBLISHED")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8 border-b border-surface-border">
        <h1 className="text-4xl font-bold tracking-tight text-ink">{project.blog_title}</h1>
        <p className="text-lg text-ink-muted max-w-2xl mx-auto">
          {project.blog_description}
        </p>
      </div>

      {/* Articles Grid */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Latest Articles</h2>
        
        {(!articles || articles.length === 0) ? (
          <div className="card text-center py-12">
            <p className="text-ink-muted">No articles published yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2">
            {articles.map((article) => (
              <article key={article.id} className="card hover:shadow-md transition-shadow flex flex-col p-0 overflow-hidden">
                {/* Thumbnail */}
                {article.cover_image_url ? (
                  <Link href={`/blog/${params.slug}/${article.public_slug || article.id}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={article.cover_image_url} 
                      alt={article.seo_title || article.title} 
                      className="w-full h-48 object-cover"
                    />
                  </Link>
                ) : (
                  <div className="w-full h-48 bg-brand-100 flex items-center justify-center">
                    <span className="text-brand-300 font-bold text-2xl">G1</span>
                  </div>
                )}
                
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-ink hover:text-brand-600 mb-2 line-clamp-2">
                      <Link href={`/blog/${params.slug}/${article.public_slug || article.id}`}>
                        {article.seo_title || article.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-ink-muted line-clamp-3">
                      {article.meta_description || article.content?.substring(0, 120) + "..."}
                    </p>
                  </div>
                  
                  <div className="pt-4 mt-4 border-t border-surface-border flex items-center justify-between">
                    <span className="text-xs text-ink-subtle">
                      {new Date(article.created_at).toLocaleDateString()}
                    </span>
                    <Link 
                      href={`/blog/${params.slug}/${article.public_slug || article.id}`}
                      className="text-sm font-medium text-brand-600 hover:underline"
                    >
                      Read More &rarr;
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}