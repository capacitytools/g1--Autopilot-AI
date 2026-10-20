"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createProject, type ProjectState } from "@/app/(app)/projects/actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: ProjectState = {};

export function NewProjectForm() {
  const [state, formAction] = useFormState(createProject, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {state.error}
        </div>
      )}

      <Input
        label="Project Name"
        name="name"
        type="text"
        placeholder="e.g., Goat Farming SEO Campaign"
        required
        error={state.fieldErrors?.name?.[0]}
      />

      <Input
        label="Website Domain"
        name="domain"
        type="text"
        placeholder="e.g., example.com"
        required
        error={state.fieldErrors?.domain?.[0]}
        hint="Enter the domain without http:// or https://"
      />

      <div className="pt-2">
        <SubmitButton />
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" loading={pending}>
      Create Project
    </Button>
  );
}