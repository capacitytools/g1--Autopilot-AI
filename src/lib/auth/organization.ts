import { createClient } from "@/lib/supabase/server";
import { cache } from "react";
import { getCurrentUser } from "./adapter";

export const getCurrentOrganization = cache(async () => {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const supabase = createClient();
  
  // 1. Try to find the organization
  const { data: memberData, error: memberError } = await supabase
    .from("organization_members")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (memberError) {
    console.error("Error fetching membership:", memberError);
  }

  if (memberData) {
    // We found a membership. Now get the org details.
    const { data: orgData } = await supabase
      .from("organizations")
      .select("name, slug")
      .eq("id", memberData.organization_id)
      .single();
      
    return {
      id: memberData.organization_id,
      role: memberData.role,
      name: orgData?.name || "My Workspace",
      slug: orgData?.slug || "workspace",
    };
  }

  // 2. If no organization exists, create one
  console.log("No org found, creating one for user:", user.id);
  
  const fallbackSlug = `${user.username}-${Math.random().toString(36).substring(2, 6)}`;
  
  const { data: newOrg, error: orgError } = await supabase
    .from("organizations")
    .insert({
      name: `${user.displayName || user.username}'s Workspace`,
      slug: fallbackSlug,
    })
    .select("id, name, slug")
    .single();

  if (orgError) {
    console.error("Failed to create org:", orgError);
    throw new Error(`Failed to create org: ${orgError.message}`);
  }

  const { error: linkError } = await supabase
    .from("organization_members")
    .insert({
      organization_id: newOrg.id,
      user_id: user.id,
      role: "owner",
    });

  if (linkError) {
    console.error("Failed to link org:", linkError);
    throw new Error(`Failed to link org: ${linkError.message}`);
  }

  return {
    id: newOrg.id,
    role: "owner",
    name: newOrg.name,
    slug: newOrg.slug,
  };
});