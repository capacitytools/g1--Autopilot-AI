"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/lib/auth/organization";
import { redirect } from "next/navigation";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const projectSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters."),
  domain: z.string().min(3, "Please enter a valid domain (e.g., example.com)"),
});

export type ProjectState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createProject(
  prevState: ProjectState,
  formData: FormData
): Promise<ProjectState> {
  const name = formData.get("name") as string;
  const domain = (formData.get("domain") as string).toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');

  const result = projectSchema.safeParse({ name, domain });

  if (!result.success) {
    return {
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  const supabase = createClient();
  const org = await getCurrentOrganization();

  // 1. Create or find the website
  let websiteId = null;
  const { data: existingWebsite } = await supabase
    .from("websites")
    .select("id")
    .eq("organization_id", org.id)
    .eq("domain", domain)
    .maybeSingle();

  if (existingWebsite) {
    websiteId = existingWebsite.id;
  } else {
    const { data: newWebsite, error: webError } = await supabase
      .from("websites")
      .insert({
        organization_id: org.id,
        domain,
        name: domain,
      })
      .select("id")
      .single();

    if (webError) return { error: webError.message };
    websiteId = newWebsite.id;
  }

  // 2. Create the project
  const { error: projError } = await supabase.from("projects").insert({
    organization_id: org.id,
    website_id: websiteId,
    name,
  });

  if (projError) {
    return { error: projError.message };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}