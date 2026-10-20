import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getConfig } from "../config";

/**
 * Server-side Supabase client.
 * Used in Server Components, Server Actions, and Route Handlers.
 * Must be created fresh for every request.
 */
export function createClient() {
  const cookieStore = cookies();
  const config = getConfig();

  if (!config.supabase.url || !config.supabase.anonKey) {
    throw new Error("Supabase is not configured. Please add the environment variables.");
  }

  return createServerClient(
    config.supabase.url,
    config.supabase.anonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // The `remove` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
}