"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function trackBlogView(articleId: string, projectId: string) {
  const supabase = createClient();
  const headersList = headers();
  
  // Detect device from User-Agent
  const userAgent = headersList.get("user-agent") || "";
  let device = "Desktop";
  if (/mobile/i.test(userAgent)) device = "Mobile";
  if (/tablet/i.test(userAgent)) device = "Tablet";

  // Detect country (Vercel provides this header on the edge)
  const country = headersList.get("x-vercel-ip-country") || "Unknown";

  // Detect source (Referer header)
  const referer = headersList.get("referer") || "";
  let source = "Direct";
  if (referer.includes("google")) source = "Google";
  else if (referer.includes("pinterest")) source = "Pinterest";
  else if (referer.includes("facebook")) source = "Facebook";
  else if (referer && !referer.includes("g1-autopilot")) source = "Referral";

  // Insert the view (fire and forget)
  await supabase.from("blog_analytics").insert({
    article_id: articleId,
    project_id: projectId,
    device,
    country,
    source,
  });
}

export async function updateBlogPost(articleId: string, formData: FormData) {
  const supabase = createClient();
  
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const coverImageUrl = formData.get("coverImageUrl") as string;

  const { error } = await supabase
    .from("articles")
    .update({
      title,
      seo_title: title,
      content,
      cover_image_url: coverImageUrl || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", articleId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { success: true };
}