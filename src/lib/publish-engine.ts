"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function publishArticle(articleId: string) {
  const supabase = createClient();

  // 1. Fetch article and project details
  const { data: article, error: articleError } = await supabase
    .from("articles")
    .select(`
      id, title, content, seo_title, meta_description, slug,
      projects (id, website_id, blog_slug)
    `)
    .eq("id", articleId)
    .single();

  if (articleError || !article) return { error: "Article not found." };

  const project = Array.isArray(article.projects) ? article.projects[0] : article.projects;
  if (!project) return { error: "No project linked to this article." };

  // 2. Check if there is a WordPress connection
  let wpConnection = null;
  if (project.website_id) {
    const { data: connection } = await supabase
      .from("website_connections")
      .select("base_url, username, app_password")
      .eq("website_id", project.website_id)
      .maybeSingle();
    wpConnection = connection;
  }

  // 3. Create a publishing job record
  await supabase.from("publishing_jobs").insert({
    article_id: article.id,
    website_id: project.website_id || null,
    status: "processing",
  });

  // 4. If WordPress is connected, publish there
  if (wpConnection) {
    try {
      const wpUrl = `${wpConnection.base_url}/wp-json/wp/v2/posts`;
      const auth = Buffer.from(`${wpConnection.username}:${wpConnection.app_password}`).toString('base64');

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
          status: "publish",
          excerpt: article.meta_description,
        }),
      });

      if (!response.ok) {
        throw new Error(`WordPress API Error: ${response.status}`);
      }

      const wpData = await response.json();
      
      // Update article to PUBLISHED and set the public slug for our blog
      await supabase.from("articles").update({ 
        status: "PUBLISHED",
        public_slug: article.slug || article.id // Use the SEO slug for our public blog
      }).eq("id", articleId);

      revalidatePath(`/seo/${articleId}`);
      return { success: true, url: wpData.link };

    } catch (err: any) {
      console.error("WordPress Publishing Error:", err);
      await supabase.from("publishing_jobs").update({ status: "failed", error_log: err.message }).eq("article_id", articleId);
      return { error: err.message };
    }
  } 

  // 5. If NO WordPress is connected, publish to the G1 Public Blog
  else {
    try {
      // Update the article status to PUBLISHED and set the public slug
      const { error: updateError } = await supabase
        .from("articles")
        .update({ 
          status: "PUBLISHED",
          public_slug: article.slug || article.id 
        })
        .eq("id", articleId);

      if (updateError) throw new Error(updateError.message);

      await supabase.from("publishing_jobs").update({ status: "success" }).eq("article_id", articleId);

      revalidatePath(`/seo/${articleId}`);
      return { success: true, url: `/blog/${project.blog_slug}/${article.slug || article.id}` };

    } catch (err: any) {
      console.error("G1 Blog Publishing Error:", err);
      return { error: err.message || "Failed to publish to your public blog." };
    }
  }
}