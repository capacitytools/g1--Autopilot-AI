"use client";

import { useFormState, useFormStatus } from "react-dom";
import { saveWordPressConnection, type SettingsState } from "@/lib/settings-actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: SettingsState = {};

export function WordPressForm({ websites }: { websites: { id: string; domain: string }[] }) {
  const [state, formAction] = useFormState(saveWordPressConnection, initialState);

  if (websites.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md text-sm">
        You need to create a project with a website domain first.
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{state.error}</div>
      )}
      {state.success && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
          WordPress connection saved successfully!
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Select Website</label>
        <select
          name="websiteId"
          required
          className="block w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="">Select a website...</option>
          {websites.map((w) => (
            <option key={w.id} value={w.id}>{w.domain}</option>
          ))}
        </select>
      </div>

      <Input
        label="WordPress Site URL"
        name="baseUrl"
        type="url"
        placeholder="https://myblog.com"
        required
        error={state.fieldErrors?.baseUrl?.[0]}
      />

      <Input
        label="WordPress Username"
        name="username"
        type="text"
        placeholder="admin"
        required
        error={state.fieldErrors?.username?.[0]}
      />

      <Input
        label="Application Password"
        name="appPassword"
        type="password"
        placeholder="xxxx xxxx xxxx xxxx"
        required
        error={state.fieldErrors?.appPassword?.[0]}
        hint="Generate this in WordPress -> Users -> Profile -> Application Passwords."
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
      Save Connection
    </Button>
  );
}