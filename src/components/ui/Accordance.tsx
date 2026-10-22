"use client";

import { useState, type ReactNode } from "react";

export function Accordion({ 
  title, 
  defaultOpen = false, 
  children 
}: { 
  title: string; 
  defaultOpen?: boolean; 
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-surface-border rounded-md mb-2 overflow-hidden bg-surface">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-surface-muted hover:bg-gray-100 transition-colors text-left"
      >
        <span className="font-medium text-ink">{title}</span>
        <svg
          className={`w-5 h-5 text-ink-subtle transform transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="p-4 border-t border-surface-border text-sm">
          {children}
        </div>
      )}
    </div>
  );
}