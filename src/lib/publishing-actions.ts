"use server";

import { createClient } from "@/lib/supabase/server";
import { getAIProvider } from "@/lib/ai/provider";
import { revalidatePath } from "next/cache";

// 1. Analyze the article for SEO
export async function analyzeArticleSEO(articleId: string) {
  const supabase = createClient();
  const ai = getAIProvider();

  if (!ai) return { error: "AI Provider is not configured." };

  // Fetch the article
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
    const response = await ai.generateText(userPrompt, systemPrompt);
    
    // Clean up potential markdown code blocks from the AI response
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
    await supabase.from("articles").update({ status: "NEEDS_REVISION" }).eq("id", articleId);
    return { error: "Failed to parse AI SEO response. Please try again." };
  }
}

// 2. Publish to WordPress
export async function publishToWordPress(articleId: string) {
  const supabase = createClient();

  // Fetch article and connection details
  const { data: article, error: articleError } = await supabase
    .from("articles")
    .select(`
      id, title, content, seo_title, meta_description, slug,
      projects (website_id)
    `)
    .eq("id", articleId)
    .single();

  if (articleError || !article) return { error: "Article not found." };

  const project = Array.isArray(article.projects) ? article.projects[0] : article.projects;
  if (!project || !project.website_id) return { error: "No website linked to this project." };

  const { data: connection } = await supabase
    .from("website_connections")
    .select("base_url, username, app_password")
    .eq("website_id", project.website_id)
    .single();

  if (!connection) return { error: "WordPress connection not found. Please configure it in Settings." };

  await supabase.from("articles").update({ status: "PUBLISHING" }).eq("id", articleId);

  // Call the WordPress REST API
  try {
    const wpUrl = `${connection.base_url}/wp-json/wp/v2/posts`;
    const auth = Buffer.from(`${connection.username}:${connection.app_password}`).toString('base64');

    const response = await fetch(wpUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: article.seo_title || article.title,
        content: article.content,
        slug: article.slug,
        status: "publish", // Or "draft" if you want to review it in WP first
        excerpt: article.meta_description,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`WordPress API Error: ${response.status} ${errorText}`);
    }

    await supabase.from("articles").update({ status: "PUBLISHED" }).eq("id", articleId);
    revalidatePath(`/seo/${articleId}`);
    return { success: true };

  } catch (err: any) {
    console.error("Publishing Error:", err);
    await supabase.from("articles").update({ status: "FAILED" }).eq("id", articleId);
    return { error: err.message || "Failed to publish to WordPress." };
  }
}