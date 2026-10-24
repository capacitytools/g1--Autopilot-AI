"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function trackBlogView(articleId: string, projectId: string) {
  const supabase = createClient();
  const headersList = headers();
  
  const userAgent = headersList.get("user-agent") || "";
  let device = "Desktop";
  if (/mobile/i.test(userAgent)) device = "Mobile";
  if (/tablet/i.test(userAgent)) device = "Tablet";

  const country = headersList.get("x-vercel-ip-country") || "Unknown";
  const referer = headersList.get("referer") || "";
  let source = "Direct";
  if (referer.includes("google")) source = "Google";
  else if (referer.includes("pinterest")) source = "Pinterest";
  else if (referer.includes("facebook")) source = "Facebook";
  else if (referer && !referer.includes("g1-autopilot")) source = "Referral";

  await supabase.from("blog_analytics").insert({
    article_id: articleId,
    project_id: projectId,
    device,
    country,
    source,
  });
}

export async function updatePost(formData: FormData) {
  const supabase = createClient();
  
  const articleId = formData.get("articleId") as string;
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const coverImageUrl = formData.get("coverImageUrl") as string;
  const projectId = formData.get("projectId") as string;

  const { error } = await supabase
    .from("articles")
    .update({
      title,
      seo_title: title,
      content,
      cover_image_url: coverImageUrl || null,
    })
    .eq("id", articleId);

  if (error) return { error: error.message };

  revalidatePath(`/blogs/${projectId}`);
  return { success: true };
}