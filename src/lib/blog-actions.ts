"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/lib/auth/organization";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const blogSchema = z.object({
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens."),
  title: z.string().min(2, "Title is required."),
  description: z.string().max(200, "Description must be under 200 characters.").optional(),
});

export type BlogState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string[]>;
};

export async function saveBlogSettings(prevState: BlogState, formData: FormData): Promise<BlogState> {
  const rawData = {
    slug: (formData.get("slug") as string).toLowerCase().trim(),
    title: formData.get("title") as string,
    description: formData.get("description") as string || undefined,
  };

  const result = blogSchema.safeParse(rawData);

  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors };
  }

  const supabase = createClient();
  const org = await getCurrentOrganization();

  // Check if slug is taken by another org
  const { data: existingBlog } = await supabase
    .from("blogs")
    .select("id")
    .eq("slug", result.data.slug)
    .neq("organization_id", org.id)
    .maybeSingle();

  if (existingBlog) {
    return { fieldErrors: { slug: ["This blog URL is already taken."] } };
  }

  // Upsert the blog settings
  const { error } = await supabase
    .from("blogs")
    .upsert({
      organization_id: org.id,
      slug: result.data.slug,
      title: result.data.title,
      description: result.data.description,
    }, {
      onConflict: "organization_id"
    });

  if (error) return { error: error.message };

  revalidatePath("/settings");
  return { success: true };
}