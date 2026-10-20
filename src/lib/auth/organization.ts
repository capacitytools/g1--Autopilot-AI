import { createClient } from "@/lib/supabase/server";
import { cache } from "react";
import { getCurrentUser } from "./adapter";

/**
 * Gets the primary organization for the current user.
 * Because we create a personal workspace on signup, every user has at least one.
 */
export const getCurrentOrganization = cache(async () => {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const supabase = createClient();
  const { data, error } = await supabase
    .from("organization_members")
    .select("organization_id, role, organizations(name, slug)")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (error || !data) {
    throw new Error("Organization not found");
  }

  return {
    id: data.organization_id,
    role: data.role,
    name: (data.organizations as any).name,
    slug: (data.organizations as any).slug,
  };
});