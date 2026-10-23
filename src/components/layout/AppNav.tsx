"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "SEO Master", href: "/seo" },
  { name: "Content Studio", href: "/studio", disabled: true },
  { name: "AutoBlog", href: "/autoblog" },
  { name: "Pinterest", href: "/pinterest", disabled: true },
  { name: "Workflows", href: "/workflows" }, // <--- ENABLED HERE
  { name: "Monetization", href: "/monetization", disabled: true },
  { name: "Analytics", href: "/analytics", disabled: true },
  { name: "Settings", href: "/settings" },
];

export function AppNav({ userEmail }: { userEmail: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Header */}
      <header className="border-b border-surface-border bg-surface sticky top-0 z-50">
        <div className="container-app flex h-16 items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
            <div className="h-8 w-8 rounded-md bg-brand-600" aria-hidden="true" />
            <span className="text-lg font-semibold tracking-tight">G1-Autopilot</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-ink-muted">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`hover:text-ink ${pathname.startsWith(item.href) ? "text-brand-600 font-semibold" : ""} ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={(e) => item.disabled && e.preventDefault()}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            <form action="/auth/logout" method="POST" className="hidden md:block">
              <Button variant="secondary" size="sm" type="submit">
                Log out
              </Button>
            </form>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-ink-muted hover:text-ink"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle navigation menu"
            >
              {isOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-surface z-40 overflow-y-auto">
          <nav className="flex flex-col p-4 space-y-2">
            <div className="pb-4 border-b border-surface-border mb-2">
              <p className="text-xs text-ink-subtle font-medium uppercase tracking-wider mb-2">Logged in as</p>
              <p className="text-sm font-medium text-ink">{userEmail}</p>
            </div>
            
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => {
                  if (item.disabled) {
                    e.preventDefault();
                  } else {
                    setIsOpen(false);
                  }
                }}
                className={`flex items-center justify-between p-3 rounded-md text-base font-medium ${
                  pathname.startsWith(item.href) ? "bg-brand-50 text-brand-700" : "text-ink-muted hover:bg-surface-muted"
                } ${item.disabled ? "opacity-50" : ""}`}
              >
                {item.name}
                {item.disabled && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">Soon</span>}
              </Link>
            ))}
            
            <div className="pt-6 mt-4 border-t border-surface-border">
              <form action="/auth/logout" method="POST">
                <Button variant="secondary" size="sm" type="submit" className="w-full">
                  Log out
                </Button>
              </form>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}