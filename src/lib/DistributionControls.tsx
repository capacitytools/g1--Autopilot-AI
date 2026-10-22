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
  const router = useRouter();

  async function handleGenerate(platform: 'pinterest' | 'facebook' | 'video_script') {
    setLoading(platform);
    setError(null);
    const result = await generateSocialPost(articleId, platform);
    if (result.error) setError(result.error);
    else router.refresh();
    setLoading(null);
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Content Distribution</h2>
      </div>
      
      {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <Button 
          onClick={() => handleGenerate('pinterest')} 
          loading={loading === 'pinterest'}
          variant="secondary"
        >
          Generate Pinterest Pin
        </Button>
        <Button 
          onClick={() => handleGenerate('facebook')} 
          loading={loading === 'facebook'}
          variant="secondary"
        >
          Generate Facebook Post
        </Button>
        <Button 
          onClick={() => handleGenerate('video_script')} 
          loading={loading === 'video_script'}
          variant="secondary"
        >
          Generate Video Script
        </Button>
      </div>

      {socialPosts.length > 0 && (
        <div className="mt-4 space-y-2">
          {socialPosts.map((post) => (
            <Accordion key={post.id} title={`${post.platform.replace('_', ' ').toUpperCase()} - ${post.title || 'Generated Content'}`}>
              <div className="space-y-2">
                {post.title && post.title !== "Pinterest Pin" && <p><strong>Title:</strong> {post.title}</p>}
                <div className="bg-surface-muted p-3 rounded text-sm whitespace-pre-wrap">
                  {post.content}
                </div>
              </div>
            </Accordion>
          ))}
        </div>
      )}
    </div>
  );
}