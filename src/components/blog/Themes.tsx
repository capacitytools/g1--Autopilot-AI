import { Playfair_Display, Inter } from "next/font/google";

// Load premium fonts
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export function ThemeWrapper({ theme, children }: { theme: string; children: React.ReactNode }) {
  // Base Classes for the wrapper based on the theme
  let wrapperClasses = `min-h-screen ${inter.variable} font-sans`;
  
  if (theme === "magazine") {
    // The HomeStyle Premium Magazine Look
    wrapperClasses += ` bg-[#FAF8F3] text-[#252823] ${playfair.variable}`;
  } else if (theme === "classic") {
    // A cleaner, traditional blog look
    wrapperClasses += ` bg-white text-gray-900`;
  } else {
    // Default G1 Clean Look
    wrapperClasses += ` bg-surface-muted text-ink`;
  }

  return <div className={wrapperClasses}>{children}</div>;
}

// A helper to style headings based on the theme
export function ThemeHeading({ theme, level, children, className = "" }: { theme: string; level: 1 | 2 | 3; children: React.ReactNode; className?: string }) {
  const Tag = `h${level}` as any;
  
  let baseClasses = "";
  if (theme === "magazine") {
    baseClasses = "font-serif tracking-tight text-[#174D38]";
    if (level === 1) baseClasses += " text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6";
    if (level === 2) baseClasses += " text-3xl font-bold mb-4";
    if (level === 3) baseClasses += " text-xl font-bold mb-2";
  } else if (theme === "classic") {
    baseClasses = "font-sans font-bold text-gray-900";
    if (level === 1) baseClasses += " text-3xl sm:text-4xl mb-4";
    if (level === 2) baseClasses += " text-2xl mb-3";
    if (level === 3) baseClasses += " text-xl mb-2";
  } else {
    baseClasses = "font-sans font-semibold text-ink";
    if (level === 1) baseClasses += " text-3xl mb-4";
    if (level === 2) baseClasses += " text-2xl mb-3";
    if (level === 3) baseClasses += " text-xl mb-2";
  }

  return <Tag className={`${baseClasses} ${className}`}>{children}</Tag>;
}