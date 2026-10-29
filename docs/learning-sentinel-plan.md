# Learning and Platform Sentinel — implementation plan

Source brief: `ai-worker-learning-sentinel-ux-improvements.md`. The manager's screenshots were not attached. The product reference used instead is the legacy console the brief describes (`tcs-ai-worker-react-offline`, `routes/learning`, `routes/sentinel`) together with `docs/product-context/screens/{learning-fleet,worker-learning,sentinel}.md`.

## 1. Audit — what exists

| Area | Already in the redesign | Reused |
| --- | --- | --- |
| Navigation | Brain menu with Knowledge · Learning · Sentinel tabs (`brain-layout.tsx`) | Kept. No new top-level item. |
| Learning | `/learning` showed fleet tiles from `learning-workers-v1` (empty in the capture); `/learning/workers/:id` Worker learning page | The per-Worker page stays. `/learning` is rebuilt. |
| Sentinel | Overview, Workers (with Stop Worker), Decisions (static empty state, no read), Policy, Dimension pages | Workers and Dimension pages kept. Overview, Decisions and Policy are reworked; Sharing is added. |
| Shared UI | `SectionNav`, `DetailSheet`, `FactList`, `EmptyState` / `ErrorState` / `LoadingRegion`, `StatusBadge`, `Tag`, `Pager`, `Timestamp`, `useResource`, `?mock=` scenarios | All reused. |

## 2. Data — real vs missing

**Real (in the 2026-10-06 capture):**
- `worker-portfolio-v1`: per Worker `learning.memories`, `learning.runs`, `learning.last_at`, `contradictions`, plus brain and Sentinel configuration. 17 Workers have memory records.
- `worker-brain-v1`, one Worker: 5 items **held back** while gathering evidence ("1 of 3 runs so far"), compounding rules (min 3 runs, DoD must be met), and `skill_changes: []`.
- `platform-sentinel-overview-v1`:
  - mode not set, applies nothing, with the reason given
  - coverage: 1 running, 0 reporting
  - chain not verified, 0 entries
  - all five dimensions have nothing open
  - `in_force: []`, `stream: []`, `needs_review: 0`
- `sentinel-learning-fleet-v1`: the one running Worker did not answer.
- `learning-workers-v1`: no Worker reported Learning terms (all `null`).
- Compose catalogue: identity → bounded context ladder (code generation → + unit tests → + traceability).

**Missing from the data layer (documented gaps, never simulated):**

| Capability | State in the UI |
| --- | --- |
| Worker Sentinel approve / hold / reject decisions per item | "Review not reported" |
| Sharing agreements, deliveries and use | Product constant: "Sharing is declared, not active." Every state is shown as none recorded. |
| Evolution proposals (proposed / approved / applied) | No endpoint captured. "No evolution proposals recorded." The catalogue ladder shows only what the next capability *would* be. |
| Platform decision log entries | The real read is empty: "No platform decisions yet." |
| Revoke / replace / retire for knowledge items | No status or replacement fields and no write endpoint. Definitions are shown with "None recorded"; no action buttons. |
| Editing platform policy | Read-only, as in the product ("editing arrives with policy v2"). |

## 3. Routes and page responsibilities

**Learning** (inside Brain):

| Route | Page |
| --- | --- |
| `/learning` | **Activity** (default): a chronological feed of real learning events. Filters: Worker, event type. Each item shows what happened, the Worker, when, state, source, and what to open next. |
| `/learning/knowledge` | **Knowledge gained**, split into: approved (not reported), gathering evidence (held items), and recorded but not reviewed (memory records). Links to Assigned knowledge (Knowledge library) and to Platform knowledge (Sentinel › Sharing). Includes a knowledge-health block (retire / revoke / replace definitions, contradictions, withdrawn items). |
| `/learning/evolution` | **Evolution**: current capability → next capability on the ladder per bounded context, with Workers and the proposal state ("No proposal recorded"). |
| `/learning/map` | **Explore map** (optional, button on every Learning view): columns Identity → Capability → Workers with learning → items, built only from real links. Nodes open a detail sheet. |
| `/learning/shared` | Redirects to `/sentinel/sharing`. |
| `/learning/workers/:id/*` | Unchanged. |

**Platform Sentinel** (inside Brain):

| Route | Page |
| --- | --- |
| `/sentinel` | **Overview**, decision-first: "Needs your attention" (reviews, stops and restrictions); active stops and restrictions; sharing status; recent decisions; how Sentinel is set up (decides / applies / coverage / chain); what it checks (five dimensions). |
| `/sentinel/sharing` | **Sharing** (new): six distinct states (eligible · proposed · agreed · suspended · delivered · used), the rules for sharing, where sharing would apply (Workers in the same bounded context), and agreements (none recorded). No approve / resume controls. |
| `/sentinel/decisions` (+ `/:id`) | Decision history read from the real stream. Filters: dimension, severity, applied vs recorded. Detail shows headline, time, dimension, severity, and applied vs recorded. |
| `/sentinel/policy` | Platform-wide controls (none configured) vs Worker-owned settings. Read-only. Admin gate. |
| `/sentinel/workers`, `/sentinel/:dimension` | Kept (coverage and Stop Worker; dimension detail). |

**Worker integration:** the Worker page's Learning and Sentinel tabs link to `/learning?worker=` and `/sentinel/decisions`. Activity items link to the Worker and to its learning page. No new Worker entity.

## 4. Testing approach

- `npm run build` (tsc and vite) and `npm run lint`. There is no unit-test runner in this project.
- In the browser preview: every route, tab, filter, link and detail sheet.
- `?mock=loading|error|empty|slow` on each new page, using the existing convention.
- Confirm that no number, date, approval or effect appears that isn't in the capture.
