import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "G1-Autopilot AI",
    template: "%s · G1-Autopilot AI",
  },
  description:
    "Create. Rank. Automate. Grow. AI-powered content and business automation for creators, publishers, and businesses.",
  applicationName: "G1-Autopilot AI",
  authors: [{ name: "G1-Tech Ecosystem" }],
  keywords: [
    "SEO",
    "content automation",
    "AI writing",
    "G1-Tech",
    "Autopilot",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    siteName: "G1-Autopilot AI",
    title: "G1-Autopilot AI",
    description: "Create. Rank. Automate. Grow.",
  },
  twitter: {
    card: "summary_large_image",
    title: "G1-Autopilot AI",
    description: "Create. Rank. Automate. Grow.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2f7d4f",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-surface-muted text-ink">
        <a
          href="#main-content"
          className="sr-only-focusable absolute left-4 top-4 z-50 rounded bg-brand-600 px-3 py-2 text-sm font-medium text-white"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}