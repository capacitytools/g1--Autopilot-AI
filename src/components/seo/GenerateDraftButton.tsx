"use client";

import { useState } from "react";
import { generateArticlePrompt, saveManualArticle } from "@/lib/article-actions";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export function GenerateDraftButton({ 
  articleId, 
  status, 
  existingContent 
}: { 
  articleId: string; 
  status: string;
  existingContent: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualText, setManualText] = useState("");
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  async function handleGeneratePrompt() {
    setLoading(true);
    setError(null);
    const result = await generateArticlePrompt(articleId);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.refresh();
    }
  }

  async function handleSaveArticle() {
    if (!manualText.trim()) return;
    setSaving(true);
    setError(null);
    const result = await saveManualArticle(articleId, manualText);
    if (result.error) {
      setError(result.error);
      setSaving(false);
    } else {
      router.refresh();
    }
  }

  function copyToClipboard() {
    if (existingContent) {
      navigator.clipboard.writeText(existingContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  // State 1: PROPOSED (Start)
  if (status === 'PROPOSED') {
    return (
      <div className="text-center py-8">
        <h2 className="text-lg font-semibold">Ready to research?</h2>
        <p className="mt-2 text-sm text-ink-muted max-w-sm mx-auto mb-6">
          G1-Autopilot will generate a highly detailed AI prompt based on your parameters.
        </p>
        <Button onClick={handleGeneratePrompt} loading={loading}>
          Generate AI Prompt
        </Button>
        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  // State 2: DRAFTING (Loading)
  if (status === 'DRAFTING') {
    return (
      <div className="card text-center py-12 animate-pulse">
        <h2 className="text-lg font-semibold text-brand-600">Generating prompt...</h2>
        <p className="mt-2 text-sm text-ink-muted">This takes 5-10 seconds.</p>
      </div>
    );
  }

  // State 3: BRIEF_READY (Prompt generated, waiting for user)
  // If there is no content, something went wrong, so we show the retry button.
  if (status === 'BRIEF_READY' && !existingContent) {
    return (
      <div className="text-center py-8 card bg-yellow-50 border-yellow-200">
        <h2 className="text-lg font-semibold text-yellow-800">Prompt generation incomplete</h2>
        <p className="mt-2 text-sm text-yellow-700 mb-6">
          The prompt was not saved correctly. Please click below to try again.
        </p>
        <Button onClick={handleGeneratePrompt} loading={loading}>
          Retry Prompt Generation
        </Button>
      </div>
    );
  }

  if (status === 'BRIEF_READY' && existingContent) {
    return (
      <div className="space-y-6">
        <div className="card border-brand-200 bg-brand-50">
          <h2 className="text-lg font-semibold text-brand-800 mb-2">Step 1: Copy this Prompt</h2>
          <p className="text-sm text-brand-700 mb-4">
            Paste this into ChatGPT, Claude, or DeepSeek to generate your article.
          </p>
          <div className="bg-white p-4 rounded border border-brand-100 text-sm text-ink whitespace-pre-wrap max-h-64 overflow-y-auto mb-4">
            {existingContent}
          </div>
          <Button onClick={copyToClipboard} variant="secondary" className="w-full">
            {copied ? "Copied!" : "Copy to Clipboard"}
          </Button>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-2">Step 2: Paste the generated article</h2>
          <p className="text-sm text-ink-muted mb-4">
            Once the AI generates the article, paste the full text below to save it.
          </p>
          <textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            className="w-full h-48 p-3 border border-surface-border rounded-md text-sm mb-4"
            placeholder="Paste article here..."
          />
          <Button onClick={handleSaveArticle} loading={saving} className="w-full">
            Save Article Draft
          </Button>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
      </div>
    );
  }

  // State 4: DRAFT_READY or beyond (Article saved, we don't show the prompt anymore)
  return null;
}