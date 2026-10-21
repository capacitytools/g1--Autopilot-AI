"use client";

import { useFormState, useFormStatus } from "react-dom";
import { startResearch, type SEOState } from "@/lib/seo-actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: SEOState = {};

export function SEOForm({ projects }: { projects: { id: string; name: string }[] }) {
  const [state, formAction] = useFormState(startResearch, initialState);

  if (projects.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md text-sm">
        You need to create a project first before generating an article.
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {state.error}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Project</label>
        <select
          name="projectId"
          required
          className="block w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="">Select a project...</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Primary Topic or Keyword"
        name="primaryTopic"
        type="text"
        placeholder="e.g., 10 Profitable Ways to Start Goat Farming"
        required
        error={state.fieldErrors?.primaryTopic?.[0]}
      />

      <Input
        label="Target Audience"
        name="targetAudience"
        type="text"
        placeholder="e.g., Beginner goat farmers in Nigeria"
        required
        error={state.fieldErrors?.targetAudience?.[0]}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Language"
          name="language"
          type="text"
          defaultValue="en"
          required
        />
        
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Search Intent (Optional)</label>
          <select
            name="intent"
            className="block w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="">Auto-detect by AI</option>
            <option value="INFORMATIONAL">Informational</option>
            <option value="COMMERCIAL">Commercial Investigation</option>
            <option value="TRANSACTIONAL">Transactional</option>
            <option value="NAVIGATIONAL">Navigational</option>
          </select>
        </div>
      </div>

      <div className="pt-4">
        <SubmitButton />
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" loading={pending}>
      Start Research & Generate Article
    </Button>
  );
}