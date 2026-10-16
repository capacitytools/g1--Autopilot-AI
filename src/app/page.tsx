import { getConfig } from "@/lib/config";
import { G1IDRegisterLink } from "@/components/G1IDRegisterLink";

export default function LandingPage() {
  const config = getConfig();

  const g1idSignupUrl = `${config.g1id.url}${config.g1id.signupPath}`;

  return (
    <main id="main-content" className="min-h-screen">
      {/* ---------- Header ---------- */}
      <header className="border-b border-surface-border bg-surface">
        <div className="container-app flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              aria-hidden="true"
              className="h-8 w-8 rounded-md bg-brand-600"
            />
            <span className="text-lg font-semibold tracking-tight">
              G1-Autopilot AI
            </span>
          </div>
          <nav className="flex items-center gap-3">
            <a
              href="/login"
              className="rounded-md px-3 py-2 text-sm font-medium text-ink-muted hover:text-ink"
            >
              Log in
            </a>
            <G1IDRegisterLink
              href={g1idSignupUrl}
              className="rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Register on G1-ID
            </G1IDRegisterLink>
          </nav>
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="container-app py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="pill pill-success">
            Part of the G1-Tech Ecosystem
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
            Create. Rank. Automate. Grow.
          </h1>
          <p className="mt-6 text-lg text-ink-muted">
            G1-Autopilot AI is an AI-powered business automation platform for
            creators, publishers, bloggers, marketers, and businesses. Research
            topics, write useful articles, optimize for search, and measure
            real performance — without juggling ten different tools.
          </p>
          <p className="mt-3 text-base text-ink-subtle">
            Core module: <strong>SEO Master</strong> — research smarter, write
            better, optimize for search.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <G1IDRegisterLink
              href={g1idSignupUrl}
              className="w-full rounded-md bg-brand-600 px-6 py-3 text-base font-medium text-white hover:bg-brand-700 sm:w-auto"
            >
              Create your G1-ID account
            </G1IDRegisterLink>
            <a
              href="/login"
              className="w-full rounded-md border border-surface-border bg-surface px-6 py-3 text-base font-medium text-ink hover:bg-surface-muted sm:w-auto"
            >
              Log in with G1-ID
            </a>
          </div>

          <p className="mt-4 text-xs text-ink-subtle">
            Registration is handled by G1-ID — the identity layer of the
            G1-Tech Ecosystem.
          </p>
        </div>
      </section>

      {/* ---------- Feature grid ---------- */}
      <section className="container-app pb-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            title="SEO Master"
            body="Topic research, keyword intelligence, content briefs, drafts, fact-checking, and on-page SEO — in one workflow."
          />
          <FeatureCard
            title="Content Studio"
            body="Blog articles, social posts, video scripts, newsletters, and lead magnets. Each format follows its own rules."
          />
          <FeatureCard
            title="AutoBlog"
            body="Publish approved articles to your connected website. Draft, schedule, retry — safely and without duplicates."
          />
          <FeatureCard
            title="Pinterest Automation"
            body="Generate pin titles, descriptions, and image prompts. Publish through authorized integrations only."
          />
          <FeatureCard
            title="Workflow Builder"
            body="Chain research → draft → review → publish into reusable workflows with approvals and history."
          />
          <FeatureCard
            title="Monetization Hub"
            body="Organize affiliate products and links, prepare digital products, and track real revenue when connected."
          />
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-surface-border bg-surface">
        <div className="container-app flex flex-col items-center justify-between gap-3 py-6 text-sm text-ink-subtle sm:flex-row">
          <p>© {new Date().getFullYear()} G1-Tech Ecosystem</p>
          <p>Identity by G1-ID</p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="card">
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-ink-muted">{body}</p>
    </div>
  );
}