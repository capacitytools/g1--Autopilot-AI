"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

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

  // 1. Look up the email. The RPC now returns a plain string, not an object.
  const { data: email, error: lookupError } = await supabase
    .rpc("get_email_by_username", { lookup_username: username });

  // If the function failed or returned nothing, the username doesn't exist.
  if (lookupError || !email) {
    return { error: "Invalid username or password." };
  }

  // 2. Log in using the email
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: email,
    password,
  });

  if (authError) {
    return { error: "Invalid username or password." };
  }

  // 3. Success
  redirect("/dashboard");
}