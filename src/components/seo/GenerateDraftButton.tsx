"use client";

import { useState } from "react";
import { generateArticleDraft } from "@/lib/article-actions";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export function GenerateDraftButton({ articleId }: { articleId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleGenerate() {
    setLoading(true);
    setError(null);

    const result = await generateArticleDraft(articleId);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      // Refresh the page to show the generated content
      router.refresh();
    }
  }

  return (
    <div className="space-y-3">
      <Button onClick={handleGenerate} loading={loading} className="w-full sm:w-auto">
        Generate Draft with AI
      </Button>
      {error && (
        <p className="text-sm text-status-danger bg-red-50 p-3 rounded-md">
          {error}
        </p>
      )}
    </div>
  );
}