import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { GenerateDraftButton } from "@/components/seo/GenerateDraftButton";
import { PublishingControls } from "@/lib/PublishingControls";
import { Accordion } from "@/lib/Accordion";
import { DistributionControls } from "@/lib/DistributionControls";
import { ImageStudio } from "@/lib/ImageStudio";
import { CleanArticleCopy } from "@/lib/CleanArticleCopy";

export const metadata: Metadata = {
  title: "Article Workspace",
};

export default async function ArticleWorkspacePage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: article, error } = await supabase
    .from("articles")
    .select(`
      id, title, content, status, created_at,
      seo_title, meta_description, slug, seo_score, seo_findings,
      research_sessions (primary_topic, target_audience, intent, tone, created_at),
      social_posts (id, platform, title, content),
      media_assets (id, url, alt_text)
    `)
    .eq("id", params.id)
    .single();

  if (error || !article) notFound();

  const session = Array.isArray(article.research_sessions) 
    ? article.research_sessions[0] 
    : article.research_sessions;

  const socialPosts = Array.isArray(article.social_posts) ? article.social_posts : [];
  const mediaAssets = Array.isArray(article.media_assets) ? article.media_assets : [];

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
        <p className="mt-1 text-sm text-ink-muted">Topic: {session?.primary_topic}</p>
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
            <ImageStudio articleId={article.id} existingMedia={mediaAssets} />
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
              socialPosts={socialPosts} 
            />
          )}

          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Project History</h2>

            {session && (
              <Accordion title="1. Research Parameters" defaultOpen={false}>
                <ul className="space-y-2">
                  <li><strong>Primary Topic:</strong> {session.primary_topic}</li>
                  <li><strong>Target Audience:</strong> {session.target_audience}</li>
                  <li><strong>Intent:</strong> {session.intent || "Auto-detected"}</li>
                  <li><strong>Tone:</strong> {session.tone || "Professional"}</li>
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
}