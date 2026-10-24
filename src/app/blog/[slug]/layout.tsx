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
  
  // Header Config based on theme
  let headerBg = "bg-surface border-surface-border text-ink";
  let navHover = "hover:text-brand-600";
  let stripBg = "hidden";

  if (theme === "haven-living") {
    headerBg = "bg-[#FAF8F3] border-[#EDE5D8] text-[#174D38]";
    navHover = "hover:text-[#B89A62]";
    stripBg = "block bg-[#174D38] text-white";
  } else if (theme === "fashion-palace") {
    headerBg = "bg-white border-[#E7E4E1] text-[#111111]";
    navHover = "hover:text-[#7A2035]";
  } else if (theme === "daily-brief") {
    headerBg = "bg-white border-[#DDE1E6] text-[#171717]";
    navHover = "hover:text-[#C62828]";
  } else if (theme === "agrosphere") {
    headerBg = "bg-white border-surface-border text-[#14532D]";
    navHover = "hover:text-[#65A30D]";
  } else if (theme === "idea-journal") {
    headerBg = "bg-[#FCFBF8] border-[#E6E2DC] text-[#202124]";
    navHover = "hover:text-[#286B65]";
  }

  return (
    <ThemeWrapper theme={theme}>
      {/* Announcement Strip */}
      {theme === "haven-living" && (
        <div className="bg-[#174D38] text-white text-center py-2 text-xs tracking-widest uppercase font-medium">
          Welcome to {project.blog_title}
        </div>
      )}
      {theme === "fashion-palace" && (
        <div className="bg-[#111111] text-white text-center py-2 text-xs tracking-widest uppercase font-medium">
          The Latest in Style & Beauty
        </div>
      )}
      {theme === "daily-brief" && (
        <div className="bg-[#C62828] text-white text-center py-2 text-xs tracking-widest uppercase font-bold flex items-center justify-center gap-2">
          <span className="h-2 w-2 rounded-full bg-white animate-pulse" /> Breaking News
        </div>
      )}

      {/* Header */}
      <header className={`border-b ${headerBg} sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex flex-col items-center justify-center py-6 border-b ${headerBg.split(' ')[1]}`}>
            <Link 
              href={`/blog/${params.slug}`} 
              className={`text-4xl sm:text-5xl font-bold ${
                theme === 'haven-living' ? 'font-serif' : 
                theme === 'fashion-palace' ? 'font-serif uppercase tracking-widest' : 
                theme === 'daily-brief' ? 'font-serif' : 
                theme === 'agrosphere' ? 'font-sans tracking-tight' : 'font-serif'
              }`}
            >
              {project.blog_title}
            </Link>
            <p className={`mt-2 text-sm ${theme === 'haven-living' ? 'italic text-[#252823]/70' : 'opacity-70'}`}>
              {project.blog_description}
            </p>
          </div>

          {/* Navigation */}
          <nav className={`flex items-center justify-center gap-8 py-4 text-sm font-medium tracking-wide uppercase ${headerBg.split(' ')[2]}`}>
            <Link href={`/blog/${params.slug}`} className={navHover}>Home</Link>
            <Link href={`/blog/${params.slug}?cat=living-room-ideas`} className={navHover}>Living Rooms</Link>
            <Link href={`/blog/${params.slug}?cat=bedroom-ideas`} className={navHover}>Bedrooms</Link>
            <Link href={`/blog/${params.slug}?cat=kitchen-ideas`} className={navHover}>Kitchens</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className={`py-16 mt-20 border-t ${headerBg.split(' ')[0]} ${headerBg.split(' ')[1]}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm opacity-70">
          <p>&copy; {new Date().getFullYear()} {project.blog_title}. Powered by G1-Autopilot AI.</p>
        </div>
      </footer>
    </ThemeWrapper>
  );
}