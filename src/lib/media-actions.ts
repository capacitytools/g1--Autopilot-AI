"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/lib/auth/organization";
import { revalidatePath } from "next/cache";

export async function saveMediaAsset(data: {
  articleId: string;
  url: string;
  width: number;
  height: number;
  altText: string;
}) {
  const supabase = createClient();
  const org = await getCurrentOrganization();

  const { error } = await supabase
    .from("media_assets")
    .insert({
      organization_id: org.id,
      article_id: data.articleId,
      url: data.url,
      width: data.width,
      height: data.height,
      alt_text: data.altText,
      provider: "cloudinary",
    });

  if (error) return { error: error.message };

  revalidatePath(`/seo/${data.articleId}`);
  return { success: true };
}

export async function deleteMediaAsset(mediaId: string, articleId: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("media_assets")
    .delete()
    .eq("id", mediaId);

  if (error) return { error: error.message };

  revalidatePath(`/seo/${articleId}`);
  return { success: true };
}