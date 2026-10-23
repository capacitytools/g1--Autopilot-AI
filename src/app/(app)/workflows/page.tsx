import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/lib/auth/organization";
import { Metadata } from "next";
import { WorkflowManager } from "@/lib/WorkflowManager";

export const metadata: Metadata = {
  title: "Workflows",
};

export default async function WorkflowsPage() {
  const org = await getCurrentOrganization();
  const supabase = createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name")
    .eq("organization_id", org.id);

  const { data: templates } = await supabase
    .from("workflow_templates")
    .select("id, name, description")
    .eq("organization_id", org.id);

  const { data: recentRuns } = await supabase
    .from("workflow_runs")
    .select("id, status, created_at, input_data, output_data")
    .eq("organization_id", org.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Workflow Builder</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Automate your content pipeline. Create reusable workflows to generate and publish articles.
        </p>
      </div>

      <WorkflowManager 
        templates={templates || []} 
        projects={projects || []} 
        recentRuns={recentRuns || []} 
      />
    </div>
  );
}