"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/lib/auth/organization";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createWorkflowTemplate(formData: FormData) {
  const supabase = createClient();
  const org = await getCurrentOrganization();
  
  const name = formData.get("name") as string;

  const steps = [
    { action: "generate_draft", status: "pending" },
    { action: "analyze_seo", status: "pending" },
    { action: "publish_wordpress", status: "pending" }
  ];

  const { error } = await supabase.from("workflow_templates").insert({
    organization_id: org.id,
    name,
    description: "Automated SEO to Publish flow",
    steps
  });

  if (error) return { error: error.message };

  revalidatePath("/workflows");
  return { success: true };
}

export async function triggerWorkflowRun(templateId: string, formData: FormData) {
  const supabase = createClient();
  const org = await getCurrentOrganization();

  const topic = formData.get("topic") as string;
  const projectId = formData.get("projectId") as string;

  const { data: template } = await supabase
    .from("workflow_templates")
    .select("steps")
    .eq("id", templateId)
    .single();

  if (!template) return { error: "Template not found" };
  const steps = template.steps as any[];

  const { data: run, error: runError } = await supabase
    .from("workflow_runs")
    .insert({
      template_id: templateId,
      organization_id: org.id,
      status: "running",
      total_steps: steps.length,
      input_data: { topic, projectId }
    })
    .select("id")
    .single();

  if (runError) return { error: runError.message };

  // 1. Create the article
  const { data: article, error: articleError } = await supabase
    .from("articles")
    .insert({
      project_id: projectId,
      organization_id: org.id,
      title: topic,
      status: "PROPOSED"
    })
    .select("id")
    .single();

  if (articleError) return { error: articleError.message };

  // 2. Create the research session (This is what was missing!)
  const { error: sessionError } = await supabase
    .from("research_sessions")
    .insert({
      article_id: article.id,
      primary_topic: topic,
      target_audience: "General Audience", // Default for automation
      language: "en",
      intent: "INFORMATIONAL",
      tone: "Professional"
    });

  if (sessionError) return { error: sessionError.message };

  // 3. Update the run with the created article ID
  await supabase.from("workflow_runs").update({
    current_step: 1,
    output_data: { article_id: article.id }
  }).eq("id", run.id);

  redirect(`/seo/${article.id}`);
}