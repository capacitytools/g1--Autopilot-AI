"use server";

import { createClient } from "@/lib/supabase/server";
import { getAIProvider } from "@/lib/ai/provider";
import { revalidatePath } from "next/cache";

export async function generateSocialPost(articleId: string, platform: 'pinterest' | 'facebook' | 'twitter' | 'video_script') {
  const supabase = createClient();
  const ai = getAIProvider();

  if (!ai) return { error: "AI Provider is not configured." };

  const { data: article } = await supabase
    .from("articles")
    .select("title, content, seo_title")
    .eq("id", articleId)
    .single();

  if (!article) return { error: "Article not found." };

  let systemPrompt = "";
  let userPrompt = `Article Title: ${article.seo_title || article.title}\n\nArticle Content:\n${article.content}`;

  if (platform === 'pinterest') {
    systemPrompt = `You are an expert Pinterest marketer. Read the article and generate a Pin Title (max 100 chars) and a Pin Description (max 500 chars). 
Format your response exactly like this:
TITLE: [Your catchy title]
DESCRIPTION: [Your SEO optimized description with emojis]`;
  } else if (platform === 'facebook') {
    systemPrompt = `You are a Facebook engagement expert. Write a compelling Facebook post (max 300 words) that teases the article and drives clicks. Include 3 relevant hashtags.`;
  } else if (platform === 'twitter') {
    systemPrompt = `You are a Twitter/X viral expert. Write a short, punchy thread (max 280 characters per tweet, 3-4 tweets) based on this article. Include a hook and a call to action.`;
  } else {
    systemPrompt = `You are a TikTok/YouTube Shorts scriptwriter. Write a 45-second video script based on this article. Include visual cues in [brackets] and a strong hook.`;
  }

  try {
    const response = await ai.generateText(userPrompt, systemPrompt);
    
    let finalTitle = "";
    let finalContent = response.text;

    if (platform === 'pinterest') {
      const titleMatch = response.text.match(/TITLE:\s*(.*)/i);
      const descMatch = response.text.match(/DESCRIPTION:\s*([\s\S]*)/i);

      if (titleMatch && titleMatch[1]) {
        finalTitle = titleMatch[1].trim();
      } else {
        finalTitle = "Pinterest Pin";
      }

      if (descMatch && descMatch[1]) {
        finalContent = descMatch[1].trim();
      }
    } else if (platform === 'twitter') {
      finalTitle = "Twitter/X Thread";
    } else {
      finalTitle = platform === 'facebook' ? "Facebook Post" : "Video Script";
    }

    const { error } = await supabase
      .from("social_posts")
      .insert({
        article_id: articleId,
        platform,
        title: finalTitle,
        content: finalContent,
      });

    if (error) throw new Error(error.message);

    revalidatePath(`/seo/${articleId}`);
    return { success: true };

  } catch (err: any) {
    console.error("Social Generation Error:", err);
    return { error: err.message || "Failed to generate social post." };
  }
}

export async function deleteSocialPost(postId: string) {
  const supabase = createClient();

  // Delete the post. RLS ensures the user can only delete posts 
  // belonging to their own organization.
  const { error } = await supabase
    .from("social_posts")
    .delete()
    .eq("id", postId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/seo/[id]", "page");
  return { success: true };
}