import { createClient } from "@/lib/supabase/server";
import { cache } from "react";
import { getCurrentUser } from "./adapter";

export const getCurrentOrganization = cache(async () => {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const supabase = createClient();
  
  // 1. Try to find the organization
  const { data, error } = await supabase
    .from("organization_members")
    .select("organization_id, role, organizations(name, slug)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (data) {
    return {
      id: data.organization_id,
      role: data.role,
      name: (data.organizations as any)?.name || "My Workspace",
      slug: (data.organizations as any)?.slug || "workspace",
    };
  }

  // 2. SAFETY NET: If no organization exists, create one now.
  // Use a short random string for the slug to guarantee no conflicts.
  const fallbackSlug = `${user.username}-${Math.random().toString(36).substring(2, 7)}`;
  
  const { data: newOrg, error: orgError } = await supabase
    .from("organizations")
    .insert({
      name: `${user.displayName || user.username}'s Workspace`,
      slug: fallbackSlug,
    })
    .select("id, name, slug")
    .single();

  if (orgError || !newOrg) {
    console.error("Failed to create fallback org:", orgError);
    // If we STILL fail, we throw, but at least we logged the real database error.
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
    console.error("Failed to link fallback org:", memberError);
    throw new Error("Could not link fallback organization.");
  }

  return {
    id: newOrg.id,
    role: "owner",
    name: newOrg.name,
    slug: newOrg.slug,
  };
});