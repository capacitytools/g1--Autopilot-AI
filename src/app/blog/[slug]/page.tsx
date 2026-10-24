import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ThemeHeading } from "@/components/blog/Themes";

export default async function BlogHomePage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("id, blog_title, blog_description, theme")
    .eq("blog_slug", params.slug)
    .single();

  if (!project) notFound();

  const { data: articles } = await supabase
    .from("articles")
    .select("id, title, seo_title, meta_description, created_at, public_slug, content, cover_image_url, category_slug")
    .eq("project_id", project.id)
    .eq("status", "PUBLISHED")
    .order("created_at", { ascending: false });

  if (!articles || articles.length === 0) {
    return <div className="text-center py-20 text-2xl">No articles published yet. Check back soon!</div>;
  }

  const heroArticle = articles[0];
  if (!heroArticle) return null; 

  const gridArticles = articles.slice(1);
  const theme = project.theme || "default";

  return (
    <div className="space-y-20">
      
      {/* Hero Section */}
      <section className="grid lg:grid-cols-2 gap-8 items-center">
        <div className="order-2 lg:order-1 pr-0 lg:pr-8">
          <span className={`font-medium tracking-widest uppercase text-xs mb-3 block ${theme === 'magazine' ? 'text-[#B89A62]' : 'text-brand-600'}`}>
            {heroArticle.category_slug ? heroArticle.category_slug.replace('-', ' ') : "Featured Story"}
          </span>
          
          <ThemeHeading theme={theme} level={1}>
            <Link href={`/blog/${params.slug}/${heroArticle.public_slug}`}>
              {heroArticle.seo_title || heroArticle.title}
            </Link>
          </ThemeHeading>
          
          <p className={`text-lg leading-relaxed mb-8 ${theme === 'magazine' ? 'text-[#252823]/70' : 'text-ink-muted'}`}>
            {heroArticle.meta_description}
          </p>
          <Link 
            href={`/blog/${params.slug}/${heroArticle.public_slug}`}
            className={`inline-flex items-center gap-2 font-semibold border-b-2 pb-1 transition-colors ${
              theme === 'magazine' 
                ? 'text-[#174D38] border-[#174D38] hover:text-[#B89A62] hover:border-[#B89A62]' 
                : 'text-brand-600 border-brand-600 hover:text-brand-700'
            }`}
          >
            Read The Story &rarr;
          </Link>
        </div>
        <div className="order-1 lg:order-2">
          <Link href={`/blog/${params.slug}/${heroArticle.public_slug}`} className="block relative aspect-[4/5] sm:aspect-square lg:aspect-[4/5] overflow-hidden rounded-lg">
            {heroArticle.cover_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={heroArticle.cover_image_url} 
                alt={heroArticle.seo_title || heroArticle.title} 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${theme === 'magazine' ? 'bg-[#EDE6DA] text-[#174D38]' : 'bg-surface-muted text-brand-300'} font-serif text-4xl`}>G1</div>
            )}
          </Link>
        </div>
      </section>

      {/* Latest Stories Grid */}
      <section>
        <div className={`flex items-center justify-between mb-8 border-b pb-4 ${theme === 'magazine' ? 'border-[#EDE6DA]' : 'border-surface-border'}`}>
          <ThemeHeading theme={theme} level={2}>Latest Inspiration</ThemeHeading>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {gridArticles.map((article) => (
            <article key={article.id} className="group">
              <Link href={`/blog/${params.slug}/${article.public_slug}`} className="block aspect-[4/3] overflow-hidden mb-4 rounded-lg">
                {article.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={article.cover_image_url} 
                    alt={article.seo_title || article.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${theme === 'magazine' ? 'bg-[#EDE6DA] text-[#174D38]' : 'bg-surface-muted text-brand-300'} font-serif text-2xl`}>G1</div>
                )}
              </Link>
              <span className={`text-xs font-semibold tracking-wider uppercase mb-2 block ${theme === 'magazine' ? 'text-[#B89A62]' : 'text-brand-600'}`}>
                {article.category_slug ? article.category_slug.replace('-', ' ') : "Home Style"}
              </span>
              
              <ThemeHeading theme={theme} level={3} className="group-hover:opacity-70 transition-opacity line-clamp-2">
                <Link href={`/blog/${params.slug}/${article.public_slug}`}>
                  {article.seo_title || article.title}
                </Link>
              </ThemeHeading>
              
              <p className={`text-sm line-clamp-2 mt-2 ${theme === 'magazine' ? 'text-[#252823]/70' : 'text-ink-muted'}`}>
                {article.meta_description}
              </p>
            </article>
          ))}
        </div>
      </section>

    </div>
  );
}