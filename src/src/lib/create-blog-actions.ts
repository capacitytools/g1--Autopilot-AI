"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/lib/auth/organization";
import { redirect } from "next/navigation";
import { z } from "zod";

const blogSetupSchema = z.object({
  blogTitle: z.string().min(2, "Blog title is required."),
  blogSlug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens."),
  blogDescription: z.string().optional(),
});

export async function createNewBlog(formData: FormData) {
  const supabase = createClient();
  const org = await getCurrentOrganization();

  const rawData = {
    blogTitle: formData.get("blogTitle") as string,
    blogSlug: (formData.get("blogSlug") as string).toLowerCase().trim(),
    blogDescription: formData.get("blogDescription") as string || undefined,
  };

  const result = blogSetupSchema.safeParse(rawData);
  if (!result.success) return { error: "Invalid input. Please check the fields." };

  // Check if the slug is already taken globally
  const { data: existingSlug } = await supabase
    .from("projects")
    .select("id")
    .eq("blog_slug", result.data.blogSlug)
    .maybeSingle();

  if (existingSlug) {
    return { error: "That blog URL is already taken. Please choose another." };
  }

  // 1. Create the Project
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      organization_id: org.id,
      name: result.data.blogTitle,
      description: result.data.blogDescription,
    })
    .select("id")
    .single();

  if (projectError) return { error: projectError.message };

  // 2. Update the project with the Blog details
  const { error: updateError } = await supabase
    .from("projects")
    .update({
      blog_slug: result.data.blogSlug,
      blog_title: result.data.blogTitle,
      blog_description: result.data.blogDescription,
    })
    .eq("id", project.id);

  if (updateError) return { error: updateError.message };

  // 3. Redirect the user to their new Blog Manager Dashboard
  redirect(`/blogs/${project.id}`);
}