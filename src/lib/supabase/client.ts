import { createBrowserClient } from "@supabase/ssr";
import { getConfig } from "../config";

/**
 * Browser-side Supabase client.
 * Used in Client Components (e.g. interactive forms).
 */
export function createClient() {
  const config = getConfig();

  if (!config.supabase.url || !config.supabase.anonKey) {
    throw new Error("Supabase is not configured. Please add the environment variables.");
  }

  return createBrowserClient(
    config.supabase.url,
    config.supabase.anonKey,
  );
}