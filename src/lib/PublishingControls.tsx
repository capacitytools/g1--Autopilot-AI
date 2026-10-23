"use client";

import { useState } from "react";
import { analyzeArticleSEO } from "@/lib/publishing-actions";
import { publishToWordPress } from "@/lib/publish-engine";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export function PublishingControls({ 
  articleId, 
  status,
  score,
  findings,
  seoTitle,
  metaDescription,
  slug
}: { 
  articleId: string; 
  status: string;
  score: number;
  findings: string[];
  seoTitle: string | null;
  metaDescription: string | null;
  slug: string | null;
}) {
  const [analyzing, setAnalyzing] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const router = useRouter();

  async function handleAnalyze() {
    setAnalyzing(true);
    setError(null);
    const result = await analyzeArticleSEO(articleId);
    
    if (result.error) {
      setError(result.error);
      setAnalyzing(false);
    } else {
      router.refresh();
    }
  }

  async function handlePublish() {
    setPublishing(true);
    setError(null);
    setPublishedUrl(null);

    const result = await publishToWordPress(articleId);

    if (result.error) {
      setError(result.error);
      setPublishing(false);
    } else {
      setPublishedUrl(result.url || "Published successfully");
      router.refresh();
    }
  }

  if (status === 'DRAFT_READY') {
    return (
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Step 3: SEO Analysis</h3>
        <p className="text-sm text-blue-800 mb-4">
          Run the SEO engine to generate metadata, a URL slug, and a quality score.
        </p>
        {error && <p className="text-sm text-red-500 bg-red-100 p-2 rounded mb-4">{error}</p>}
        <Button onClick={handleAnalyze} loading={analyzing}>Analyze SEO</Button>
      </div>
    );
  }

  if (status === 'SEO_REVIEW' || status === 'EDITOR_REVIEW' || status === 'PUBLISHED') {
    return (
      <div className="space-y-4">
        <div className="card border-brand-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">SEO Analysis</h3>
            <div className={`text-2xl font-bold ${score >= 80 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
              {score}/100
            </div>
          </div>
          
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-ink-subtle block">SEO Title</span>
              <span className="font-medium">{seoTitle || "Not generated"}</span>
            </div>
            <div>
              <span className="text-ink-subtle block">Meta Description</span>
              <span className="font-medium">{metaDescription || "Not generated"}</span>
            </div>
            <div>
              <span className="text-ink-subtle block">URL Slug</span>
              <span className="font-mono text-brand-700 bg-brand-50 px-2 py-1 rounded">{slug || "not-generated"}</span>
            </div>
          </div>

          {findings && findings.length > 0 && (
            <div className="mt-4 pt-4 border-t border-surface-border">
              <h4 className="font-medium text-sm mb-2">Editorial Findings</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm text-ink-muted">
                {findings.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>
          )}
        </div>

        {status !== 'PUBLISHED' ? (
          <div className="card bg-brand-50 border-brand-200">
            <h3 className="font-semibold text-brand-900 mb-2">Step 4: Publish</h3>
            <p className="text-sm text-brand-800 mb-4">
              Send this article directly to your connected WordPress site.
            </p>
            {error && <p className="text-sm text-red-500 bg-red-100 p-2 rounded mb-4">{error}</p>}
            {publishedUrl && (
              <p className="text-sm text-green-700 bg-green-100 p-2 rounded mb-4">
                Published! <a href={publishedUrl} target="_blank" rel="noreferrer" className="underline font-medium">View Post</a>
              </p>
            )}
            <Button onClick={handlePublish} loading={publishing} className="w-full">
              Publish to WordPress
            </Button>
          </div>
        ) : (
          <div className="card bg-green-50 border-green-200 text-center py-6">
            <h3 className="font-semibold text-green-900 text-lg">Published Successfully!</h3>
            <p className="text-sm text-green-800 mt-1">Your article is now live on WordPress.</p>
          </div>
        )}
      </div>
    );
  }

  return null;
}