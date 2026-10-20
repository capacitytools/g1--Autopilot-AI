import { Metadata } from "next";
import { SignupForm } from "@/components/auth/SignupForm";
import Link from "next/link";
import { getConfig } from "@/lib/config";
import { G1IDRegisterLink } from "@/components/G1IDRegisterLink";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default function SignupPage() {
  const config = getConfig();
  const g1idSignupUrl = `${config.g1id.url}${config.g1id.signupPath}`;

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Start using G1-Autopilot AI today.
        </p>
      </div>

      <div className="card">
        <SignupForm />
      </div>

      <div className="mt-6 text-center text-sm">
        <p className="text-ink-subtle">
          Want to use your G1-ID instead?{" "}
          <G1IDRegisterLink href={g1idSignupUrl} className="font-medium text-brand-600 hover:underline">
            Register on G1-ID
          </G1IDRegisterLink>
        </p>
        <p className="mt-2">
          <Link href="/" className="text-ink-muted hover:text-ink">
            &larr; Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}