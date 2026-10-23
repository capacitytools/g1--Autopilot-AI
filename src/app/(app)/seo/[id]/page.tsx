import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { GenerateDraftButton } from "@/components/seo/GenerateDraftButton";
import { PublishingControls } from "@/lib/PublishingControls";
import { Accordion } from "@/lib/Accordion";
import { DistributionControls } from "@/lib/DistributionControls";
import { CleanArticleCopy } from "@/lib/CleanArticleCopy";

export const metadata: Metadata = {
  title: "Article Workspace",
};

export default async function ArticleWorkspacePage({ params }: { params: { id: string } }) {
  try {
    const supabase = createClient();

    // 1. Fetch the base article
    const { data: article, error: articleError } = await supabase
      .from("articles")
      .select(`
        id, title, content, status, created_at,
        seo_title, meta_description, slug, seo_score, seo_findings
      `)
      .eq("id", params.id)
      .single();

    if (articleError || !article) {
      console.error("Article fetch error:", articleError);
      notFound();
    }

    // 2. Fetch research session
    const { data: sessionData } = await supabase
      .from("research_sessions")
      .select("primary_topic, target_audience, intent, tone, created_at")
      .eq("article_id", params.id)
      .maybeSingle();

    // 3. Fetch social posts
    const { data: socialPosts } = await supabase
      .from("social_posts")
      .select("id, platform, title, content")
      .eq("article_id", params.id);

    // 4. Fetch media assets
    const { data: mediaAssets } = await supabase
      .from("media_assets")
      .select("id, url, alt_text")
      .eq("article_id", params.id);

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">Article Workspace</h1>
            <span className={`pill ${
              article.status === 'PUBLISHED' ? 'pill-success' : 
              article.status === 'EDITOR_REVIEW' ? 'pill-warning' : 
              article.status === 'FAILED' ? 'pill-danger' : 'pill-info'
            }`}>
              {article.status.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-muted">Topic: {sessionData?.primary_topic}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            
            <GenerateDraftButton 
              articleId={article.id} 
              status={article.status} 
              existingContent={article.content} 
            />

            {['DRAFT_READY', 'SEO_REVIEW', 'EDITOR_REVIEW', 'PUBLISHED'].includes(article.status) && article.content && (
              <CleanArticleCopy rawContent={article.content} />
            )}

            {['DRAFT_READY', 'SEO_REVIEW', 'EDITOR_REVIEW', 'PUBLISHED'].includes(article.status) && (
              <PublishingControls 
                articleId={article.id}
                status={article.status}
                score={article.seo_score || 0}
                findings={(article.seo_findings as string[]) || []}
                seoTitle={article.seo_title}
                metaDescription={article.meta_description}
                slug={article.slug}
              />
            )}

            {['EDITOR_REVIEW', 'PUBLISHED'].includes(article.status) && (
              <DistributionControls 
                articleId={article.id} 
                socialPosts={socialPosts || []} 
              />
            )}

            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">Project History</h2>

              {sessionData && (
                <Accordion title="1. Research Parameters" defaultOpen={false}>
                  <ul className="space-y-2">
                    <li><strong>Primary Topic:</strong> {sessionData.primary_topic}</li>
                    <li><strong>Target Audience:</strong> {sessionData.target_audience}</li>
                    <li><strong>Intent:</strong> {sessionData.intent || "Auto-detected"}</li>
                    <li><strong>Tone:</strong> {sessionData.tone || "Professional"}</li>
                  </ul>
                </Accordion>
              )}

              {article.content && (
                <Accordion title="2. Raw AI Draft">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-ink max-h-96 overflow-y-auto">
                    {article.content}
                  </pre>
                </Accordion>
              )}

              {article.seo_title && (
                <Accordion title="3. SEO Analysis Results">
                  <ul className="space-y-2">
                    <li><strong>SEO Title:</strong> {article.seo_title}</li>
                    <li><strong>Meta Description:</strong> {article.meta_description}</li>
                    <li><strong>Slug:</strong> {article.slug}</li>
                    <li><strong>Score:</strong> {article.seo_score}/100</li>
                  </ul>
                </Accordion>
              )}
            </div>

          </div>

          <div className="space-y-4">
            <div className="card bg-surface-muted">
              <h3 className="font-medium text-sm text-ink mb-3">Quick Actions</h3>
              <p className="text-sm text-ink-muted">
                Follow the steps on the left to generate, analyze, publish, and distribute your article.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (err: any) {
    // This will catch any server-side crash and show it on the screen
    return (
      <div className="p-8 text-red-500 bg-red-50 rounded-lg">
        <h2 className="font-bold text-lg">Page Crash Caught</h2>
        <p className="mt-2 text-sm">{err.message}</p>
        <pre className="mt-4 text-xs bg-white p-4 rounded text-left overflow-auto">
          {err.stack}
        </pre>
      </div>
    );
  }
}