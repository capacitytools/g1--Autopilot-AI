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

  const systemPrompt = `You are an expert SEO analyzer. Analyze the provided article and return a STRICT JSON object with the following keys:
- "seoTitle": A compelling title under 60 characters.
- "metaDescription": A summary under 160 characters with a call to action.
- "slug": A URL-friendly slug (lowercase, hyphens).
- "score": An integer from 0-100 based on readability, structure, and keyword usage.
- "findings": An array of strings highlighting areas for improvement (or praise).

Do NOT return markdown formatting like \`\`\`json. Return ONLY the raw JSON object.`;

  const userPrompt = `Title: ${article.title}\n\nContent:\n${article.content}`;

  try {
    // 1. Create a timeout promise (20 seconds max)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("AI Request Timed Out")), 20000);
    });

    // 2. Race the AI call against the timeout
    const response = await Promise.race([
      ai.generateText(userPrompt, systemPrompt),
      timeoutPromise
    ]);

    // 3. Parse the response
    const jsonString = response.text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(jsonString);

    const { error } = await supabase
      .from("articles")
      .update({
        seo_title: parsed.seoTitle,
        meta_description: parsed.metaDescription,
        slug: parsed.slug,
        seo_score: parsed.score,
        seo_findings: parsed.findings,
        status: "EDITOR_REVIEW"
      })
      .eq("id", articleId);

    if (error) throw new Error(error.message);

    revalidatePath(`/seo/${articleId}`);
    return { success: true };
  } catch (err: any) {
    console.error("SEO Analysis Error:", err);
    
    // If it failed, reset the status so they can try again
    await supabase.from("articles").update({ status: "DRAFT_READY" }).eq("id", articleId);
    
    // Return a helpful error message
    const errorMessage = err.message === "AI Request Timed Out" 
      ? "The AI model took too long to respond. Please try again." 
      : "Failed to parse AI SEO response. Please try again.";

    return { error: errorMessage };
  }
}