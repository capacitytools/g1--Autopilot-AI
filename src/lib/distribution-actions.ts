"use server";

import { createClient } from "@/lib/supabase/server";
import { getAIProvider } from "@/lib/ai/provider";
import { revalidatePath } from "next/cache";

export async function generateSocialPost(articleId: string, platform: 'pinterest' | 'facebook' | 'video_script') {
  const supabase = createClient();
  const ai = getAIProvider();

  if (!ai) return { error: "AI Provider is not configured." };

  // Fetch the article
  const { data: article } = await supabase
    .from("articles")
    .select("title, content, seo_title")
    .eq("id", articleId)
    .single();

  if (!article) return { error: "Article not found." };

  let systemPrompt = "";
  let userPrompt = "";

  if (platform === 'pinterest') {
    systemPrompt = `You are an expert Pinterest marketer. Generate a catchy Pin Title (max 100 chars) and a Pin Description (max 500 chars). Format the output as JSON: {"title": "...", "content": "..."}`;
    userPrompt = `Article Title: ${article.seo_title || article.title}\n\nArticle Content:\n${article.content}`;
  } else if (platform === 'facebook') {
    systemPrompt = `You are a Facebook engagement expert. Write a compelling Facebook post (max 300 words) that teases the article and drives clicks. Include 3 relevant hashtags. Return raw text, no JSON.`;
    userPrompt = `Article Title: ${article.seo_title || article.title}\n\nArticle Content:\n${article.content}`;
  } else {
    systemPrompt = `You are a TikTok/YouTube Shorts scriptwriter. Write a 45-second video script based on this article. Include visual cues in [brackets] and a strong hook. Return raw text.`;
    userPrompt = `Article Title: ${article.seo_title || article.title}\n\nArticle Content:\n${article.content}`;
  }

  try {
    const response = await ai.generateText(userPrompt, systemPrompt);
    
    let finalTitle = "";
    let finalContent = response.text;

    if (platform === 'pinterest') {
      try {
        const jsonString = response.text.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(jsonString);
        finalTitle = parsed.title;
        finalContent = parsed.content;
      } catch (e) {
        finalTitle = "New Pin";
      }
    } else {
      finalTitle = platform === 'facebook' ? "Facebook Post" : "Video Script";
    }

    const { data: newPost, error } = await supabase
      .from("social_posts")
      .insert({
        article_id: articleId,
        platform,
        title: finalTitle,
        content: finalContent,
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);

    revalidatePath(`/seo/${articleId}`);
    return { success: true, postId: newPost.id };

  } catch (err: any) {
    console.error("Social Generation Error:", err);
    return { error: err.message || "Failed to generate social post." };
  }
}