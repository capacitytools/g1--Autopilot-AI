"use client";

import { useFormState, useFormStatus } from "react-dom";
import { signup, type SignupState } from "@/app/(auth)/signup/actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { getConfig } from "@/lib/config";

const initialState: SignupState = {};

export function SignupForm() {
  const [state, formAction] = useFormState(signup, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {state.error}
        </div>
      )}

      <Input
        label="Username"
        name="username"
        type="text"
        placeholder="e.g., john_doe"
        autoComplete="username"
        required
        error={state.fieldErrors?.username?.[0]}
        hint="Lowercase letters, numbers, and underscores only."
      />

      <Input
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        required
        error={state.fieldErrors?.email?.[0]}
      />

      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        error={state.fieldErrors?.password?.[0]}
        hint="At least 8 characters."
      />

      <div className="pt-2">
        <SubmitButton />
      </div>

      <p className="text-center text-sm text-ink-subtle mt-4">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-600 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" loading={pending}>
      Create Account
    </Button>
  );
}