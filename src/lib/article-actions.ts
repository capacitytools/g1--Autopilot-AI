"use server";

import { createClient } from "@/lib/supabase/server";
import { getAIProvider } from "@/lib/ai/provider";
import { revalidatePath } from "next/cache";

export async function generateArticleDraft(articleId: string) {
  const supabase = createClient();
  const ai = getAIProvider();

  if (!ai) {
    return { error: "AI Provider is not configured. Please add OPENROUTER_API_KEY to your environment variables." };
  }

  // 1. Fetch the research session and article data
  const { data: article, error: articleError } = await supabase
    .from("articles")
    .select(`
      id,
      title,
      research_sessions (
        primary_topic,
        target_audience,
        intent,
        tone
      )
    `)
    .eq("id", articleId)
    .single();

  if (articleError || !article) {
    return { error: "Article not found." };
  }

  // TypeScript handling for the nested relationship
  const session = Array.isArray(article.research_sessions) 
    ? article.research_sessions[0] 
    : article.research_sessions;

  if (!session) {
    return { error: "Research session not found." };
  }

  // 2. Update status to DRAFTING
  await supabase.from("articles").update({ status: "DRAFTING" }).eq("id", articleId);

  // 3. Build the Prompt (The 15-Year SEO Persona)
  const systemPrompt = `You are an experienced human-style SEO editor with 15 years of experience. 
Your objective is to produce content that helps readers accomplish a real goal.
You understand search intent, editorial judgment, and practical examples.
Do NOT use repetitive AI language (e.g., "In today's fast-paced world", "Let's dive in").
Write a high-quality draft based on the following parameters.`;

  const userPrompt = `
Topic: ${session.primary_topic}
Target Audience: ${session.target_audience}
Search Intent: ${session.intent || "Informational"}
Tone: ${session.tone || "Professional and helpful"}

Write a comprehensive, well-structured article draft. Include an engaging introduction, clear headings, practical examples, and a conclusion.
  `;

  try {
    // 4. Call the AI
    const response = await ai.generateText(userPrompt, systemPrompt);

    // 5. Save the draft and update status
    const { error: updateError } = await supabase
      .from("articles")
      .update({
        content: response.text,
        status: "DRAFT_READY"
      })
      .eq("id", articleId);

    if (updateError) {
      return { error: "Failed to save the generated article." };
    }

    revalidatePath(`/seo/${articleId}`);
    return { success: true };

  } catch (err: any) {
    console.error("AI Generation Error:", err);
    
    // Update status to FAILED so the user knows what happened
    await supabase.from("articles").update({ status: "FAILED" }).eq("id", articleId);
    
    return { error: err.message || "An error occurred while generating the article." };
  }
}
