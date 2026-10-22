"use client";

import { useState } from "react";
import { generateSocialPost } from "@/lib/distribution-actions";
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

  function handleCopy(post: SocialPost) {
    const textToCopy = post.title && post.title !== "Pinterest Pin" && post.title !== "Facebook Post" && post.title !== "Twitter/X Thread" && post.title !== "Video Script"
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
                <div className="bg-surface-muted p-3 rounded text-sm whitespace-pre-wrap">
                  {post.content}
                </div>
                <Button 
                  onClick={() => handleCopy(post)} 
                  variant="primary" 
                  size="sm"
                  className="w-full"
                >
                  {copiedId === post.id ? "Copied!" : "Copy to Clipboard"}
                </Button>
              </div>
            </Accordion>
          ))}
        </div>
      )}
    </div>
  );
}