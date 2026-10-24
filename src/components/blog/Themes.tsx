import { Playfair_Display, Inter, Bodoni_Moda, Source_Serif_4, Manrope, Newsreader } from "next/font/google";

// Load all premium fonts
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const bodoni = Bodoni_Moda({ subsets: ["latin"], variable: "--font-bodoni", display: "swap" });
const sourceSerif = Source_Serif_4({ subsets: ["latin"], variable: "--font-source", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-newsreader", display: "swap" });

export function ThemeWrapper({ theme, children }: { theme: string; children: React.ReactNode }) {
  let fontVariables = `${inter.variable}`;
  let themeClasses = "";

  // Apply fonts and base styles based on the theme
  switch (theme) {
    case "haven-living":
      fontVariables += ` ${playfair.variable}`;
      themeClasses = "bg-[#FAF8F3] text-[#252823] font-sans";
      break;
    case "fashion-palace":
      fontVariables += ` ${bodoni.variable}`;
      themeClasses = "bg-[#FFFFFF] text-[#111111] font-sans";
      break;
    case "daily-brief":
      fontVariables += ` ${sourceSerif.variable}`;
      themeClasses = "bg-[#FFFFFF] text-[#171717] font-sans";
      break;
    case "agrosphere":
      fontVariables += ` ${manrope.variable}`;
      themeClasses = "bg-[#FFFFFF] text-[#202820] font-sans";
      break;
    case "idea-journal":
      fontVariables += ` ${newsreader.variable}`;
      themeClasses = "bg-[#FCFBF8] text-[#202124] font-sans";
      break;
    default:
      // Default fallback (Classic/Magazine)
      themeClasses = "bg-surface-muted text-ink font-sans";
  }

  return <div className={`min-h-screen ${fontVariables} ${themeClasses}`}>{children}</div>;
}

export function ThemeHeading({ theme, level, children, className = "" }: { theme: string; level: 1 | 2 | 3; children: React.ReactNode; className?: string }) {
  const Tag = `h${level}` as any;
  let baseClasses = "";

  switch (theme) {
    case "haven-living":
      baseClasses = "font-serif tracking-tight text-[#174D38]";
      if (level === 1) baseClasses += " text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6";
      if (level === 2) baseClasses += " text-3xl font-bold mb-4";
      if (level === 3) baseClasses += " text-xl font-bold mb-2";
      break;
    case "fashion-palace":
      baseClasses = "font-serif uppercase tracking-widest text-[#111111]";
      if (level === 1) baseClasses += " text-5xl sm:text-6xl lg:text-7xl mb-6";
      if (level === 2) baseClasses += " text-3xl mb-4";
      if (level === 3) baseClasses += " text-xl mb-2";
      break;
    case "daily-brief":
      baseClasses = "font-serif font-bold text-[#171717]";
      if (level === 1) baseClasses += " text-3xl sm:text-4xl mb-4";
      if (level === 2) baseClasses += " text-2xl mb-3";
      if (level === 3) baseClasses += " text-xl mb-2";
      break;
    case "agrosphere":
      baseClasses = "font-sans font-extrabold text-[#14532D] tracking-tight";
      if (level === 1) baseClasses += " text-3xl sm:text-4xl lg:text-5xl mb-4";
      if (level === 2) baseClasses += " text-2xl mb-3";
      if (level === 3) baseClasses += " text-xl mb-2";
      break;
    case "idea-journal":
      baseClasses = "font-serif font-medium text-[#202124]";
      if (level === 1) baseClasses += " text-3xl sm:text-4xl lg:text-5xl leading-tight mb-4";
      if (level === 2) baseClasses += " text-2xl mb-3";
      if (level === 3) baseClasses += " text-xl mb-2";
      break;
    default:
      baseClasses = "font-sans font-semibold text-ink";
      if (level === 1) baseClasses += " text-3xl mb-4";
      if (level === 2) baseClasses += " text-2xl mb-3";
      if (level === 3) baseClasses += " text-xl mb-2";
  }

  return <Tag className={`${baseClasses} ${className}`}>{children}</Tag>;
}