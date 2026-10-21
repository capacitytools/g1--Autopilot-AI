"use server";

import { createClient } from "@/lib/supabase/server";
import { getAIProvider } from "@/lib/ai/provider";
import { revalidatePath } from "next/cache";

// 1. Generate the Prompt
export async function generateArticlePrompt(articleId: string) {
  const supabase = createClient();
  const ai = getAIProvider();

  if (!ai) {
    return { error: "AI Provider is not configured. Please add OPENROUTER_API_KEY to your environment variables." };
  }

  const { data: article, error: articleError } = await supabase
    .from("articles")
    .select(`
      id, title,
      research_sessions (primary_topic, target_audience, intent, tone)
    `)
    .eq("id", articleId)
    .single();

  if (articleError || !article) return { error: "Article not found." };

  const session = Array.isArray(article.research_sessions) ? article.research_sessions[0] : article.research_sessions;
  if (!session) return { error: "Research session not found." };

  await supabase.from("articles").update({ status: "DRAFTING" }).eq("id", articleId);

  const systemPrompt = `You are an expert SEO strategist. Your job is to write a highly detailed, comprehensive AI prompt that the user can copy and paste into a large language model (like ChatGPT or Claude) to generate a perfect article.
The prompt must include: 
- The specific target audience and reading level.
- The required tone and style.
- A detailed outline (H1, H2s, and H3s).
- Instructions to include practical examples.
- A strict instruction to avoid repetitive AI phrases.
Do NOT write the article. Just write the prompt.`;

  const userPrompt = `
Topic: ${session.primary_topic}
Target Audience: ${session.target_audience}
Search Intent: ${session.intent || "Informational"}
Tone: ${session.tone || "Professional"}
  `;

  try {
    const response = await ai.generateText(userPrompt, systemPrompt);

    // We store the generated prompt in the content field temporarily
    await supabase.from("articles").update({
      content: response.text,
      status: "BRIEF_READY"
    }).eq("id", articleId);

    revalidatePath(`/seo/${articleId}`);
    return { success: true };
  } catch (err: any) {
    console.error("AI Generation Error:", err);
    await supabase.from("articles").update({ status: "FAILED" }).eq("id", articleId);
    return { error: err.message || "An error occurred." };
  }
}

// 2. Save the pasted article
export async function saveManualArticle(articleId: string, content: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from("articles")
    .update({
      content,
      status: "DRAFT_READY"
    })
    .eq("id", articleId);

  if (error) return { error: error.message };

  revalidatePath(`/seo/${articleId}`);
  return { success: true };
}