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
"use client";

import { useState } from "react";
import { generateSocialPost, deleteSocialPost } from "@/lib/distribution-actions";
import { Button } from "@/components/ui/Button";
import { Accordion } from "@/lib/Accordion";
import { useRouter } from "next/navigation";

type SocialPost = {
  id: string;
  platform: string;
  title: string | null;
  content: string;
};

export function DistributionControls({ 
  articleId, 
  socialPosts 
}: { 
  articleId: string; 
  socialPosts: SocialPost[];
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const router = useRouter();

  async function handleGenerate(platform: 'pinterest' | 'facebook' | 'twitter' | 'video_script') {
    setLoading(platform);
    setError(null);
    const result = await generateSocialPost(articleId, platform);
    if (result.error) setError(result.error);
    else router.refresh();
    setLoading(null);
  }

  async function handleDelete(postId: string) {
    // Add a browser confirmation
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    setDeleting(postId);
    setError(null);
    
    const result = await deleteSocialPost(postId);
    
    if (result.error) {
      setError(result.error);
      setDeleting(null); // Stop loading on error
    } else {
      router.refresh();
      // Note: router.refresh() will re-render the parent server component.
      // We don't setDeleting(null) here because the component might unmount.
    }
  }

  function handleCopy(post: SocialPost) {
    const textToCopy = post.title && !["Pinterest Pin", "Facebook Post", "Twitter/X Thread", "Video Script"].includes(post.title)
      ? `${post.title}\n\n${post.content}`
      : post.content;

    navigator.clipboard.writeText(textToCopy);
    setCopiedId(post.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Content Distribution</h2>
      </div>
      
      {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => handleGenerate('pinterest')} loading={loading === 'pinterest'} variant="secondary">
          Generate Pinterest
        </Button>
        <Button onClick={() => handleGenerate('facebook')} loading={loading === 'facebook'} variant="secondary">
          Generate Facebook
        </Button>
        <Button onClick={() => handleGenerate('twitter')} loading={loading === 'twitter'} variant="secondary">
          Generate Twitter/X
        </Button>
        <Button onClick={() => handleGenerate('video_script')} loading={loading === 'video_script'} variant="secondary">
          Generate Video Script
        </Button>
      </div>

      {socialPosts.length > 0 && (
        <div className="mt-4 space-y-2">
          {socialPosts.map((post) => (
            <Accordion key={post.id} title={`${post.platform.replace('_', ' ').toUpperCase()} - ${post.title || 'Generated Content'}`}>
              <div className="space-y-4">
                {post.title && !["Pinterest Pin", "Facebook Post", "Twitter/X Thread", "Video Script"].includes(post.title) && (
                  <p className="font-semibold text-brand-700">{post.title}</p>
                )}
                <div className="bg-surface-muted p-3 rounded text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">
                  {post.content}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleCopy(post)} 
                    variant="primary" 
                    size="sm"
                    className="flex-1"
                  >
                    {copiedId === post.id ? "Copied!" : "Copy to Clipboard"}
                  </Button>
                  <Button 
                    onClick={() => handleDelete(post.id)} 
                    variant="danger" 
                    size="sm"
                    loading={deleting === post.id}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Accordion>
          ))}
        </div>
      )}
    </div>
  );
}