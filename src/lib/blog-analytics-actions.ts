export async function updatePost(formData: FormData) {
  const supabase = createClient();
  
  const articleId = formData.get("articleId") as string;
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
    })
    .eq("id", articleId);

  if (error) return { error: error.message };

  revalidatePath(`/blogs/${formData.get("projectId")}`);
  return { success: true };
}