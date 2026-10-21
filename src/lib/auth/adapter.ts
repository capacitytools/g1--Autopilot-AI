import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cache } from "react";

export type AuthUser = {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const supabase = createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("username, display_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle(); // Use maybeSingle instead of single

  if (profileError) {
    console.error("Profile error:", profileError);
  }

  // If the profile doesn't exist (e.g. manually created user),
  // we return a fallback username, or we can create it.
  // Since Step 1 handles this via SQL, we just fall back gracefully here.
  const username = profile?.username || user.email?.split('@')[0] || `user_${user.id.slice(0, 6)}`;
  const displayName = profile?.display_name || username;

  return {
    id: user.id,
    email: user.email!,
    username,
    displayName,
    avatarUrl: profile?.avatar_url || null,
  };
});

export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }
  
  return user;
}