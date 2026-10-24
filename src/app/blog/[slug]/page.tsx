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
    .select("id, title, seo_title, meta_description, created_at, public_slug, content, cover_image_url, category_slug")
    .eq("project_id", project.id)
    .eq("status", "PUBLISHED")
    .order("created_at", { ascending: false });

  if (!articles || articles.length === 0) {
    return <div className="text-center py-20 font-serif text-2xl text-[#174D38]">No articles published yet. Check back soon!</div>;
  }

  // Safe fallback for TypeScript
  const heroArticle = articles[0];
  if (!heroArticle) return null; 

  const secondaryArticles = articles.slice(1, 3);
  const gridArticles = articles.slice(3);

  return (
    <div className="space-y-20">
      
      {/* 1. Asymmetrical Hero Section */}
      <section className="grid lg:grid-cols-2 gap-8 items-center">
        <div className="order-2 lg:order-1 pr-0 lg:pr-8">
          <span className="text-[#B89A62] font-medium tracking-widest uppercase text-xs mb-3 block">
            {heroArticle.category_slug ? heroArticle.category_slug.replace('-', ' ') : "Featured Story"}
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-[#174D38] mb-6">
            <Link href={`/blog/${params.slug}/${heroArticle.public_slug}`}>
              {heroArticle.seo_title || heroArticle.title}
            </Link>
          </h1>
          <p className="text-lg text-[#252823]/70 leading-relaxed mb-8">
            {heroArticle.meta_description}
          </p>
          <Link 
            href={`/blog/${params.slug}/${heroArticle.public_slug}`}
            className="inline-flex items-center gap-2 text-[#174D38] font-semibold border-b-2 border-[#174D38] pb-1 hover:text-[#B89A62] hover:border-[#B89A62] transition-colors"
          >
            Read The Story &rarr;
          </Link>
        </div>
        <div className="order-1 lg:order-2">
          <Link href={`/blog/${params.slug}/${heroArticle.public_slug}`} className="block relative aspect-[4/5] sm:aspect-square lg:aspect-[4/5] overflow-hidden">
            {heroArticle.cover_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={heroArticle.cover_image_url} 
                alt={heroArticle.seo_title || heroArticle.title} 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full bg-[#EDE6DA] flex items-center justify-center text-[#174D38] font-serif text-4xl">G1</div>
            )}
          </Link>
        </div>
      </section>

      {/* 2. Category Discovery Tiles */}
      <section className="py-12 border-y border-[#EDE6DA]">
        <h2 className="font-serif text-3xl font-bold text-[#174D38] text-center mb-10">Explore by Room</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Living Room', 'Bedroom', 'Kitchen', 'Bathroom'].map((cat) => (
            <Link 
              key={cat} 
              href={`/blog/${params.slug}?cat=${cat.toLowerCase().replace(' ', '-')}-ideas`}
              className="group relative h-48 overflow-hidden"
            >
              <div className="absolute inset-0 bg-[#252823]/40 group-hover:bg-[#174D38]/60 transition-colors z-10" />
              <div className="absolute inset-0 bg-[#EDE6DA]" />
              <div className="absolute inset-0 flex items-end justify-center pb-6 z-20">
                <span className="text-white font-serif text-xl tracking-wide">{cat}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Latest Stories Grid */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-3xl font-bold text-[#174D38]">Latest Inspiration</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {gridArticles.map((article) => (
            <article key={article.id} className="group">
              <Link href={`/blog/${params.slug}/${article.public_slug}`} className="block aspect-[4/3] overflow-hidden mb-4">
                {article.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={article.cover_image_url} 
                    alt={article.seo_title || article.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-[#EDE6DA] flex items-center justify-center text-[#174D38] font-serif text-2xl">G1</div>
                )}
              </Link>
              <span className="text-[#B89A62] text-xs font-semibold tracking-wider uppercase mb-2 block">
                {article.category_slug ? article.category_slug.replace('-', ' ') : "Home Style"}
              </span>
              <h3 className="font-serif text-xl font-bold text-[#174D38] group-hover:text-[#B89A62] transition-colors mb-2 line-clamp-2">
                <Link href={`/blog/${params.slug}/${article.public_slug}`}>
                  {article.seo_title || article.title}
                </Link>
              </h3>
              <p className="text-sm text-[#252823]/70 line-clamp-2">
                {article.meta_description}
              </p>
            </article>
          ))}
        </div>
      </section>

    </div>
  );
}