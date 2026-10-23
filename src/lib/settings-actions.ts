"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/lib/auth/organization";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const connectionSchema = z.object({
  websiteId: z.string().uuid(),
  baseUrl: z.string().url("Must be a valid URL (e.g., https://myblog.com)"),
  username: z.string().min(1, "Username is required"),
  appPassword: z.string().min(1, "Application Password is required"),
});

export type SettingsState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string[]>;
};

export async function saveWordPressConnection(
  prevState: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const rawData = {
    websiteId: formData.get("websiteId") as string,
    baseUrl: formData.get("baseUrl") as string,
    username: formData.get("username") as string,
    appPassword: formData.get("appPassword") as string,
  };

  const result = connectionSchema.safeParse(rawData);

  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors };
  }

  const supabase = createClient();
  const org = await getCurrentOrganization();

  const { data: website } = await supabase
    .from("websites")
    .select("id")
    .eq("id", result.data.websiteId)
    .eq("organization_id", org.id)
    .single();

  if (!website) {
    return { error: "Website not found or access denied." };
  }

  const { error } = await supabase
    .from("website_connections")
    .upsert({
      website_id: result.data.websiteId,
      provider: "wordpress",
      base_url: result.data.baseUrl.replace(/\/$/, ""),
      username: result.data.username,
      app_password: result.data.appPassword,
    }, {
      onConflict: "website_id, provider"
    });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings");
  return { success: true };
}