import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { GenerateDraftButton } from "@/components/seo/GenerateDraftButton";

export const metadata: Metadata = {
  title: "Article Workspace",
};

export default async function ArticleWorkspacePage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  // Fetch the article and its research session
  const { data: article, error } = await supabase
    .from("articles")
    .select(`
      id, title, content, status, created_at,
      research_sessions (
        primary_topic, target_audience, intent, tone
      )
    `)
    .eq("id", params.id)
    .single();

  if (error || !article) {
    notFound();
  }

  const session = Array.isArray(article.research_sessions) 
    ? article.research_sessions[0] 
    : article.research_sessions;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Article Workspace</h1>
          <span className={`pill ${
            article.status === 'DRAFT_READY' ? 'pill-success' : 
            article.status === 'FAILED' ? 'pill-danger' : 'pill-info'
          }`}>
            {article.status.replace(/_/g, ' ')}
          </span>
        </div>
        <p className="mt-1 text-sm text-ink-muted">
          Topic: {session?.primary_topic}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Article Content */}
        <div className="md:col-span-2 space-y-4">
          {article.status === 'PROPOSED' && (
            <div className="card text-center py-12">
              <h2 className="text-lg font-semibold">Ready to research?</h2>
              <p className="mt-2 text-sm text-ink-muted max-w-sm mx-auto">
                G1-Autopilot will use the research parameters to generate a high-quality article draft.
              </p>
              <div className="mt-6">
                <GenerateDraftButton articleId={article.id} />
              </div>
            </div>
          )}

          {article.status === 'DRAFTING' && (
            <div className="card text-center py-12 animate-pulse">
              <h2 className="text-lg font-semibold text-brand-600">Generating draft...</h2>
              <p className="mt-2 text-sm text-ink-muted">
                This usually takes 10-30 seconds. Please wait.
              </p>
            </div>
          )}

          {article.status === 'DRAFT_READY' && article.content && (
            <div className="card">
              <div className="prose prose-sm sm:prose-base max-w-none">
                {/* Safely rendering plain text for now. We will add a markdown parser in Phase 7. */}
                <pre className="whitespace-pre-wrap font-sans text-sm text-ink">
                  {article.content}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Research Parameters */}
        <div className="space-y-4">
          <div className="card bg-surface-muted">
            <h3 className="font-medium text-sm text-ink mb-3">Research Parameters</h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-ink-subtle">Audience</dt>
                <dd className="font-medium text-ink">{session?.target_audience || "Not specified"}</dd>
              </div>
              <div>
                <dt className="text-ink-subtle">Intent</dt>
                <dd className="font-medium text-ink">{session?.intent || "Auto-detected"}</dd>
              </div>
              <div>
                <dt className="text-ink-subtle">Tone</dt>
                <dd className="font-medium text-ink">{session?.tone || "Professional"}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}