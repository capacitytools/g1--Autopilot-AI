"use client";

import { useState } from "react";
import Link from "next/link";
import { updateBlogTheme, deleteArticle } from "@/lib/blog-manager-actions";
import { Button } from "@/components/ui/Button";

const THEMES = [
  { id: "default", name: "G1 Clean (Default)" },
  { id: "classic", name: "Classic Blog" },
  { id: "magazine", name: "Magazine Grid" },
];

export function BlogManagerUI({ 
  project, 
  articles, 
  views 
}: { 
  project: any; 
  articles: any[]; 
  views: any[]; 
}) {
  const [theme, setTheme] = useState(project.theme || "default");
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleThemeChange(newTheme: string) {
    setTheme(newTheme);
    setIsUpdating(true);
    await updateBlogTheme(project.id, newTheme);
    setIsUpdating(false);
  }

  async function handleDelete(articleId: string) {
    if (!window.confirm("Are you sure you want to delete this article? This cannot be undone.")) return;
    setDeletingId(articleId);
    await deleteArticle(articleId, project.id);
    setDeletingId(null);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{project.blog_title}</h1>
          <p className="mt-1 text-sm text-ink-muted">/blog/{project.blog_slug}</p>
        </div>
        <div className="flex gap-3">
          <a 
            href={`/blog/${project.blog_slug}`} 
            target="_blank" 
            className="inline-flex h-10 items-center justify-center rounded-md border border-surface-border bg-surface px-4 text-sm font-medium text-ink hover:bg-surface-muted"
          >
            View Live Blog
          </a>
          <Link 
            href={`/studio/write?project=${project.id}`}
            className="inline-flex h-10 items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
          >
            Write New Post
          </Link>
        </div>
      </div>

      {/* Theme Selector */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Blog Theme</h2>
        <div className="flex flex-wrap gap-3">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => handleThemeChange(t.id)}
              disabled={isUpdating}
              className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                theme === t.id 
                  ? "border-brand-600 bg-brand-50 text-brand-700" 
                  : "border-surface-border bg-surface text-ink-muted hover:bg-surface-muted"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Articles List */}
        <div className="md:col-span-2 card">
          <h2 className="text-lg font-semibold mb-4">Your Posts</h2>
          {articles.length === 0 ? (
            <p className="text-sm text-ink-muted py-4">No posts yet. Click "Write New Post" to get started.</p>
          ) : (
            <div className="divide-y divide-surface-border">
              {articles.map((article) => (
                <div key={article.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-ink line-clamp-1">{article.title}</p>
                    <p className="text-xs text-ink-subtle mt-1">
                      {new Date(article.created_at).toLocaleDateString()} • {article.status}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link 
                      href={`/blog/${project.blog_slug}/${article.public_slug}`} 
                      target="_blank"
                      className="text-sm text-brand-600 hover:underline"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDelete(article.id)}
                      disabled={deletingId === article.id}
                      className="text-sm text-red-600 hover:underline disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Analytics Sidebar */}
        <div className="card bg-surface-muted">
          <h2 className="text-lg font-semibold mb-4">Recent Traffic</h2>
          {views.length === 0 ? (
            <p className="text-sm text-ink-muted">No traffic yet. Share your blog link to start getting visitors!</p>
          ) : (
            <div className="space-y-3">
              {views.map((view) => (
                <div key={view.id} className="text-xs border-b border-surface-border pb-2 last:border-0">
                  <p className="font-medium text-ink">{view.country} • {view.device}</p>
                  <p className="text-ink-subtle">{view.source} • {new Date(view.created_at).toLocaleTimeString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}