import { getCurrentUser } from "@/lib/auth/adapter";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // If already logged in, redirect to dashboard
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-muted px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-2">
        <div className="h-8 w-8 rounded-md bg-brand-600" aria-hidden="true" />
        <span className="text-xl font-semibold tracking-tight">G1-Autopilot AI</span>
      </div>
      {children}
    </div>
  );
}