"use server";

import { createClient } from "@/lib/supabase/server";
import { getAIProvider } from "@/lib/ai/provider";
import { revalidatePath } from "next/cache";

export async function analyzeArticleSEO(articleId: string) {
  const supabase = createClient();
  const ai = getAIProvider();

  if (!ai) return { error: "AI Provider is not configured." };

  const { data: article } = await supabase
    .from("articles")
    .select("id, title, content")
    .eq("id", articleId)
    .single();

  if (!article || !article.content) return { error: "No article content to analyze." };

  await supabase.from("articles").update({ status: "SEO_REVIEW" }).eq("id", articleId);

  const systemPrompt = `You are an expert SEO analyzer. Read the article and output exactly 5 lines of text based on this template. Do not add any extra text, just the 5 lines.

TITLE: [A compelling title under 60 characters]
DESCRIPTION: [A summary under 160 characters with a call to action]
SLUG: [A URL-friendly slug with hyphens]
SCORE: [A number from 0 to 100]
FINDINGS: [One short sentence of feedback]`;

  const truncatedContent = article.content.substring(0, 3000);
  const userPrompt = `Title: ${article.title}\n\nContent:\n${truncatedContent}`;

  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("AI Request Timed Out")), 20000);
    });

    const response = await Promise.race([
      ai.generateText(userPrompt, systemPrompt),
      timeoutPromise
    ]);

    const text = response.text;

    // Parse the plain text response using Regex, with safe fallbacks
    const titleMatch = text.match(/TITLE:\s*(.*)/i);
    const descMatch = text.match(/DESCRIPTION:\s*(.*)/i);
    const slugMatch = text.match(/SLUG:\s*(.*)/i);
    const scoreMatch = text.match(/SCORE:\s*(\d+)/i);
    const findingsMatch = text.match(/FINDINGS:\s*(.*)/i);

    if (!titleMatch || !descMatch) {
      throw new Error("AI response format was incorrect.");
    }

    // Added ?. and || "" to prevent TypeScript "possibly undefined" errors
    const finalTitle = titleMatch[1]?.trim() || article.title;
    const finalDesc = descMatch[1]?.trim() || "Read this article for more details.";
    const finalSlug = slugMatch?.[1]?.trim() || article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const finalScore = scoreMatch?.[1] ? parseInt(scoreMatch[1]) : 75;
    const finalFindings = findingsMatch?.[1]?.trim() || "Article analyzed successfully.";

    const { error } = await supabase
      .from("articles")
      .update({
        seo_title: finalTitle,
        meta_description: finalDesc,
        slug: finalSlug,
        seo_score: finalScore,
        seo_findings: [finalFindings],
        status: "EDITOR_REVIEW"
      })
      .eq("id", articleId);

    if (error) throw new Error(error.message);

    revalidatePath(`/seo/${articleId}`);
    return { success: true };
  } catch (err: any) {
    console.error("SEO Analysis Error:", err);
    
    await supabase.from("articles").update({ status: "DRAFT_READY" }).eq("id", articleId);
    
    const errorMessage = err.message === "AI Request Timed Out" 
      ? "The AI model took too long to respond. Please try again." 
      : "Failed to parse AI SEO response. Please try again.";

    return { error: errorMessage };
  }
}