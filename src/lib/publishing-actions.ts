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

  // Forceful JSON prompt
  const systemPrompt = `You are a machine that ONLY outputs valid JSON. Do not output any conversational text, markdown, or code blocks. Output exactly this JSON structure:
{
  "title": "A compelling SEO title under 60 chars",
  "description": "A meta description under 160 chars",
  "slug": "url-friendly-slug",
  "score": 85,
  "findings": ["Finding 1", "Finding 2"]
}`;

  const truncatedContent = article.content.substring(0, 3000);
  const userPrompt = `Analyze this article and output the JSON:\n\nTitle: ${article.title}\n\nContent:\n${truncatedContent}`;

  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("AI Request Timed Out")), 20000);
    });

    const response = await Promise.race([
      ai.generateText(userPrompt, systemPrompt),
      timeoutPromise
    ]);

    // Clean up potential markdown blocks just in case
    const jsonString = response.text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(jsonString);

    const { error } = await supabase
      .from("articles")
      .update({
        seo_title: parsed.title || article.title,
        meta_description: parsed.description || "Read this article for more details.",
        slug: parsed.slug || article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        seo_score: parsed.score || 75,
        seo_findings: parsed.findings || ["Article analyzed successfully."],
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