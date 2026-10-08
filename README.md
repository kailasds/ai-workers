# AI Worker Platform — console (redesign)

A new frontend for the TCS AI Worker Platform: compose, package, deliver, operate and govern accountable AI Workers.

The product truth (concepts, data, workflows, rules, states) comes from the reverse-engineered product context. The visual language and engineering conventions come from `.claude/skills/frontend-kit`. The legacy UI was used as a product reference only, never as a design reference.

## Run it

```bash
npm install
npm run dev
```

It runs with no backend. Every screen reads the **offline capture of 2026-10-06** (`src/data/mock/*.json`) through a typed data layer in `src/lib/api`. The sidebar says so on every page.

Set `VITE_API_MODE=live` to call the real console API at `/api` instead. Each read keeps the wire format from `data-contracts.md`, so only the transport changes.

### Reviewing non-happy states

Add `?mock=` to a page URL that reads data:

| Value | What you see |
| --- | --- |
| `loading` | The skeleton, indefinitely |
| `error` | The first-read error with Retry |
| `empty` | Never-populated empty states (Dashboard, Registry) |
| `refresh-error` | Dashboard: a failed refresh that keeps the last data and says when it is from |
| `slow` | A 2.5 s read |

## What is in it

| Area | Routes | Notes |
| --- | --- | --- |
| Shell | all | Grouped rail, ⌘K jump menu, Active work tracker, persistent completion notices, skip link |
| Sign-in and launcher | `/login`, `/auth/*`, `/home` | Mock: any username with a password; `locked` shows a named failure |
| Dashboard | `/dashboard` | Brief first; criteria, cost, contexts and runs open as deep-linkable sheets (`?detail=`) |
| Registry | `/workers` | Grouped list plus a preview panel; customer packages tab |
| Worker | `/workers/:id` | Overview, runs, runtimes, memory and learning, Sentinel, delivery; identity pause, resume and revoke |
| Compose | `/compose`, `/compose/guided/:id`, `/compose/drafts` | Declaration, then live assembly through eight checkpoints, then Build Package |
| Packaging | `/packaging` | Queues; builds run as background operations |
| Customer delivery | `/customer-delivery`, `/customer-delivery/prepare/:packageId` | To prepare / prepared records; four-step wizard with a re-attachable operation |
| Knowledge | `/knowledge/:tab`, `/knowledge/capture`, `/knowledge/coverage` | Library tabs, Write a Skill, governance |
| Learning | `/learning`, `/learning/shared`, `/learning/workers/:id` | Estate record and per-Worker learning |
| Sentinel | `/sentinel`, `/sentinel/workers`, `/sentinel/decisions`, `/sentinel/policy`, `/sentinel/:dimension` | Posture, dimensions, Stop Worker (typed name + reason) |
| Harnesses | `/harnesses`, `/harnesses/:key`, `/harnesses/certify`, `/harnesses/conformance`, `/harnesses/sdk/:page` | Catalogue and manifests |
| People | `/admin/people`, `/admin/groups` | Uses the console's test fixtures because the capture held no people |

Legacy links (`/operate`, `/fleet/*`, `/govern/*`, `/compose/expert`, `/workers/:id/okf`, a runtime id in `/workers/:id`) redirect.

## Honesty rules the UI keeps

- Unknown is never zero: "Not measured", "Not reported", "Not observed" are written as words, never as 0.
- Every average sits beside its coverage.
- Shadow and recorded decisions are never shown as applied.
- Where the capture holds no data for a read, the screen says the read is unavailable rather than showing an empty list. This applies to Knowledge governance, OKF, harness contract pages and runtime configuration.
- Mock writes (confirming a checkpoint, building, preparing, acknowledging, identity changes) change an in-memory copy only. Deploy, stop, share and publish say plainly that nothing was sent.

## Structure

```
src/
├── components/ui/        shadcn primitives (token wiring only)
├── components/platform/  shared product components: PageHeader, StatusBadge, IconTile, Stat,
│                         VerdictBar, RuntimeStatusDot, SectionNav, DetailSheet, FactList, Pager, …
├── components/shell/     app shell, sidebar, command menu, active work and notices
├── features/<area>/      one folder per area
├── lib/api/              typed reads/writes; mock/ serves the capture
├── lib/types/            wire types
└── data/mock/            the offline capture (JSON)
```

Design tokens, the type scale (`text-page`, `text-section`, `text-item`, `text-body`, `text-meta`, `text-overline`) and the deliberate deviations from the extracted design are documented in `.claude/skills/frontend-kit/references/design.md` §10.

## Scripts

- `npm run dev`: dev server (`.claude/launch.json` uses port 5180)
- `npm run build`: type-check and build
- `npm run lint`: oxlint
