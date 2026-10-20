"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const loginSchema = z.object({
  identifier: z.string().min(1, "Username or email is required."),
  password: z.string().min(1, "Password is required."),
});

export type LoginState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const identifier = (formData.get("identifier") as string).trim();
  const password = formData.get("password") as string;

  const result = loginSchema.safeParse({ identifier, password });

  if (!result.success) {
    return {
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  const supabase = createClient();

  // 1. Resolve the identifier (username or email) to an email address
  const { data: email, error: lookupError } = await supabase
    .rpc("get_email_by_identifier", { lookup_identifier: identifier });

  if (lookupError || !email) {
    return { error: "Invalid username, email, or password." };
  }

  // 2. Log in using the resolved email
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: email,
    password,
  });

  if (authError) {
    return { error: "Invalid username, email, or password." };
  }

  // 3. Success
  redirect("/dashboard");
}