"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Error Boundary Caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center px-4">
      <h2 className="text-xl font-semibold text-red-600">Something went wrong</h2>
      <p className="mt-2 text-sm text-ink-muted max-w-md">
        {error.message || "An unexpected error occurred while loading the page."}
      </p>
      <div className="mt-6 flex gap-4">
        <Button onClick={() => reset()}>Try again</Button>
        <Button variant="secondary" onClick={() => window.location.href = "/dashboard"}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}