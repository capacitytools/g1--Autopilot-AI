"use client";

import { useState } from "react";
import Link from "next/link";
import { updateBlogTheme, deleteArticle } from "@/lib/blog-manager-actions";
import { Button } from "@/components/ui/Button";
import { EditPostModal } from "@/lib/EditPostModal";

const THEMES = [
  { id: "haven-living", name: "Haven Living", desc: "Home Décor Editorial", bg: "bg-[#FAF8F3]", font: "font-serif text-[#174D38]", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80" },
  { id: "fashion-palace", name: "Fashion Palace", desc: "Luxury Fashion", bg: "bg-white", font: "font-serif uppercase tracking-widest", img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80" },
  { id: "daily-brief", name: "The Daily Brief", desc: "News & Journalism", bg: "bg-white", font: "font-serif font-bold", img: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&q=80" },
  { id: "agrosphere", name: "AgroSphere", desc: "Farming & Agriculture", bg: "bg-white", font: "font-sans font-bold text-[#14532D]", img: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=400&q=80" },
  { id: "idea-journal", name: "The Idea Journal", desc: "Lifestyle & Knowledge", bg: "bg-[#FCFBF8]", font: "font-serif", img: "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?w=400&q=80" },
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
  const [theme, setTheme] = useState(project.theme || "haven-living");
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingArticle, setEditingArticle] = useState<any | null>(null);

  async function handleThemeChange(newTheme: string) {
    setTheme(newTheme);
    setIsUpdating(true);
    await updateBlogTheme(project.id, newTheme);
    setIsUpdating(false);
  }

  async function handleDelete(articleId: string) {
    if (!window.confirm("Are you sure you want to delete this article?")) return;
    setDeletingId(articleId);
    await deleteArticle(articleId, project.id);
    setDeletingId(null);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{project.blog_title}</h1>
          <p className="mt-1 text-sm text-ink-muted">/blog/{project.blog_slug}</p>
        </div>
        <div className="flex gap-3">
          <a href={`/blog/${project.blog_slug}`} target="_blank" className="inline-flex h-10 items-center justify-center rounded-md border border-surface-border bg-surface px-4 text-sm font-medium text-ink hover:bg-surface-muted">View Live</a>
          <Link href={`/studio/write?project=${project.id}`} className="inline-flex h-10 items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700">Write Post</Link>
        </div>
      </div>

      {/* Theme Studio */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Premium Themes</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => handleThemeChange(t.id)}
              disabled={isUpdating}
              className={`text-left rounded-lg overflow-hidden border-2 transition-all group ${
                theme === t.id ? "border-brand-600 shadow-md ring-2 ring-brand-100" : "border-surface-border hover:border-brand-300"
              }`}
            >
              <div className="aspect-[4/3] relative overflow-hidden border-b border-surface-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={t.img} alt={t.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                {theme === t.id && (
                  <div className="absolute inset-0 bg-brand-600/10 flex items-center justify-center">
                    <span className="bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">Active</span>
                  </div>
                )}
              </div>
              <div className={`p-4 ${t.bg}`}>
                <h3 className={`font-bold text-lg mb-1 ${t.font}`}>{t.name}</h3>
                <p className="text-xs text-ink-muted">{t.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Articles & Analytics (keep existing) */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* ... Rest of your existing articles/analytics code ... */}
      </div>

      {editingArticle && (
        <EditPostModal article={editingArticle} projectId={project.id} onClose={() => { setEditingArticle(null); window.location.reload(); }} />
      )}
    </div>
  );
}