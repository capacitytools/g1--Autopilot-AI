"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

// Mirror G1-ID username rules: 3-24 chars, lowercase alphanumeric and underscores
const signupSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(24, "Username must be at most 24 characters")
    .regex(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores"),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export type SignupState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function signup(prevState: SignupState, formData: FormData): Promise<SignupState> {
  const username = (formData.get("username") as string).toLowerCase();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const result = signupSchema.safeParse({ username, email, password });

  if (!result.success) {
    return {
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  const supabase = createClient();

  // 1. Check if username is taken
  const { data: existingUser } = await supabase
    .from("profiles")
    .select("username")
    .eq("username", username)
    .single();

  if (existingUser) {
    return {
      fieldErrors: { username: ["This username is already taken."] },
    };
  }

  // 2. Create the auth user. 
  // The database trigger (File 1) will automatically create the profile 
  // and default organization using the email prefix, so we will update it immediately after.
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    return { error: authError.message };
  }

  // 3. Update the profile with the exact username they requested
  if (authData.user) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ username, display_name: username })
      .eq("id", authData.user.id);

    if (profileError) {
      // If this fails, it's likely because they want a username that 
      // the trigger already grabbed. We catch it here.
      return { error: "Could not save username. Please try another." };
    }
  }

  // Note: If Supabase requires email confirmation, they will be redirected
  // to the login page to confirm their email first. 
  redirect("/login");
}