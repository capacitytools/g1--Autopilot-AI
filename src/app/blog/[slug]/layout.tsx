import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function BlogLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const supabase = createClient();

  // Fetch the blog details based on the URL slug
  const { data: project } = await supabase
    .from("projects")
    .select("blog_title, blog_description, blog_slug")
    .eq("blog_slug", params.slug)
    .single();

  if (!project) notFound();

  return (
    <div className="min-h-screen bg-surface">
      {/* Blog Header */}
      <header className="border-b border-surface-border bg-surface">
        <div className="container-app flex h-20 items-center justify-between">
          <Link href={`/blog/${params.slug}`} className="text-2xl font-bold tracking-tight text-brand-700">
            {project.blog_title || "My Blog"}
          </Link>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-ink-muted">
            <Link href={`/blog/${params.slug}`} className="hover:text-brand-600">Home</Link>
            
            {/* Dropdown for Categories */}
            <div className="relative group">
              <button className="flex items-center gap-1 hover:text-brand-600 py-2">
                Categories
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              
              <div className="absolute top-full left-0 w-48 bg-surface border border-surface-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2 flex flex-col">
                  <Link href={`/blog/${params.slug}?cat=bedroom-ideas`} className="px-4 py-2 hover:bg-surface-muted">Bedroom Ideas</Link>
                  <Link href={`/blog/${params.slug}?cat=living-room-ideas`} className="px-4 py-2 hover:bg-surface-muted">Living Room</Link>
                  <Link href={`/blog/${params.slug}?cat=kitchen-ideas`} className="px-4 py-2 hover:bg-surface-muted">Kitchen</Link>
                  <Link href={`/blog/${params.slug}?cat=bathroom-ideas`} className="px-4 py-2 hover:bg-surface-muted">Bathroom</Link>
                  <Link href={`/blog/${params.slug}?cat=small-space-design`} className="px-4 py-2 hover:bg-surface-muted">Small Spaces</Link>
                  <Link href={`/blog/${params.slug}?cat=diy-home-decor`} className="px-4 py-2 hover:bg-surface-muted">DIY Decor</Link>
                </div>
              </div>
            </div>

            <Link href={`/blog/${params.slug}/about`} className="hover:text-brand-600">About</Link>
            <Link href={`/blog/${params.slug}/contact`} className="hover:text-brand-600">Contact</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-app py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-border bg-surface-muted py-12 mt-12">
        <div className="container-app text-center text-sm text-ink-subtle">
          <p>&copy; {new Date().getFullYear()} {project.blog_title}. Powered by G1-Autopilot AI.</p>
        </div>
      </footer>
    </div>
  );
}