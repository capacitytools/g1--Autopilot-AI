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

/**
 * TEMPORARY AUTH ADAPTER
 * 
 * This file isolates all authentication logic. 
 * Currently, it uses Supabase Auth.
 * When G1-ID ships its downstream API, we will replace the 
 * implementations inside these functions to call G1-ID instead.
 * The rest of the application will not need to change.
 */

/**
 * Gets the currently logged-in user.
 * Returns null if no user is logged in.
 * Cached per request so multiple components can call it safely.
 */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const supabase = createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return null;
  }

  // Fetch the user's profile data
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("username, display_name, avatar_url")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    // If the auth user exists but the profile doesn't, 
    // something went wrong with the database trigger during signup.
    // We treat this as not logged in for safety.
    return null;
  }

  return {
    id: user.id,
    email: user.email!,
    username: profile.username,
    displayName: profile.display_name,
    avatarUrl: profile.avatar_url,
  };
});

/**
 * Requires a logged-in user.
 * If no user is logged in, redirects to the login page.
 * Used in protected pages (e.g. Dashboard).
 */
export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }
  
  return user;
}