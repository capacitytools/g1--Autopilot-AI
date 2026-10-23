"use client";

import { useFormState, useFormStatus } from "react-dom";
import { saveBlogSettings, type BlogState } from "@/lib/blog-actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: BlogState = {};

export function BlogSettingsForm({ existingBlog }: { existingBlog: any | null }) {
  const [state, formAction] = useFormState(saveBlogSettings, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{state.error}</div>}
      {state.success && <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">Blog settings saved successfully!</div>}

      <div className="bg-surface-muted p-3 rounded-md border border-surface-border mb-4">
        <p className="text-sm text-ink-subtle mb-1">Your public blog URL will be:</p>
        <p className="font-mono text-sm text-brand-700 font-medium">
          https://g1-autopilot-ai.vercel.app/blog/{existingBlog?.slug || "your-slug"}
        </p>
      </div>

      <Input
        label="Blog URL Slug"
        name="slug"
        defaultValue={existingBlog?.slug || ""}
        placeholder="e.g., my-fashion-blog"
        required
        error={state.fieldErrors?.slug?.[0]}
        hint="Lowercase letters, numbers, and hyphens only."
      />

      <Input
        label="Blog Title"
        name="title"
        defaultValue={existingBlog?.title || ""}
        placeholder="e.g., The Fashion Insider"
        required
        error={state.fieldErrors?.title?.[0]}
      />

      <Input
        label="Blog Description"
        name="description"
        defaultValue={existingBlog?.description || ""}
        placeholder="A short description for SEO and social sharing."
        error={state.fieldErrors?.description?.[0]}
      />

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
      Save Blog Settings
    </Button>
  );
}