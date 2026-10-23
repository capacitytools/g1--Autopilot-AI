"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/lib/auth/organization";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createWorkflowTemplate(formData: FormData) {
  const supabase = createClient();
  const org = await getCurrentOrganization();
  
  const name = formData.get("name") as string;
  const projectId = formData.get("projectId") as string;

  // Define the steps for this workflow (Hardcoded for now to the standard flow)
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

  // 1. Fetch template to know how many steps
  const { data: template } = await supabase
    .from("workflow_templates")
    .select("steps")
    .eq("id", templateId)
    .single();

  if (!template) return { error: "Template not found" };
  const steps = template.steps as any[];

  // 2. Create the run record
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

  // 3. Kick off the first step asynchronously (simulated here, in a real app use a queue)
  // For this MVP, we'll just create the article immediately and redirect
  const { data: article } = await supabase
    .from("articles")
    .insert({
      project_id: projectId,
      organization_id: org.id,
      title: topic,
      status: "PROPOSED"
    })
    .select("id")
    .single();

  if (article) {
    // Update the run with the created article ID
    await supabase.from("workflow_runs").update({
      current_step: 1,
      output_data: { article_id: article.id }
    }).eq("id", run.id);

    // Redirect to the article workspace so the user can see the result
    redirect(`/seo/${article.id}`);
  }

  return { error: "Failed to create article from workflow" };
}