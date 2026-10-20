import { createClient } from "@/lib/supabase/server";
import { cache } from "react";
import { getCurrentUser } from "./adapter";

export const getCurrentOrganization = cache(async () => {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const supabase = createClient();
  
  // Try to find the organization
  const { data, error } = await supabase
    .from("organization_members")
    .select("organization_id, role, organizations(name, slug)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle(); // Use maybeSingle so it doesn't throw if empty

  if (data) {
    return {
      id: data.organization_id,
      role: data.role,
      name: (data.organizations as any).name,
      slug: (data.organizations as any).slug,
    };
  }

  // SAFETY NET: If no organization exists (e.g. manually created user), create one now.
  const { data: newOrg, error: orgError } = await supabase
    .from("organizations")
    .insert({
      name: `${user.displayName || user.username}'s Workspace`,
      slug: `${user.username}-workspace-fallback`,
    })
    .select("id, name, slug")
    .single();

  if (orgError || !newOrg) {
    throw new Error("Could not create a fallback organization.");
  }

  const { error: memberError } = await supabase
    .from("organization_members")
    .insert({
      organization_id: newOrg.id,
      user_id: user.id,
      role: "owner",
    });

  if (memberError) {
    throw new Error("Could not link fallback organization.");
  }

  return {
    id: newOrg.id,
    role: "owner",
    name: newOrg.name,
    slug: newOrg.slug,
  };
});