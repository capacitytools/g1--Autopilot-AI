import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ThemeWrapper } from "@/components/blog/Themes";

export default async function BlogLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const supabase = createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("blog_title, blog_description, blog_slug, theme")
    .eq("blog_slug", params.slug)
    .single();

  if (!project) notFound();

  const theme = project.theme || "default";
  const isMagazine = theme === "magazine";

  return (
    <ThemeWrapper theme={theme}>
      {/* Announcement Strip (Only for Magazine) */}
      {isMagazine && (
        <div className="bg-[#174D38] text-white text-center py-2 text-xs tracking-widest uppercase font-medium">
          Welcome to {project.blog_title} — Inspiring Beautiful Spaces
        </div>
      )}

      {/* Header */}
      <header className={`border-b ${isMagazine ? 'border-[#EDE6DA] bg-[#FAF8F3]' : 'border-surface-border bg-surface'} sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex flex-col items-center justify-center py-6 ${isMagazine ? 'border-b border-[#EDE6DA]' : 'border-b border-surface-border'}`}>
            <Link 
              href={`/blog/${params.slug}`} 
              className={`${isMagazine ? 'font-serif text-4xl sm:text-5xl font-bold text-[#174D38]' : 'font-sans text-3xl font-bold text-ink'}`}
            >
              {project.blog_title}
            </Link>
            <p className={`mt-2 text-sm ${isMagazine ? 'italic text-[#252823]/70' : 'text-ink-muted'}`}>
              {project.blog_description}
            </p>
          </div>

          {/* Navigation */}
          <nav className={`flex items-center justify-center gap-8 py-4 text-sm font-medium tracking-wide uppercase ${isMagazine ? 'text-[#252823]/80' : 'text-ink-muted'}`}>
            <Link href={`/blog/${params.slug}`} className={`hover:${isMagazine ? 'text-[#174D38]' : 'text-brand-600'}`}>Home</Link>
            <Link href={`/blog/${params.slug}?cat=living-room-ideas`} className={`hover:${isMagazine ? 'text-[#174D38]' : 'text-brand-600'}`}>Living Rooms</Link>
            <Link href={`/blog/${params.slug}?cat=bedroom-ideas`} className={`hover:${isMagazine ? 'text-[#174D38]' : 'text-brand-600'}`}>Bedrooms</Link>
            <Link href={`/blog/${params.slug}?cat=kitchen-ideas`} className={`hover:${isMagazine ? 'text-[#174D38]' : 'text-brand-600'}`}>Kitchens</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className={`py-16 mt-20 ${isMagazine ? 'bg-[#252823] text-[#FAF8F3]' : 'bg-surface-muted border-t border-surface-border text-ink-muted'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} {project.blog_title}. Powered by G1-Autopilot AI.</p>
        </div>
      </footer>
    </ThemeWrapper>
  );
}