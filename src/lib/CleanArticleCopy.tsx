"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function CleanArticleCopy({ rawContent }: { rawContent: string }) {
  const [copied, setCopied] = useState(false);

  function cleanAndCopy() {
    // A simple Markdown-to-Text cleaner
    const cleanText = rawContent
      // Remove bold and italic asterisks
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      // Remove hashtags (markdown headers) but keep the text
      .replace(/^#+\s*/gm, "")
      // Remove horizontal rules
      .replace(/^---+$/gm, "")
      // Remove backticks
      .replace(/`/g, "")
      // Clean up extra spaces or lines
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    navigator.clipboard.writeText(cleanText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="card bg-brand-50 border-brand-200 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <h3 className="font-semibold text-brand-900">Ready to Publish</h3>
        <p className="text-sm text-brand-800">
          Copy the fully formatted article to paste into your blog, Medium, or WordPress.
        </p>
      </div>
      <Button onClick={cleanAndCopy} variant="primary" className="w-full sm:w-auto shrink-0">
        {copied ? "Copied Clean Text!" : "Copy Clean Article"}
      </Button>
    </div>
  );
}