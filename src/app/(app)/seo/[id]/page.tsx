import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { GenerateDraftButton } from "@/components/seo/GenerateDraftButton";

export const metadata: Metadata = {
  title: "Article Workspace",
};

export default async function ArticleWorkspacePage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: article, error } = await supabase
    .from("articles")
    .select(`
      id, title, content, status, created_at,
      research_sessions (primary_topic, target_audience, intent, tone)
    `)
    .eq("id", params.id)
    .single();

  if (error || !article) notFound();

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
            article.status === 'BRIEF_READY' ? 'pill-warning' : 
            article.status === 'FAILED' ? 'pill-danger' : 'pill-info'
          }`}>
            {article.status.replace(/_/g, ' ')}
          </span>
        </div>
        <p className="mt-1 text-sm text-ink-muted">Topic: {session?.primary_topic}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          
          <GenerateDraftButton 
            articleId={article.id} 
            status={article.status} 
            existingContent={article.content} 
          />

          {article.status === 'DRAFT_READY' && article.content && (
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Final Article Draft</h2>
              <div className="prose prose-sm sm:prose-base max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm text-ink">
                  {article.content}
                </pre>
              </div>
            </div>
          )}
        </div>

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