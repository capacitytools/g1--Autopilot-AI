"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/lib/auth/organization";
import { revalidatePath } from "next/cache";

export async function updateBlogTheme(projectId: string, theme: string) {
  const supabase = createClient();
  const org = await getCurrentOrganization();

  const { error } = await supabase
    .from("projects")
    .update({ theme })
    .eq("id", projectId)
    .eq("organization_id", org.id);

  if (error) return { error: error.message };

  revalidatePath(`/blogs/${projectId}`);
  return { success: true };
}

export async function deleteArticle(articleId: string, projectId: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("articles")
    .delete()
    .eq("id", articleId);

  if (error) return { error: error.message };

  revalidatePath(`/blogs/${projectId}`);
  return { success: true };
}