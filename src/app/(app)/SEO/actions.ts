"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/lib/auth/organization";
import { redirect } from "next/navigation";
import { z } from "zod";

const seoInputSchema = z.object({
  projectId: z.string().uuid(),
  primaryTopic: z.string().min(3, "Topic must be at least 3 characters."),
  targetAudience: z.string().min(3, "Audience must be at least 3 characters."),
  language: z.string().default("en"),
  country: z.string().optional(),
  intent: z.string().optional(),
  tone: z.string().optional(),
});

export type SEOState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function startResearch(
  prevState: SEOState,
  formData: FormData
): Promise<SEOState> {
  const rawData = {
    projectId: formData.get("projectId") as string,
    primaryTopic: formData.get("primaryTopic") as string,
    targetAudience: formData.get("targetAudience") as string,
    language: formData.get("language") as string || "en",
    country: formData.get("country") as string || undefined,
    intent: formData.get("intent") as string || undefined,
    tone: formData.get("tone") as string || undefined,
  };

  const result = seoInputSchema.safeParse(rawData);

  if (!result.success) {
    return {
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  const { data: validData } = result;
  const supabase = createClient();
  const org = await getCurrentOrganization();

  // 1. Create the article in PROPOSED state
  const { data: article, error: articleError } = await supabase
    .from("articles")
    .insert({
      project_id: validData.projectId,
      organization_id: org.id,
      status: "PROPOSED",
      title: validData.primaryTopic, // Temporary title until AI generates one
    })
    .select("id")
    .single();

  if (articleError) {
    return { error: articleError.message };
  }

  // 2. Create the research session with the inputs
  const { error: sessionError } = await supabase
    .from("research_sessions")
    .insert({
      article_id: article.id,
      primary_topic: validData.primaryTopic,
      target_audience: validData.targetAudience,
      language: validData.language,
      country: validData.country,
      intent: validData.intent,
      tone: validData.tone,
    });

  if (sessionError) {
    // If this fails, we should ideally delete the article, but we'll leave it for now.
    return { error: sessionError.message };
  }

  // 3. Redirect to the new article workspace
  redirect(`/seo/${article.id}`);
}