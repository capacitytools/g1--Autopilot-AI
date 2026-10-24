"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/lib/auth/organization";
import { getAIProvider } from "@/lib/ai/provider";
import { redirect } from "next/navigation";
import { z } from "zod";

const baseSchema = z.object({
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "URL must contain only lowercase letters, numbers, and hyphens."),
});

const manualSchema = baseSchema.extend({
  title: z.string().min(2, "Title is required."),
  description: z.string().optional(),
});

const aiSchema = baseSchema.extend({
  prompt: z.string().min(10, "Please describe your website in a few words."),
});

// Helper to create the DB record
async function createProjectRecord(
  orgId: string, 
  slug: string, 
  title: string, 
  description: string, 
  theme: string = "default"
) {
  const supabase = createClient();

  const { data: existingSlug } = await supabase
    .from("projects")
    .select("id")
    .eq("blog_slug", slug)
    .maybeSingle();

  if (existingSlug) return { error: "That blog URL is already taken." };

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      organization_id: orgId,
      name: title,
      description: description,
      blog_slug: slug,
      blog_title: title,
      blog_description: description,
      theme: theme,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  
  redirect(`/blogs/${project.id}`);
}

// 1. MANUAL CREATION
export async function createManualWebsite(formData: FormData) {
  const supabase = createClient();
  const org = await getCurrentOrganization();

  const rawData = {
    title: formData.get("title") as string,
    slug: (formData.get("slug") as string).toLowerCase().trim(),
    description: formData.get("description") as string || "",
  };

  const result = manualSchema.safeParse(rawData);
  if (!result.success) return { error: "Invalid input. Please check the fields." };

  // Add || "" to prevent TypeScript undefined errors
  return createProjectRecord(
    org.id, 
    result.data.slug, 
    result.data.title, 
    result.data.description || ""
  );
}

// 2. AI GENERATION
export async function generateAIWebsite(formData: FormData) {
  const supabase = createClient();
  const org = await getCurrentOrganization();
  const ai = getAIProvider();

  const rawData = {
    slug: (formData.get("slug") as string).toLowerCase().trim(),
    prompt: formData.get("prompt") as string,
  };

  const result = aiSchema.safeParse(rawData);
  if (!result.success) return { error: "Invalid input. Please check the fields." };

  let blogTitle = "My New Website";
  let blogDescription = result.data.prompt;
  let theme = "default";

  if (ai) {
    try {
      const systemPrompt = `You are an expert web designer. Based on the user's request, generate a JSON object with:
      {
        "title": "A short, catchy brand name (2-4 words)",
        "description": "A 1-sentence SEO description",
        "theme": "default" | "magazine" | "classic"
      }
      Only return valid JSON. Do not include markdown formatting.`;
      
      const response = await ai.generateText(result.data.prompt, systemPrompt);
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.title) blogTitle = parsed.title;
        if (parsed.description) blogDescription = parsed.description;
        if (parsed.theme) theme = parsed.theme;
      }
    } catch (err) {
      console.warn("AI generation failed, using defaults.", err);
    }
  }

  return createProjectRecord(
    org.id, 
    result.data.slug, 
    blogTitle, 
    blogDescription, 
    theme
  );
}