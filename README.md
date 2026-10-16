# G1-Autopilot AI

**Create. Rank. Automate. Grow.**

AI-powered business automation platform for creators, publishers, bloggers,
marketers, and businesses. Core module: **SEO Master** — research smarter,
write better, optimize for search.

Part of the [G1-Tech Ecosystem](https://g1-id.vercel.app).

---

## Status

**Phase 1 of 15 — Architecture and project foundation.** ✅ Complete.

See [`docs/PHASE_STATUS.md`](docs/PHASE_STATUS.md) (to be added) for the
current implementation state. No feature is claimed as working unless it
has a test or a verified manual check.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| UI | React 18 + Tailwind CSS |
| Hosting | Vercel |
| Version control | GitHub |
| Database | Supabase Postgres (Autopilot's **own** project) |
| Storage | Supabase Storage |
| Auth | Temporary adapter (Phase 2) — G1-ID integration deferred |
| Testing | Vitest |

---

## Identity and G1-ID

Per the official [G1-ID technical handoff (v1.0)](https://g1-id.vercel.app),
G1-ID does **not** yet expose a downstream-facing API — no `/api/me`, no
token introspection, no JWKS, no webhooks, and no cross-product SSO.

**Therefore:**

- "Register" buttons link to G1-ID's real signup page.
- "Log in" links to a local login page (Phase 2) that mirrors G1-ID's
  username + password model so the experience feels unified.
- When G1-ID ships its integration API, Autopilot adds a nullable
  `g1_user_id` foreign key to its `users` table and backfills by matching
  email/username. No rewrite is required.

**Autopilot does NOT share G1-ID's Supabase project.** The G1-ID handoff
(§11.3) documents concrete cross-product security risks with that pattern.

---

## Local setup

### 1. Prerequisites

- Node.js ≥ 20
- npm ≥ 10 (bundled with Node 20)

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Copy the example file and fill in the required values:

```bash
cp .env.example .env.local
```

Minimum required for Phase 1:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_G1ID_URL=https://g1-id.vercel.app
```

Supabase and provider keys are optional until later phases. When missing,
the app reports those features as **not configured** — it never pretends
they work.

### 4. Run the dev server

```bash
npm run dev
```

Open <http://localhost:3000>.

---

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |
| `npm run test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run verify` | typecheck + lint + test (use before commit) |

---

## Project structure

```
src/
  app/                    Next.js App Router pages and layouts
    layout.tsx            Root layout — fonts, metadata, skip-link
    page.tsx              Landing page
    globals.css           Tailwind base + brand components
  components/             Shared React components
    G1IDRegisterLink.tsx  Client wrapper for G1-ID signup redirects
    ui/
      Button.tsx          Shared button primitive
      Input.tsx           Shared input primitive
  lib/                    Framework-agnostic utilities
    config.ts             Env validation + shaped config
    logger.ts             Structured logging
    errors.ts             Normalized application errors
    config.test.ts        Tests for config loader
tailwind.config.ts        Brand tokens (forest green, neutrals)
vitest.config.ts          Test runner configuration
```

---

## Security notes

- No secrets in client-side code. Only `NEXT_PUBLIC_*` variables reach the
  browser bundle.
- `.env.local` and variants are git-ignored.
- Security headers (`X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy`) are set in `next.config.mjs`.
- Provider keys (AI, search, payments) are validated as optional in
  Phase 1 and required only when the relevant feature is used.

---

## Roadmap

Phase 1 (done) → Phase 2: Authentication and data isolation → Phase 3:
Dashboard and project management → Phases 4–9: SEO Master core → … →
Phase 15: Production readiness.

See the master build prompt for the full phased plan.

---

## License

Proprietary. © G1-Tech Ecosystem.