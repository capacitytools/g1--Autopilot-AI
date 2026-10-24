"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard" }, // Changed back to Dashboard
  { name: "AI Article Studio", href: "/seo" },
  { name: "Content Studio", href: "/studio" },
  { name: "Pinterest Autopilot", href: "/pinterest", disabled: true },
  { name: "Monetization", href: "/monetization" },
  { name: "Analytics", href: "/analytics" },
  { name: "Settings", href: "/settings" },
];

export function AppSidebar({ 
  userEmail, 
  blogs 
}: { 
  userEmail: string; 
  blogs: { id: string; blog_title: string; blog_slug: string }[] 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [activeBlog, setActiveBlog] = useState(blogs[0]?.id || "");

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden border-b border-surface-border bg-surface sticky top-0 z-50">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-brand-600" aria-hidden="true" />
            <span className="text-lg font-semibold tracking-tight">G1-Autopilot</span>
          </Link>
          <button
            className="p-2 text-ink-muted hover:text-ink"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-surface-border transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:flex md:flex-col
      `}>
        <div className="hidden md:flex h-16 items-center px-6 border-b border-surface-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-brand-600" aria-hidden="true" />
            <span className="text-lg font-semibold tracking-tight">G1-Autopilot</span>
          </Link>
        </div>

        <div className="md:hidden flex justify-end p-4">
          <button onClick={() => setIsOpen(false)} className="text-ink-muted hover:text-ink text-2xl">&times;</button>
        </div>

        <div className="p-4 border-b border-surface-border">
          <label className="text-xs font-semibold text-ink-subtle uppercase tracking-wider mb-2 block">
            Active Website
          </label>
          <select 
            value={activeBlog}
            onChange={(e) => setActiveBlog(e.target.value)}
            className="w-full rounded-md border border-surface-border bg-surface-muted px-3 py-2 text-sm font-medium focus:border-brand-500 focus:outline-none"
          >
            {blogs.map(b => (
              <option key={b.id} value={b.id}>{b.blog_title}</option>
            ))}
            {blogs.length === 0 && <option value="">No blogs yet</option>}
          </select>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard");
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive ? "bg-brand-50 text-brand-700" : "text-ink-muted hover:bg-surface-muted hover:text-ink"
                } ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {item.name}
                {item.disabled && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Soon</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-surface-border">
          <div className="mb-4 px-2">
            <p className="text-xs text-ink-subtle">Logged in as</p>
            <p className="text-sm font-medium truncate">{userEmail}</p>
          </div>
          <form action="/auth/logout" method="POST">
            <Button variant="secondary" size="sm" type="submit" className="w-full">
              Log out
            </Button>
          </form>
        </div>
      </aside>
    </>
  );
}