"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/lib/auth/organization";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const postSchema = z.object({
  title: z.string().min(2, "Title is required"),
  content: z.string().min(10, "Content is required"),
  projectId: z.string().uuid(),
  categorySlug: z.string().optional(),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
});

export async function createNativeArticle(formData: FormData) {
  const supabase = createClient();
  const org = await getCurrentOrganization();

  const rawData = {
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    projectId: formData.get("projectId") as string,
    categorySlug: formData.get("categorySlug") as string,
    coverImageUrl: formData.get("coverImageUrl") as string,
    slug: (formData.get("title") as string).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  };

  const result = postSchema.safeParse(rawData);
  if (!result.success) return { error: "Validation failed. Please check the fields." };

  // Insert directly as PUBLISHED (or DRAFT if you prefer)
  const { data: article, error } = await supabase
    .from("articles")
    .insert({
      organization_id: org.id,
      project_id: result.data.projectId,
      title: result.data.title,
      content: result.data.content,
      status: "PUBLISHED", // Native posts go live immediately
      seo_title: result.data.title,
      public_slug: result.data.slug,
      category_slug: result.data.categorySlug || null,
      cover_image_url: result.data.coverImageUrl || null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  redirect("/dashboard");
}