"use client";

import { useState } from "react";
import { createWorkflowTemplate, triggerWorkflowRun } from "@/lib/workflow-actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

export function WorkflowManager({ 
  templates, 
  projects, 
  recentRuns 
}: { 
  templates: any[]; 
  projects: any[]; 
  recentRuns: any[]; 
}) {
  const [creating, setCreating] = useState(false);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateTemplate(formData: FormData) {
    setCreating(true);
    const result = await createWorkflowTemplate(formData);
    if (result.error) setError(result.error);
    setCreating(false);
  }

  async function handleRunTemplate(templateId: string, formData: FormData) {
    setRunningId(templateId);
    const result = await triggerWorkflowRun(templateId, formData);
    if (result?.error) {
      setError(result.error);
      setRunningId(null);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Left Column: Templates & Runner */}
      <div className="space-y-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Create a Workflow</h2>
          <form action={handleCreateTemplate} className="space-y-4">
            <Input label="Workflow Name" name="name" placeholder="e.g., Daily Blog Post" required />
            <Button type="submit" loading={creating} className="w-full">Create Template</Button>
          </form>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Your Workflows</h2>
          {templates.length === 0 ? (
            <p className="text-sm text-ink-muted">No workflows created yet.</p>
          ) : (
            <div className="space-y-4">
              {templates.map((template) => (
                <div key={template.id} className="border border-surface-border rounded-md p-4 bg-surface-muted">
                  <h3 className="font-medium">{template.name}</h3>
                  <p className="text-xs text-ink-subtle mb-4">{template.description}</p>
                  
                  <form action={(formData) => handleRunTemplate(template.id, formData)} className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-ink mb-1 block">Topic to Automate</label>
                      <input 
                        name="topic" 
                        required 
                        placeholder="Enter a topic..." 
                        className="w-full rounded-md border border-surface-border px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-ink mb-1 block">Project</label>
                      <select name="projectId" required className="w-full rounded-md border border-surface-border px-3 py-2 text-sm bg-surface">
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <Button type="submit" size="sm" loading={runningId === template.id} className="w-full">
                      Run Workflow
                    </Button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Recent Runs */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Recent Runs</h2>
        {recentRuns.length === 0 ? (
          <p className="text-sm text-ink-muted">No workflows have been run yet.</p>
        ) : (
          <div className="space-y-3">
            {recentRuns.map((run) => (
              <div key={run.id} className="flex items-center justify-between p-3 border border-surface-border rounded-md">
                <div>
                  <p className="text-sm font-medium">{run.input_data?.topic || "Unknown Topic"}</p>
                  <p className="text-xs text-ink-subtle">{new Date(run.created_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`pill ${
                    run.status === 'completed' ? 'pill-success' : 
                    run.status === 'running' ? 'pill-warning' : 'pill-info'
                  }`}>
                    {run.status}
                  </span>
                  {run.output_data?.article_id && (
                    <Link href={`/seo/${run.output_data.article_id}`} className="text-sm text-brand-600 hover:underline">
                      View
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}