import { Metadata } from "next";
import { NewProjectForm } from "@/components/projects/NewProjectForm";
import Link from "next/link";

export const metadata: Metadata = {
  title: "New Project",
};

export default function NewProjectPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-ink-muted hover:text-ink">
          &larr; Back to dashboard
        </Link>
      </div>
      <div className="card">
        <h1 className="text-xl font-semibold tracking-tight mb-6">Create a New Project</h1>
        <NewProjectForm />
      </div>
    </div>
  );
}