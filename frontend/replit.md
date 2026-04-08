# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS v4 + Framer Motion

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── research-platform/  # React + Vite frontend (main app at /)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## Application: AI Research Platform

The main application is an AI-powered research and PDF insight generation platform. Users submit a query about a company, product, or domain — the system shows live multi-agent workflow progress, then presents curated articles sorted into Official Sources and Trusted External Sources for the user to review and select. Selected articles become deep insights in a generated PDF report; unselected approved articles appear in the references section.

### Features
- **Landing page** — ChatGPT-style centered search with example query chips
- **Live workflow progress** — animated stages (analyzing, fetching, scoring, classifying, etc.)
- **Article curation** — polished article cards with checkboxes, score badges, source badges
- **In-app reader** — right-side drawer that shows extracted article content
- **PDF generation** — floating action bar, async PDF generation with status polling
- **Mock data** — full end-to-end demo with realistic NVIDIA, OpenAI, solar, vector DB data

### Frontend Pages
- `/` — Landing page (`artifacts/research-platform/src/pages/home.tsx`)
- `/session/:sessionId` — Session/results page (`artifacts/research-platform/src/pages/session.tsx`)

### Frontend Components
- `ArticleCard` — Article with checkbox, score, category badge, click-to-read
- `WorkflowProgress` — Animated workflow step tracker with connecting lines
- `FloatingActionBar` — Sticky bottom PDF generation bar
- `ArticleReader` — Sheet/drawer for in-app article reading

### API Endpoints
All endpoints live under `/api/*` (proxied via the shared reverse proxy):

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tips` | Example query tips for landing page |
| POST | `/api/search` | Start a new search session, returns `session_id` |
| GET | `/api/workflow/status/:sessionId` | Poll workflow stage progress |
| GET | `/api/articles/:sessionId` | Get official + trusted articles after workflow completes |
| GET | `/api/article-content?url=...` | Get extracted article content for reader mode |
| POST | `/api/generate-pdf/:sessionId` | Start PDF generation with selected URLs |
| GET | `/api/pdf-status/:sessionId` | Poll PDF generation status |
| GET | `/api/session/:sessionId` | Restore session state (e.g. on page refresh) |

### Database Schema
Tables: `search_sessions`, `articles`, `workflow_stages`
- Sessions track query, workflow status, and PDF status
- Articles have category (official/trusted), score, approval, and selection state
- Workflow stages track per-stage status for live progress display

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers
- Mock data: `src/lib/mock-data.ts` — realistic article fixtures + workflow stages
- Depends on: `@workspace/db`, `@workspace/api-zod`

### `artifacts/research-platform` (`@workspace/research-platform`)

React + Vite frontend. Uses React Query for data fetching with polling, Framer Motion for transitions, Tailwind CSS v4 for styling, and Shadcn UI components.

- `src/pages/home.tsx` — Landing page
- `src/pages/session.tsx` — Research session with workflow + results
- `src/components/` — Reusable UI components

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`
