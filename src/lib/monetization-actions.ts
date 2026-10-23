"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/lib/auth/organization";
import { revalidatePath } from "next/cache";

export async function addAffiliateProduct(formData: FormData) {
  const supabase = createClient();
  const org = await getCurrentOrganization();

  const name = formData.get("name") as string;
  const platform = formData.get("platform") as string;
  const url = formData.get("url") as string;

  // 1. Create the product
  const { data: product, error: productError } = await supabase
    .from("affiliate_products")
    .insert({
      organization_id: org.id,
      name,
      platform,
    })
    .select("id")
    .single();

  if (productError) return { error: productError.message };

  // 2. Create the initial link
  const { error: linkError } = await supabase
    .from("affiliate_links")
    .insert({
      product_id: product.id,
      url,
    });

  if (linkError) return { error: linkError.message };

  revalidatePath("/monetization");
  return { success: true };
}