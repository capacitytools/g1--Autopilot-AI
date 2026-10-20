"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

// G1-ID mirror: We accept username instead of email
const loginSchema = z.object({
  username: z.string().min(1, "Username is required."),
  password: z.string().min(1, "Password is required."),
});

export type LoginState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const username = (formData.get("username") as string).toLowerCase().trim();
  const password = formData.get("password") as string;

  const result = loginSchema.safeParse({ username, password });

  if (!result.success) {
    return {
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  const supabase = createClient();

  // 1. Look up the user's email by their username.
  // Note: We must use the service_role key or a secure RPC function if RLS blocks this.
  // Since RLS is strict, we will use a safe Postgres function (RPC) to get the email.
  const { data: emailData, error: lookupError } = await supabase
    .rpc("get_email_by_username", { lookup_username: username })
    .single();

  if (lookupError || !emailData) {
    // Do not reveal if the username exists or not for security.
    return { error: "Invalid username or password." };
  }

  // 2. Log in using the email
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: emailData as string,
    password,
  });

  if (authError) {
    return { error: "Invalid username or password." };
  }

  // 3. Success
  redirect("/dashboard");
}