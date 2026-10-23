"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function publishToWordPress(articleId: string) {
  const supabase = createClient();

  // 1. Fetch article and project details
  const { data: article, error: articleError } = await supabase
    .from("articles")
    .select(`
      id, title, content, seo_title, meta_description, slug,
      projects (website_id)
    `)
    .eq("id", articleId)
    .single();

  if (articleError || !article) return { error: "Article not found." };

  const project = Array.isArray(article.projects) ? article.projects[0] : article.projects;
  if (!project || !project.website_id) return { error: "No website linked to this project." };

  // 2. Fetch the WordPress connection details
  const { data: connection } = await supabase
    .from("website_connections")
    .select("base_url, username, app_password")
    .eq("website_id", project.website_id)
    .single();

  if (!connection) return { error: "WordPress connection not found. Please configure it in Settings." };

  // 3. Create a publishing job record
  const { data: job, error: jobError } = await supabase
    .from("publishing_jobs")
    .insert({
      article_id: article.id,
      website_id: project.website_id,
      status: "processing",
    })
    .select("id")
    .single();

  if (jobError) return { error: "Failed to create publishing job." };

  try {
    // 4. Send to WordPress
    const wpUrl = `${connection.base_url}/wp-json/wp/v2/posts`;
    const auth = Buffer.from(`${connection.username}:${connection.app_password}`).toString('base64');

    const response = await fetch(wpUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: article.seo_title || article.title,
        content: article.content,
        slug: article.slug,
        status: "publish", // Or "draft" if you want to review it in WP first
        excerpt: article.meta_description,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`WordPress API Error: ${response.status} ${errorText}`);
    }

    const wpData = await response.json();

    // 5. Update job as successful
    await supabase
      .from("publishing_jobs")
      .update({
        status: "success",
        external_post_id: wpData.id.toString(),
        external_url: wpData.link,
      })
      .eq("id", job.id);

    // 6. Update article status to PUBLISHED
    await supabase
      .from("articles")
      .update({ status: "PUBLISHED" })
      .eq("id", articleId);

    revalidatePath(`/seo/${articleId}`);
    return { success: true, url: wpData.link };

  } catch (err: any) {
    console.error("Publishing Error:", err);
    
    // Update job as failed
    await supabase
      .from("publishing_jobs")
      .update({
        status: "failed",
        error_log: err.message,
      })
      .eq("id", job.id);

    // Keep article status as EDITOR_REVIEW so they can try again
    await supabase.from("articles").update({ status: "EDITOR_REVIEW" }).eq("id", articleId);

    return { error: err.message || "Failed to publish to WordPress." };
  }
}