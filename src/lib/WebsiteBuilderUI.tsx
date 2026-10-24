"use client";

import { useState } from "react";
import { createManualWebsite, generateAIWebsite } from "@/lib/website-builder-actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const AI_PROMPTS = [
  "A premium home décor magazine with forest green colors and elegant typography.",
  "A modern tech blog focused on AI, startups, and software reviews.",
  "A cozy personal lifestyle blog about travel, food, and minimalism.",
  "An agriculture publication for goat farming and livestock management."
];

export function WebsiteBuilderUI() {
  const [mode, setMode] = useState<"manual" | "ai">("ai");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    
    const action = mode === "manual" ? createManualWebsite : generateAIWebsite;
    const result = await action(formData);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-ink mb-3">Create a New Website</h1>
        <p className="text-ink-muted max-w-lg mx-auto">
          Launch a premium, SEO-ready blog in seconds.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-surface-muted rounded-lg p-1 border border-surface-border">
          <button
            onClick={() => setMode("ai")}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === "ai" ? "bg-surface text-brand-700 shadow-sm" : "text-ink-muted hover:text-ink"
            }`}
          >
            ✨ Generate with AI
          </button>
          <button
            onClick={() => setMode("manual")}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === "manual" ? "bg-surface text-brand-700 shadow-sm" : "text-ink-muted hover:text-ink"
            }`}
          >
            ✍️ Manual Setup
          </button>
        </div>
      </div>

      <div className="card space-y-6 shadow-lg border-brand-100">
        {error && <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}

        <form action={handleSubmit} className="space-y-5">
          
          {/* AI MODE FORM */}
          {mode === "ai" && (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-ink">Describe your website</label>
                <textarea
                  name="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  placeholder="e.g., A beautiful home decor magazine with a warm ivory background and forest green accents..."
                  className="w-full rounded-md border border-surface-border px-3 py-3 text-sm bg-surface focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  required
                />
                
                {/* Prompt Suggestions */}
                <div className="mt-3">
                  <p className="text-xs font-medium text-ink-subtle mb-2">Need inspiration? Try one of these:</p>
                  <div className="flex flex-col gap-2">
                    {AI_PROMPTS.map((idea) => (
                      <button
                        key={idea}
                        type="button"
                        onClick={() => setPrompt(idea)}
                        className="text-left text-xs bg-surface-muted hover:bg-brand-50 text-ink-muted hover:text-brand-700 px-3 py-2 rounded-md border border-surface-border transition-colors"
                      >
                        "{idea}"
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* MANUAL MODE FORM */}
          {mode === "manual" && (
            <>
              <Input
                label="Website Title"
                name="title"
                placeholder="e.g., The Goat Farming Expert"
                required
              />
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">Description (Optional)</label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="A short description of your website..."
                  className="w-full rounded-md border border-surface-border px-3 py-2 text-sm bg-surface focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </>
          )}

          {/* Common Field: URL Slug */}
          <div className="pt-2 border-t border-surface-border">
            <Input
              label="Website URL"
              name="slug"
              placeholder="e.g., my-new-blog"
              required
            />
            <p className="mt-1 text-xs text-ink-subtle">
              Your site will be live at: <strong>g1-autopilot-ai.vercel.app/blog/your-slug</strong>
            </p>
          </div>

          <div className="pt-4">
            <Button type="submit" loading={loading} className="w-full h-12 text-base">
              {mode === "ai" ? "Generate Website with AI" : "Create Website Manually"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}