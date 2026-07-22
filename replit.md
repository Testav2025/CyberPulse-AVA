# CyberPulse AVA

A Microsoft-integrated enterprise cybersecurity companion platform that gives every employee a personal security command centre — showing their CyberScore, device compliance, active threats, security training progress, and AI-powered guidance from AVA.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/cyberpulse-ava run dev` — run the frontend (auto-assigned port)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, shadcn/ui, Recharts, Framer Motion, Wouter, next-themes
- API: Express 5 + Zod validation (OpenAPI-first via Orval)
- DB: PostgreSQL + Drizzle ORM
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for all API contracts)
- `lib/db/src/schema/` — Drizzle table definitions (one file per domain)
- `artifacts/api-server/src/routes/` — Express route handlers (one file per domain)
- `artifacts/cyberpulse-ava/src/` — React frontend

## Architecture decisions

- Single simulated user (`user-001`) as identity source — Entra SSO is designed to replace this with real MSAL token subject in production
- All Microsoft integrations (Graph, Intune, Defender, Darktrace, Pentera) are backed by seeded DB data in dev; swap route handlers to call real APIs with service credentials in production
- AI Security Assistant uses keyword-matched canned responses — replace with Copilot Studio webhook in production
- Darktrace/Pentera findings stored as comma/pipe-delimited fields in Postgres — adequate for demo, normalise to junction tables if storing large datasets

## Product

- **Security Dashboard** — personal greeting, CyberScore ring (animated), 4 KPI cards, score history sparkline, recent alert feed, Darktrace + Pentera widgets
- **CyberScore Deep Dive** — score breakdown by component (Identity 25%, Device 25%, Training 25%, Risk 25%), 30-day history chart, improvement recommendations
- **Device Compliance** — filterable device table with platform icons, compliance badges, encryption/firewall/AV status, non-compliance reasons
- **Security Alert Feed** — full alert list with severity colour-coding, resolve/dismiss actions, detail drawer
- **Darktrace Intelligence** — threat score, model breach counts, anomalous devices, incident list with MITRE ATT&CK tactics and AI confidence scores
- **Pentera Risk** — risk score gauge, severity donut chart, findings list with CVSS scores, attack surface rating
- **Security Learning Hub** — training module grid with progress, mandatory badges, leaderboard, personal progress summary
- **AI Security Assistant (AVA)** — full chat interface powered by Copilot Studio (mocked in dev), context-aware suggestions
- **Teams Notifications** — webhook URL, alert severity threshold, digest preferences
- **User Profile** — display name, role, department, theme toggle

## User preferences

- Dark mode by default; light mode fully supported
- Futuristic Microsoft Fluent design language
- No emojis in the UI
- Mobile responsive, PWA-ready

## Gotchas

- `devices.non_compliance_reasons` is pipe-delimited (`reason1|reason2`) — split on `|` when reading, join on `|` when writing
- `darktrace_incidents.mitre_tactics` and `training_modules.tags` use the same pipe-delimited pattern
- Score history dates are stored as `text` (`YYYY-MM-DD`) not timestamps — do not cast to timestamp

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
