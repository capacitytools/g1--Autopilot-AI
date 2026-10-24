import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Playfair_Display, Inter } from "next/font/google";

// Load the premium fonts
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

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

  return (
    <div className={`min-h-screen bg-[#FAF8F3] text-[#252823] ${playfair.variable} ${inter.variable} font-sans`}>
      
      {/* 1. Announcement Strip */}
      <div className="bg-[#174D38] text-white text-center py-2 text-xs tracking-widest uppercase font-medium">
        Welcome to G1 HomeStyle — Inspiring Beautiful Spaces
      </div>

      {/* 2. Premium Header */}
      <header className="border-b border-[#EDE6DA] bg-[#FAF8F3] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-6 border-b border-[#EDE6DA]">
            <Link href={`/blog/${params.slug}`} className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-[#174D38]">
              {project.blog_title}
            </Link>
            <p className="mt-2 text-sm italic text-[#252823]/70">{project.blog_description}</p>
          </div>

          {/* Mega Menu Navigation */}
          <nav className="hidden md:flex items-center justify-center gap-8 py-4 text-sm font-medium tracking-wide text-[#252823]/80 uppercase">
            <Link href={`/blog/${params.slug}`} className="hover:text-[#174D38]">Home</Link>
            <Link href={`/blog/${params.slug}?cat=living-room-ideas`} className="hover:text-[#174D38]">Living Rooms</Link>
            <Link href={`/blog/${params.slug}?cat=bedroom-ideas`} className="hover:text-[#174D38]">Bedrooms</Link>
            <Link href={`/blog/${params.slug}?cat=kitchen-ideas`} className="hover:text-[#174D38]">Kitchens</Link>
            <Link href={`/blog/${params.slug}?cat=bathroom-ideas`} className="hover:text-[#174D38]">Bathrooms</Link>
            <Link href={`/blog/${params.slug}?cat=small-space-design`} className="hover:text-[#174D38]">Small Spaces</Link>
            <Link href={`/blog/${params.slug}?cat=diy-home-decor`} className="hover:text-[#174D38]">DIY & Decor</Link>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {children}
      </main>

      {/* 3. Premium Footer */}
      <footer className="bg-[#252823] text-[#FAF8F3] py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-12 md:grid-cols-4">
          
          <div className="md:col-span-1">
            <h2 className="font-serif text-2xl font-bold text-white mb-4">{project.blog_title}</h2>
            <p className="text-sm text-[#FAF8F3]/70 leading-relaxed">
              Inspiring Beautiful Spaces. Thoughtful interiors, clever decorating ideas, and practical home guides.
            </p>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold mb-4 text-[#B89A62]">Categories</h3>
            <ul className="space-y-2 text-sm text-[#FAF8F3]/70">
              <li><Link href={`/blog/${params.slug}?cat=living-room-ideas`} className="hover:text-white">Living Rooms</Link></li>
              <li><Link href={`/blog/${params.slug}?cat=bedroom-ideas`} className="hover:text-white">Bedrooms</Link></li>
              <li><Link href={`/blog/${params.slug}?cat=kitchen-ideas`} className="hover:text-white">Kitchens</Link></li>
              <li><Link href={`/blog/${params.slug}?cat=diy-home-decor`} className="hover:text-white">DIY & Decor</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold mb-4 text-[#B89A62]">Company</h3>
            <ul className="space-y-2 text-sm text-[#FAF8F3]/70">
              <li><Link href="#" className="hover:text-white">About Us</Link></li>
              <li><Link href="#" className="hover:text-white">Contact</Link></li>
              <li><Link href="#" className="hover:text-white">Editorial Policy</Link></li>
              <li><Link href="#" className="hover:text-white">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold mb-4 text-[#B89A62]">Newsletter</h3>
            <p className="text-sm text-[#FAF8F3]/70 mb-4">Bring more beauty into your home. Get our latest ideas.</p>
            <div className="flex">
              <input type="email" placeholder="Email address" className="w-full px-3 py-2 bg-[#FAF8F3] text-[#252823] rounded-l-md focus:outline-none" />
              <button className="bg-[#B89A62] text-white px-4 py-2 rounded-r-md font-medium hover:bg-[#a38652]">Subscribe</button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-[#FAF8F3]/10 text-center text-xs text-[#FAF8F3]/50">
          <p>&copy; {new Date().getFullYear()} {project.blog_title}. Part of the G1 Ecosystem.</p>
        </div>
      </footer>
    </div>
  );
}