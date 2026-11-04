# AI Worker Platform — project context

A quick orientation for anyone (person or AI agent) picking up this project. For the full product truth, read `docs/product-context/` (start with `NEW-UI-BRIEF.md`). For how the UI is built and styled, read `.claude/skills/frontend-kit/`.

---

## 1. What the product is

The **AI Worker Platform** is a TCS console for creating, packaging, delivering, running and governing **AI Workers**.

An AI Worker is an accountable, bounded AI agent. Each one has:

- an **owner**
- a cryptographic **identity**
- one defined **scope** (its bounded context)
- a **Definition of Done** that every run is measured against
- a **Sentinel** that oversees what it learns and does

TCS uses it for its own delivery teams and to hand finished Workers to customers. The focus is BFSI: insurance, payments, lending, quality engineering and integration modernisation.

The product is **honesty-first**. It keeps these pairs apart and never collapses them into a simpler number or a green tick:

- measured vs not measured
- applied vs only recorded
- unknown vs zero

## 2. Who uses it

| Role | What they do |
| --- | --- |
| Composer | Defines Workers. Cannot deploy or run them. |
| Packager | Builds a composed Worker into a versioned Package. |
| Operator | Deploys, monitors, stops and resumes Workers under a spending limit. Cannot change what a Worker is. |
| Delivery manager | Prepares Packages for named customers and tracks what went out. |
| Auditor / Viewer | Reads evidence and exports it. |
| Administrator | Manages people, groups and access. |

## 3. Core concepts

| Term | Meaning |
| --- | --- |
| **Worker type** | The kind of work. Modernisation and Quality Engineering are available; Full Stack Software Engineering is in build. |
| **Identity** | What the Worker is within its type. Examples: Integration modernisation, Mainframe modernisation, Test Script Generation and Execution. Some identities are listed but "Available later". |
| **Bounded context** | The one business boundary the Worker works in: what it produces and what is excluded. Modernisation contexts form a ladder: code generation → + unit tests → + traceability. |
| **Business domain / Geography** | Optional. The domain decides which Skills, languages and EVALs are included. Geography only changes which compliance checks apply. |
| **Composition / revision** | A Worker in data terms. Every confirmed change creates a new revision (r1…rn). |
| **Checkpoints** | The 8 parts a Worker is assembled from: bounded context, Worker intent, Skills, domain language, EVALs, memory and learning, Definition of Done, autonomy. Each must be confirmed. |
| **Skills / DSL / EVALs** | Instructions used during a run, business rules in a domain-specific language, and checks run against the output. |
| **Definition of Done (DoD)** | The criteria a run must meet. Release gates block a release; tracked criteria are recorded only. |
| **Harness** | The certified execution environment a Worker runs on. |
| **Package** | An immutable, versioned build of a Worker. |
| **Runtime** | A deployed instance of a Package (ECS or local). |
| **Run / verdict** | One execution, judged Met, Not met or Pending (awaiting evidence). |
| **Memory / learning** | What runs leave behind. The Worker Sentinel decides what becomes knowledge; a person writes any shared Skill changes. |
| **Sentinel** | Oversight. Each Worker has a **Worker Sentinel**; the **Platform Sentinel** oversees every Worker and can restrict or stop them. |
| **Customer delivery** | Preparing a Package (optionally with learning) for a named customer, then tracking share and acknowledgement. |

### Lifecycle

```
Compose (type → identity → bounded context → 8 checkpoints → Worker summary)
  → Build Package → Deploy as Runtime → Runs judged against the DoD
  → Memory and learning → Sentinel oversight
  → (optional) Prepare a Package for a customer
```

## 4. How the console is organised

The sidebar has three main menus:

- **Home** (`/workers`): the Worker pipeline, with tabs for **Workers**, **Packaging** and **Customer delivery**, each with its own Overview band of key figures directly under the tabs (Brain's Knowledge, Learning and Sentinel tabs work the same way). Compose (`/compose`) and the Outcomes dashboard (`/dashboard`) are reached from here.
- **Brain** (`/knowledge`, `/learning`, `/sentinel`): what Workers know (Skills, domain languages, EVALs, Definition of Done), what they have learned, and Sentinel oversight.
- **Harnesses** (`/harnesses`): the harness catalogue, certification guide, conformance reports and SDK reference.

User management (`/admin/people`, `/admin/groups`) appears only for administrators. A ⌘K menu jumps to any area.

### Key screens as they stand now

- **Workers listing** (`/workers`)
  - A carousel with one banner per **Worker type**: "View Workers" filters to that type, "Compose" starts one.
  - The "All Workers" heading has the toolbar on the same row: search, Worker type, a **Filters** button and refresh. The Filters panel holds bounded context, status, learning, Worker Sentinel and sort order.
  - One grid with no sections, paged in full rows so no page ends half-empty.
- **Worker card**
  - A type tag and runtime status on top.
  - A **UserRound** avatar (lucide) on the Worker's context hue, then the **identity** as the title, with a short **scope tag** (e.g. "Code + unit tests") and the revision underneath.
  - Two lines on what the Worker produces.
  - Three KPI tiles: Runs, Memory, Outcome. On hover the card gets a primary border and tint.
- **Worker page** (`/workers/:id`): tabs for Package, Versions and customers, Runs, Brain activity, Knowledge, Learning, Sentinel, Runtimes and Delivery. "Similar Workers" appears only on the Versions and customers tab.
- **Learning** (`/learning`): what the platform has learned, then which Workers learned something new.
  - One taxonomy for the platform and each Worker: Run experiences, Facts, Techniques (the memory engine's three memory types), Patterns (noticed or agreed across runs) and Skill changes (proposed; a person decides).
  - The landing page leads with the **learning lifecycle**: Run experiences → Knowledge (facts, techniques, patterns) → Skill changes. Each stage counts only what is recorded in it, and the rule for moving on is written on the card, so nothing reads as a one-to-one conversion. A stage is a button: the records below switch to it (category tabs inside, contributing Workers beside). Then **Needs review** (proposed Skill changes per Worker) and **Where learning is happening** (one compact row per Worker: type, domain, status, latest learning, new and to-review counts; search and one Filters button).
  - Any learning item opens in a **side panel** (`?item=<id>`) on every Learning screen: what was learned, where it stands, why, evidence runs, what happens next, related learning (opens in the same panel), the Worker's governance from Sentinel, then history and source. **Open full page** leads to `/learning/items/:id`.
  - The Worker learning page uses the same lifecycle, scoped to the Worker and ending in its revision. Choosing a stage narrows New learning and Previously recorded; Evolution keeps the runs chart and the earlier-against-recent effect.
  - Drill-downs: a category (`/learning/categories/:category`), a Worker (`/learning/workers/:id`), a Worker's category (`/learning/workers/:id/:category`) and an item (`/learning/items/:id`) with what was learned, why, evidence runs, related learning and history. The period stays in the URL; an item's breadcrumb leads back to where the reader came from.
  - Records come from `src/features/learning/model.ts`: one run experience per memory record (tied to its run), held-back patterns, agreed statements and Skill-change counts from the snapshot, plus demo facts, techniques and patterns (`demo-lessons.ts`, labelled "Demo", each tied to a real run). Periods count back from the snapshot time.
  - **What happens next** (item page) and **Evolution** (Worker learning page) come from `journey.ts`. They follow the platform's compounding rules: a run leaves a memory; something seen in 3 agreeing runs that met the Definition of Done becomes knowledge; knowledge can extend a Skill through a Skill change a person approves; an approved change ships in a new revision. Evolution shows memory, knowledge, Skill changes and revision, each run with what it taught, and earlier against recent runs (Definition of Done met, cost per run) when there are at least 4 runs. No step is shown as done beyond what the data records; Skill adoption isn't in the snapshot.
- **Platform Sentinel** (`/sentinel`): a frontend-only prototype. Its governance data is demo data, saved in this browser, and nothing it does is enforced. A notice at the top says so and has **Reset demo data**.
  - Sentinel has its own header (title, last refreshed, **Refresh**, which re-reads the saved demo data) and five tabs. Each tab except Policies has its own summary band of figures, and each figure links to a filtered list.
  - **Overview**: attention first. **Needs attention** (pending reviews, suspended sharing, proposals and monitoring findings; only findings can be dismissed) shows the top 3 with **Show all**; each row expands in place to show why, the Workers and the next step. Then **In force now** (a count per control type and the top 3 controls) beside **Recent decisions** (Worker, date, status), and four entry points: Controls, Sharing, Decision log, Policies. Stops are not attention items; they are listed as controls.
  - **Controls** (`/sentinel/controls`): three sections kept apart: **In force**, **Pending recommendations** (reviews awaiting a person, not in force) and **Lifted** (folded away). Search, type and Worker filters apply to all three. **Stop a Worker…** opens the same confirmation as the Worker drawer. A control's drawer shows who applied it, why and when, its decisions, and the actions the data supports: resume a stopped Worker, resume a suspended agreement, or change the mode in Policies. A harness block can't be lifted here.
  - **Sharing**: Worker-to-Worker agreements (filter by status, including "In force", and by pool) and Pool sharing (each pool's counts and the items eligible to be offered). The agreement drawer shows Proposed, Agreed, Delivered and Used in runs as separate stages. Approve, reject, suspend, resume and revoke ask for a reason and are refused when they are not valid.
  - **Decision log**: the integrity status, a search box and one **Filters** button (period counted back from the snapshot, decided by, effect, type, Worker, order; the button shows how many are set) and a paginated table. A decision's page shows its summary, recorded reasoning, impact per Worker, evidence, rubric ("No rubric recorded"; the data has none), related decisions, and technical integrity folded away. Reviews and follow-ups add new linked decisions, so history never changes. The hash chain is a demo, not real audit cryptography.
  - **Policies**: the status strip, editable platform defaults grouped as Enforcement, Sharing permissions and Operational limits (validated, with impact shown before saving), Worker-level overrides, and revision history.
  - `?worker=<id>`, `?agreement=<id>` and `?control=<id>` open drawers from any view. A Worker stopped here shows "Stopped by admin" on its Registry card and on its Worker page.
  - Not in the data, so not shown: autonomy promotions and demotions, receipt times, customers on receipts, and rubrics.
  - Code: `src/features/sentinel/demo/` has `types`, `platform` (real Worker records and runs), `engine` (pure, validated actions that each add a sealed decision), `seed` (deterministic), `selectors`, `integrity` and `store` (`useSyncExternalStore` plus localStorage key `aiw.sentinel-demo.v1`, with an in-memory fallback). Run health and cost findings come from the snapshot's real runs.
- **Navigation:** every sub-page (any page with breadcrumbs) has a back button beside its title. It steps back through in-app history, or goes to the nearest breadcrumb when the page was opened directly. Landing pages (Home, the Brain tabs, Harnesses) have none.
- **Compose** (`/compose` → `/compose/new` → `/compose/guided/:id`)
  - Pick a Worker type, then define the Worker: identity (unavailable ones are shown greyed out with the reason), optional domain and geography, bounded context, and an optional Worker name.
  - "Assemble automatically" decides whether it pauses at all 8 checkpoints.
  - A six-step stepper, with the live Worker panel on the **left** and the form on the right.
  - The last step is **Worker summary**, which ends with Build Package.

## 5. User flows

Each flow lists the screens in order. `→` is a step the user takes. *(demo)* marks steps that change only in-memory or browser-saved data.

### 5.1 First visit

```
/ → /home → /workers?guide=1
  → Starter guide: Compose a Worker · Package a Worker · Deliver to a customer
  → "Start" on a card jumps into that flow, or "Skip for now"
```

### 5.2 Compose a Worker (Composer)

```
Home → "Compose a Worker"            /compose
  → pick a Worker type (Modernisation, Quality Engineering; others "in build")
  → define it                        /compose/new
      identity (unavailable ones greyed out with the reason)
      optional business domain and geography
      bounded context (scope ladder), optional Worker name
      "Assemble automatically" on or off
  → guided journey                   /compose/guided/:id
      six steps; live Worker panel on the left, the form on the right
      1 Bounded context      → Confirm bounded context
      2 Worker intent        → Confirm Worker intent
      3 Worker Brain         → Confirm Skills · domain language · EVALs · memory and learning
      4 Definition of Done   → Confirm Definition of Done
      5 Autonomy             → Confirm autonomy and Sentinel
      6 Worker summary       → Build Package (demo)
  → each confirmation creates a new revision (r1…rn)
```

- Drafts are listed at `/compose/drafts` with "n of 8 confirmed". **Continue composing** reopens the journey at the first open checkpoint.
- With "Assemble automatically" on, the journey does not pause at each checkpoint.

### 5.3 Package and deploy (Packager, Operator)

```
Home → Packaging tab                 /packaging
  queues: waiting to be packaged · packaged, not deployed · deployed
  → Build Package, or "Build rN" when the Package is behind the latest revision (demo)
  → Prepare delivery (opens 5.4)
Worker page → Runtimes tab
  → Deploy again (stopped or failed ECS runtime) · Resume (only when a person stopped it)
  → a runtime's configuration       /workers/:id/runtimes/:runtimeId/configuration
```

Deploying says plainly that nothing is sent in the demo.

### 5.4 Deliver to a customer (Delivery manager)

```
Home → Customer delivery tab         /customer-delivery
  → Prepare delivery                 /customer-delivery/prepare/:packageId
      1 What the customer receives
      2 Include learning?  memory records · agreed claims · proposed Skill changes, each counted
      3 Customer
      4 Review and prepare → Preparing customer package (demo)
  → back on the tab: share and acknowledgement tracking
```

### 5.5 Find and inspect a Worker (anyone)

```
Home → Workers tab                   /workers
  → narrow: Worker-type carousel ("View Workers") · search · Worker type · Filters
    (bounded context, status, learning, Worker Sentinel, order) · refresh
  → open a card                      /workers/:id
      tabs: Package · Versions and customers (with Similar Workers) · Runs · Brain activity
            Knowledge · Learning · Sentinel · Runtimes · Delivery
  → the back button returns to the filtered list
```

### 5.6 Knowledge (Brain → Knowledge)

```
Brain → Knowledge                    /knowledge/skills
  tabs: Skills · Domain languages · EVAL Playbooks · Definition of Done · SLM Farm
  → filter by category chips or search, page through the list
  → Write a Skill                    /knowledge/capture
      Basics → Content → Files → Evaluation → Checks → Access (demo)
  → revising a Skill opens the same wizard with its fields filled
```

### 5.7 Learning (Brain → Learning)

```
Brain → Learning                     /learning
  → lifecycle: Run experiences → Knowledge → Skill changes  (?stage=)
      → choosing a stage lists its records, with category tabs and contributing Workers
      → an item opens in the side panel (?item=) → related item, evidence runs, Open full page
  → Needs review: proposed Skill changes, one per Worker → side panel
  → Where learning is happening (search, Filters, period)
      → a Worker                     /learning/workers/:id
          the same lifecycle, ending in its revision; a stage narrows the lists
          New learning · Previously recorded (folded) · Evolution (runs and effect)
  → a category                       /learning/categories/:category (also from an item's panel)
  → an item's full page              /learning/items/:id
```

The compounding path:
1. A run leaves a memory.
2. Something seen in 3 agreeing runs that met the Definition of Done becomes knowledge.
3. Knowledge can extend a Skill through a change a person approves.
4. The approved change ships in a new revision.

### 5.8 Govern with the Platform Sentinel (Operator, Administrator) *(demo)*

```
Brain → Sentinel                     /sentinel
  Overview: top 3 attention items (Show all), each expanding in place; In force now; recent decisions; entry points
  → expand an attention item → Review / Open agreement / Open Worker, or open a control's drawer
  Controls                           /sentinel/controls
    In force · Pending recommendations · Lifted
    → Stop a Worker… (reason required) → the Worker shows "Stopped by admin" everywhere
    → a control's drawer → Resume Worker · Resume agreement · change the mode in Policies
  Sharing                            /sentinel/sharing
    a stage strip (Proposed · Agreed · Delivered · Used in runs | Suspended · Rejected · Revoked); each count filters the table
    → Approve · Reject · Suspend · Resume · Revoke (each asks for a reason; invalid ones are refused)
  Decision log                       /sentinel/decisions
    → search · Filters → a decision  /sentinel/decisions/:id
    → Approve removal / Allow spread, or Decline / Withhold (adds a new linked decision)
  Policies                           /sentinel/policy
    → edit defaults → impact shown → save (a new policy revision)
```

- `?worker=`, `?agreement=` and `?control=` open the matching drawer from any Sentinel view.
- Every action appends a sealed decision, and history is never edited. **Reset demo data** restores the seed.

### 5.9 Harnesses

```
Harnesses                            /harnesses
  → a harness                        /harnesses/:key
  → Certification guide              /harnesses/certify
  → Conformance reports              /harnesses/conformance → /harnesses/conformance/:reportId
  → SDK reference                    /harnesses/sdk/:page
```

### 5.10 Administration and sign-in

```
/login → (forgot) /auth/forgot → /auth/reset
invite email → /auth/set-password
User menu → User management (administrators only)
  → People /admin/people → a person /admin/people/:personId
  → Groups /admin/groups
User menu → Jump to… (Ctrl K) · Starter guide · Sign out
```

## 6. Tech stack and code layout

- **Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui (as source in `src/components/ui`, on Radix), react-router, lucide-react icons, embla carousel, recharts.
- **Commands:** `npm run dev` (port 5182 via `.claude/launch.json`), `npm run build`, `npm run lint` (oxlint).

```
src/
  components/ui/        shadcn primitives (don't restyle here; use tokens)
  components/platform/  shared product components (hub band, hues/tags, status badges, pager, states)
  components/shell/     app shell, sidebar, navigation (nav.ts), command menu, starter guide
  features/<area>/      one folder per area: registry, worker, compose, packaging, delivery,
                        dashboard, knowledge, learning, sentinel, harnesses, admin, auth
  lib/api/              typed data layer; mock reads in lib/api/mock
  lib/types/            wire types (follow docs/product-context/data-contracts.md)
  data/mock/*.json      offline capture of 2026-10-06
  index.css             design tokens (the restyle surface)
```

- **Data:** there is no backend by default. Every read comes from the offline capture through `src/lib/api`. Set `VITE_API_MODE=live` to call the real API at `/api`.
- **Testing states:** add `?mock=loading|error|empty|refresh-error|slow` to a URL to see non-happy states.
- **Mock writes:** confirming, building and preparing change only an in-memory copy. Deploy, stop, share and publish say plainly that nothing was sent.
- **URL state:** filters, page and tab live in the URL so links are shareable.
- **Compose catalogue:** identities and bounded contexts are defined in `src/features/compose/compose-model.ts`, including identity availability and the short `scope` labels used on cards.

## 7. Design system

The design source of truth is `.claude/skills/frontend-kit/references/design.md`. Tokens live in `src/index.css`, and components never use raw hex, radius or font values.

- **Colour:** the primary is **light blue `#2774C9`** (hover `#1F64B0`, soft `#EAF3FC`, strong text `#1B5FA6`). Category hues (blue, violet, teal, cyan, amber, rose) mark *which kind of thing* something is, such as a Worker type or bounded context. Status keeps its own green, amber and red.
- **Radius:**

  | Element | Radius |
  | --- | --- |
  | Tags | 6px |
  | Controls and buttons | 10px |
  | Nested blocks | 12px |
  | Cards, the Overview band and banners | 14px |
  | Main content panel | 24px |

- **Buttons** are always rectangular (10px). Never pill-shaped.
- **Type:** Instrument Sans, with JetBrains Mono for identifiers.
- **Copy:** plain and human. Short labels, no flourishes, no "at a glance" headings or explanatory essays. Say "Not measured" or "Not reported" in words; never show unknown as 0.
- **Every data surface** has loading, empty and error states.

## 8. Repository and folders

| Folder | What it is |
| --- | --- |
| `redesign/` | **This project** — the new console. Git branch `redesign/all-phases` on `github.com/kailasds/ai-workers`. |
| `repo/` | An earlier copy of the redesign, kept for reference. |
| `app/` | The legacy console UI. A product reference only, never a design reference. |

### Brain counts (one meaning each)

| Where | Counts |
| --- | --- |
| Knowledge tab | Skills in the library |
| Learning tab and "Workers with learning" | Workers with at least one learning item |
| Sentinel tab and "Needs attention" | Items on the Sentinel Overview's attention list, from the demo governance data (pending reviews, suspended agreements, proposals, findings) |
| Activity "All activity" | Activity rows; held items with the same Worker, Skill and state are one row |

## 9. Open items

- **Tests:** `npm test` (vitest) covers the Learning model (record consistency with the Registry, evidence links, totals, periods, search, related learning) and the Sentinel demo: seed determinism, valid and invalid transitions, decision creation and chain verification, policy validation and impact, derived counts, and persistence and reset.
- **Pagination is client-side:** Learning and Sentinel lists use the shared `Pager` and `usePaged` (`src/hooks/use-paged.ts`), with page and page size in the URL. The reads they page over have no page or cursor parameters, so the console pages the complete loaded list. The portfolio API has a `next_cursor`, but the console reads it with `limit=200` in one call.
- **Not connected in this console:**
  - Stop Worker: the dialog explains it; nothing is sent.
  - Approving, retiring, revoking or replacing learned knowledge.
  - Editing platform policy.
  - Evolution proposals.
  - Sharing agreements.
  - Per-decision evidence and affected Workers.
- **Not in the offline snapshot:** brain reads for 49 of 50 Workers, and run IDs behind individual memory records.
- **Package configuration page:** Build Package (end of Compose) should first open a configuration page. Its contents are still to be defined.
- `src/features/packaging/packaging-page.tsx` sometimes shows as modified because of line-ending differences only.
- `README.md` predates several of the changes in section 4 (it still describes a grouped Registry list and the navy panel on the right). This file reflects the current state.
