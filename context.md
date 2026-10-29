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

- **Home** (`/workers`): the Worker pipeline, with tabs for **Workers**, **Packaging** and **Customer delivery**, plus an Overview band of key figures. Compose (`/compose`) and the Outcomes dashboard (`/dashboard`) are reached from here.
- **Brain** (`/knowledge`, `/learning`, `/sentinel`): what Workers know (Skills, domain languages, EVALs, Definition of Done), what they have learned, and Sentinel oversight.
- **Harnesses** (`/harnesses`): the harness catalogue, certification guide, conformance reports and SDK reference.

User management (`/admin/people`, `/admin/groups`) appears only for administrators. A ⌘K menu jumps to any area.

### Key screens as they stand now

- **Workers listing** (`/workers`)
  - A carousel with one banner per **Worker type**: "View Workers" filters to that type, "Compose" starts one.
  - The "All Workers" heading has the toolbar on the same row: search, Worker type, a **Filters** button and refresh. The Filters panel holds bounded context, status, learning, Worker Sentinel and sort order.
  - One grid with no sections, paginated at two rows per page.
- **Worker card**
  - A type tag and runtime status on top.
  - The **identity** as the title, with a short **scope tag** (e.g. "Code + unit tests") and the revision underneath.
  - Two lines on what the Worker produces.
  - Three KPI tiles: Runs, Memory, Outcome. On hover the card gets a primary border and tint.
- **Worker page** (`/workers/:id`): tabs for Package, Versions and customers, Runs, Brain activity, Knowledge, Learning, Sentinel, Runtimes and Delivery. "Similar Workers" appears only on the Versions and customers tab.
- **Learning** (`/learning`)
  - **Activity** is the default view: a newest-first feed of real learning events (memory records and items held while they gather evidence), filterable by Worker and type, with a detail panel for each.
  - **Knowledge gained** keeps assigned, gained and platform knowledge apart, and shows gained knowledge by status: kept (not reported), gathering evidence, or recorded but not reviewed. It also covers knowledge health (retire, revoke, replace).
  - **Evolution** shows each identity's capability ladder and which Workers sit on each step; no proposals are recorded.
  - **Explore map** (`/learning/map`) is optional and draws only real links.
- **Platform Sentinel** (`/sentinel`)
  - **Overview** leads with what needs attention, then stops and restrictions in force, sharing status, recent decisions, setup and what it checks.
  - **Sharing** keeps the states eligible, proposed, agreed, delivered, used and suspended apart. Sharing isn't switched on yet.
  - **Decisions** has filters and a detail page; **Workers** holds coverage and Stop Worker; **Policy** separates platform-wide controls from Worker-owned settings.
  - Plan and data gaps are in `docs/learning-sentinel-plan.md`.
- **Compose** (`/compose` → `/compose/new` → `/compose/guided/:id`)
  - Pick a Worker type, then define the Worker: identity (unavailable ones are shown greyed out with the reason), optional domain and geography, bounded context, and an optional Worker name.
  - "Assemble automatically" decides whether it pauses at all 8 checkpoints.
  - A six-step stepper, with the live Worker panel on the **left** and the form on the right.
  - The last step is **Worker summary**, which ends with Build Package.

## 5. Tech stack and code layout

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

## 6. Design system

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

## 7. Repository and folders

| Folder | What it is |
| --- | --- |
| `redesign/` | **This project** — the new console. Git branch `redesign/all-phases` on `github.com/kailasds/ai-workers`. |
| `repo/` | An earlier copy of the redesign, kept for reference. |
| `app/` | The legacy console UI. A product reference only, never a design reference. |

### Brain counts (one meaning each)

| Where | Counts |
| --- | --- |
| Knowledge tab | Skills in the library |
| Learning tab and "Workers with learning" | Workers with memory records or items gathering evidence |
| Sentinel tab and "Needs attention" | Items on the Sentinel Overview's attention list (monitoring gaps, stops and restrictions, pending reviews) |
| Activity "All activity" | Activity rows; held items with the same Worker, Skill and state are one row |

## 8. Open items

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
