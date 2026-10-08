# Screen: Worker Registry — `/workers`

Source: `routes/workers/WorkersPage.tsx`, `WorkerRelaunch.tsx`, `WorkerAccess.tsx`; `lib/durableApi.ts` (`getWholeWorkerPortfolio`, `getWorkerPassport`, `getCustomerPackageDirectory`), `lib/learningView.ts` (`getFleetLearning`). Mock: `/api/worker-portfolio` (`worker-portfolio-v1`, 50 Workers).

Rail: **Registry** — "Manage Workers". Page title: "Worker Registry"; scope: "Manage deployed Workers and customer-ready packages."

## 1. Purpose
The estate-wide list of every Worker, answering **which Worker is this and what did it last do**: its owner, scope, whether anything is serving, its latest verdict, and what it has learned. It is also where customer packages are listed per Worker. It is the place to find a Worker and open it.

## 2. Primary user
Operators and engineers who manage Workers; delivery managers (customer-packages view).

## 3. User jobs
Find a Worker by name/owner/context/identity; see which are serving, stopped or need attention; see which have learned (memory records, "Evolving"); open its console; look at its runtimes; deploy/resume a stopped one; jump to its runs; switch to the customer packages list.

## 4. Information available

**Two views (URL `?view=`, default TCS-managed):** "TCS-managed Workers" and "Customer packages" (`customer`).

### 4.1 TCS-managed Workers (one row per Worker = composition)
| Information | Meaning | Source | Example (mock) | Importance |
|---|---|---|---|---|
| Thumbnail diagram | The Worker's anatomy from the snapshot alone; one link to its Package; "what the snapshot does not carry stays labelled, not filled" | `portfolioDiagram(worker, sentinel)` | — | Low (decorative-informational) |
| Name (link) | Display name; a "New" tag marks the single newest composed Worker; "Evolving" tag if the runtime reports proposed Skill changes | `name`, `created_at` | "Test Script Generation and Execution · Insurance" | High |
| Owner · context | "Owner not reported" if absent; bounded-context label (else statement) | `owner`, `bounded_context.label` | "Ancy P S · Test Automation Script Generation + Test Suite Execution + Reporting" | High |
| Revision · identity · composed date | "r11 · Identity active · composed {date}"; the short composition ID is appended **only** when another row shares name+owner+context+revision+day | `revision`, `identity.state` | — | Medium |
| Runtime | Pill: "Serving · N" (success), "Stopped · N", "Not serving", "No runtime"; tone warning if any runtime failed/unhealthy (detail "N runtime(s) failed or unhealthy"); plus substrates ("ECS", "Local") | `runtime{serving,stopped,attention,substrates}` | Serving · 1, ECS | High |
| Latest outcome | Pill: verdict word (Met / Not met / "Awaiting evidence" / "No runs"); "Outcome {time}"; "Last run {time}" (not shown when `runs === 0`) | `last_outcome` | none yet (runs: 0) | High |
| Console action | "Open Worker console" for the reachable runtime, else "Console not reachable" (serving but not healthy) or "Console needs a serving runtime" | `runtime.reachable_worker_id`, `/workers/{id}/access` | — | High |
| View runtimes / More actions → View runs | Expand detail; or open `/workers/{id}?view=runs` | — | — | — |

**Row detail (collapsed):**
- *Runtimes:* each runtime "{ECS/Local} · slot N", name, Lifecycle (+ stop reason), Health (separate observation), Observed time; Worker access routes; **Deploy again / Resume** for stopped ECS runtimes.
- *Recorded learning:* "Memory records (platform): N from M runs"; Last recorded; "Proposed Skill changes (runtime)": Reported / None reported / Reading… / Not reported / "Not observed: no serving runtime"; "GBrain facts (runtime)": N / Not read / "Not observed: no serving runtime".
- *Sentinel:* Composed ("Composed with one" / "Composed without"); Reporting (e.g. no Worker Runtime / not running).
- *Identity:* full composition ID, only when ambiguous.

**Header strip (data present, filters at top):** `totals` {workers 50, serving 1, attention 1}; `bounded_contexts` with counts — mock: Test Automation Script Generation + Test Suite Execution + Reporting (29), Converts Integration Service to Target Code (16), … Unit Tested Target Code (4), … Traced Target Code (1); `freshness` (CURRENT/DELAYED/STALE/UNAVAILABLE) and `generated_at` (shown as Updated).

### 4.2 Customer packages view
Same `CustomerPackageRow` as in Customer delivery: Worker, State, Last evidence, Create share link, Details, More actions (Record acknowledgement, Publish source). Heading "Customer packages". Empty: "No customer Packages prepared. Prepared Packages appear here with their transfer evidence. → Customer delivery".

## 5. User actions
| Action | Trigger | Preconditions | Result | Failure |
|---|---|---|---|---|
| Open Worker | Name / thumbnail | — | `/workers/{compositionId}` | — |
| Open Worker console | Row action | A runtime is reachable (running + healthy) | Opens that runtime's console via the preferred route (desktop → screen → configuration; terminal intentionally excluded) | "Console not reachable" text |
| View runtimes | Row toggle | — | Reads the Worker passport; lists runtimes | "Runtime records could not be read. The Registry record above is unchanged." |
| Deploy again | Runtime action | ECS runtime, state STOPPED or FAILED, stop reason ≠ termination_failed | Panel: choose **Current certified Runtime** or **As last time** (each with pass/fail checks for package, contract, images, cost, desktop); spending limit field; auto-stop line ("Stops on its own after N hours/minutes."); learning seed line; if **held**, a required reason | Platform refusal (PLATFORM_HOLD / HARNESS_BLOCKED): server sentence + link "Decision {id}", no retry. "The deployment options could not be read." "The Worker could not be deployed again." RESUME_REASON_* → re-reads and asks for the reason. |
| Resume | Runtime action | ECS, STOPPED, stop reason `stopped` (a person stopped it, service kept) | In-place confirm "Its service starts again with the images it had. The stop is lifted and recorded." with a spending limit and a **required reason** (recorded as a lift on the Platform Sentinel chain) | server words; platform refusal as above |
| View runs | More actions | — | `/workers/{id}?view=runs` | — |
| Search | "Search Workers" ("Search name, owner, context or identity") | — | Matches name, owner, type, context label & statement, SPIFFE id, composition id | "No Workers match these filters." + Clear filters |
| Filter / sort | Controls | — | See §6 | — |
| Refresh | Header | — | Re-reads portfolio + delivery directory | "Registry unavailable." callout |
| Load more | Pager "Next" past loaded | `next_cursor` | Reads next portfolio page (24; whole-estate read is one call of up to 200) | "The next Workers could not be read." |

## 6. Filters / search / sorting
| Control | Options | Notes |
|---|---|---|
| Sort | Most evidence (default) · Newest composed · Oldest composed | "Most evidence" ordering: newest Worker first, then Workers with memory records, then those with a MET last outcome, then healthy serving, then the rest (ties by memory count, outcome time, composed time). **Not a Learning score.** Live probes never reorder it. |
| Learning | All Workers · Has memory records · Evolving | "Evolving" only counts Workers confirmed by a live probe; probes run 4 at a time and the page says how many it has asked |
| Runtime | All · Serving · Stopped · No runtime · Needs attention | "No runtime" = no runtime still exists (failed and deploying count as existing) |
| Bounded context | All contexts + one per context | from `bounded_contexts` |
| Memory activity | All · Recent memory activity · Contradictions | `learning.recent_delta`, `.contradictions` |
| Sentinel | All · Composed with one · Composed without | — |
| Customer packages: state | All + each present state | — |

All choices live in the URL (`q`, `sort`, `context`, `runtime`, `brain`, `growth`, `sentinel`, `view`, `page`, `open`, `focus`). 20 per page. `focus=<id>` pins a just-composed Worker and opens the page holding it.

## 7. Navigation
In: rail; Dashboard cards; shell notices. Out: Worker detail (`/workers/:id`), Worker console, Customer delivery, Compose.

## 8. State model
Loading (skeleton "Reading the Worker portfolio") · Loaded · Empty ("No Workers have been composed yet. A Worker appears here once it is composed. Compose") · No matches · Error callout ("Registry unavailable.") · Partial refresh failure (list kept, header shows failed refresh). The portfolio, delivery directory, source-publication capability and fleet learning load independently; one failing never empties another.

## 9. Data dependencies
`GET /worker-portfolio?cursor=&limit=200`; `GET /customer-packages`; `GET /source-publication`; `GET /sentinel/learning`; per Worker on open: `GET /compositions/{id}/passport`; `GET /workers/{id}/access`; for serving Workers on screen: live skill-change and GBrain-fact probes; redeploy plan `GET /workers/{id}/redeploy`, `POST /workers/{id}/redeploy`, `POST /workers/{id}/resume`, `GET /workers/{id}/spending-limit`.

## 10. Business rules
RULE-090 Registry lists "deployed Workers and customer-ready packages". RULE-091 A stopped ECS Worker can be resumed only if a person stopped it; otherwise it is deployed again (RULE-092). RULE-093 Resuming/redeploying a **held** Worker requires a reason, which is recorded as a lift of the Platform Sentinel hold. RULE-094 Health is a separate observation and is never printed over a stopped/failed/terminated lifecycle. RULE-095 Green is used only for verified results; "Active", "configured", "published" and waiting states are neutral.

## 11. Responsive requirements (inferred)
At narrow width the four-column row (Worker, Runtime, Latest outcome, actions) collapses to one column; the column header row is hidden.

## 12. Current UI structure — LEGACY UI — NOT A DESIGN REQUIREMENT
Header → two-tab section nav → search + sort + filters (collapsible secondary filters) → list of 4-column records with thumbnail → pager.
