import { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";
import { getConfig } from "@/lib/config";
import { G1IDRegisterLink } from "@/components/G1IDRegisterLink";

export const metadata: Metadata = {
  title: "Log in",
};

export default function LoginPage() {
  const config = getConfig();
  const g1idSignupUrl = `${config.g1id.url}${config.g1id.signupPath}`;

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Log in to your G1-Autopilot account
        </p>
      </div>

      <div className="card">
        <LoginForm />
      </div>

      <div className="mt-6 text-center text-sm">
        <p className="text-ink-subtle">
          Need a G1-ID?{" "}
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