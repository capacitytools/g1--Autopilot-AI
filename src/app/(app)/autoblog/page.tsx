import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/lib/auth/organization";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AutoBlog",
};

export default async function AutoBlogPage() {
  const org = await getCurrentOrganization();
  const supabase = createClient();

  // Fetch all publishing jobs for this organization
  const { data: jobs } = await supabase
    .from("publishing_jobs")
    .select(`
      id, status, external_url, created_at, error_log,
      articles (id, title, status),
      websites (domain)
    `)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AutoBlog</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Track your published articles and external connections.
          </p>
        </div>
      </div>

      <div className="card">
        {(!jobs || jobs.length === 0) ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold">No publishing history yet</h3>
            <p className="mt-2 text-sm text-ink-muted">
              Generate an article in SEO Master and publish it to see it here.
            </p>
            <Link
              href="/seo"
              className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
            >
              Go to SEO Master
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-ink-subtle uppercase bg-surface-muted border-b border-surface-border">
                <tr>
                  <th className="px-6 py-3">Article</th>
                  <th className="px-6 py-3">Website</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {jobs.map((job) => {
                  const article = Array.isArray(job.articles) ? job.articles[0] : job.articles;
                  const website = Array.isArray(job.websites) ? job.websites[0] : job.websites;
                  
                  return (
                    <tr key={job.id} className="bg-surface hover:bg-surface-muted/50">
                      <td className="px-6 py-4 font-medium text-ink">
                        {article?.title || "Unknown Article"}
                      </td>
                      <td className="px-6 py-4 text-ink-muted">
                        {website?.domain || "Unknown"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`pill ${
                          job.status === 'success' ? 'pill-success' : 
                          job.status === 'failed' ? 'pill-danger' : 'pill-warning'
                        }`}>
                          {job.status}
                        </span>
                        {job.status === 'failed' && job.error_log && (
                          <p className="text-xs text-red-500 mt-1 max-w-xs truncate" title={job.error_log}>
                            {job.error_log}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-ink-muted">
                        {new Date(job.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {job.status === 'success' && job.external_url ? (
                          <a 
                            href={job.external_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-brand-600 hover:underline font-medium"
                          >
                            View Post
                          </a>
                        ) : (
                          <Link 
                            href={`/seo/${article?.id}`}
                            className="text-brand-600 hover:underline font-medium"
                          >
                            Review
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}