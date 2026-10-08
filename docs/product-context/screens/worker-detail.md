# Screen: Worker detail ("Passport") — `/workers/:compositionId`

Source: `routes/workers/PassportPage.tsx` (+ `RunHistory`, `WorkerRuns`, `WorkerRunTrace`, `WorkerBrainDetail`, `WorkerBrainRuns`, `WorkerSentinelLive`, `SampleVault`, `WorkerCarrying`, `MemoryRecords`, `routing/*`); `lib/durableApi.ts` (`WorkerPassport`, `PortfolioWorker`, `WorkerRecord`).

Redirect: `/workers/:compositionId/okf` → `/learning/workers/:id/okf` (query kept).

## 1. Purpose
Everything about **one Worker**, in one place: what it is (Package), what it did (Runs), its memory (Brain activity), what it knows (Knowledge), what it learned (Learning), how it is watched (Sentinel), where it runs (Runtimes) and what has gone to customers (Delivery). A Worker is a composition + its sealed Packages + its runtimes. (CONFIRMED)

## 2. Primary user
Operator / engineer responsible for a Worker; reviewer asking "why did it do that".

## 3. User jobs
Inspect identity and accountability; read the Package (anatomy: bounded context, Worker intent, Brain, Definition of Done, Autonomy, Runtime); open a run and read its verdict and evidence; see routing and cost per run; read memory; open Learning; read the Sentinel configured vs running; see runtimes and redeploy/resume; run a sample; prepare a customer package; **pause / resume / revoke the identity**; open the Worker console; create a new revision (go to Compose).

## 4. Information available

**Header (CONFIRMED):** breadcrumb Registry › {name} (or "Back to {calling page}"), name, **Open Worker console** (if a runtime is serving; else "Console unavailable · …" / "No runtime is serving · …"), "Edit" → `/compose/guided/{id}` ("Create new revision"). A Section nav (tabs on desktop, one select under 768px) with the eight views.

**Views (`?view=`; default `overview`):**
| View key | Tab label | Content |
|---|---|---|
| overview | Package | First facts (Runtime, Latest outcome, …); the **Package explorer**: a diagram of the Worker's six parts and a detail panel per part. Parts: *Identity and bounded context*, *Worker intent* (outcome, harness, tools, model routing), *Brain* (Skills added, Domain Specific Language (DSL), EVALs, GBrain, Sentinel), *Definition of Done* (N criteria), *Autonomy* (level, geography, spending limit receipt), *Runtime* (target, auto-stop "Stops automatically after N hours" / "Runs until an operator stops it"). Each part has an **Edit** link into Compose (`?mode=review&checkpoint=<station>&part=…`). Only a built Package has an assembly record: "Not reported: this Package carries no assembly record". |
| runs | Runs | Live run list per serving runtime (Run, Converted from→to, Verdict, Definition of Done with "How this was measured") + **Runs and routing** history kept by the platform ("survives the runtime that produced it"): table Run · Pathway · Verdict · Tokens · Cost · Independent check · Finished; "Did routing to cheaper models hold up" (Routing by tier). Opening a run shows its trace. |
| brain | Brain activity | The memory engine's activity (WorkerBrainRuns / WorkerBrainDetail) |
| knowledge | Knowledge | "Memory engine": this Worker's **own** brain, "Separate from Knowledge, which is reviewed and shared across Workers" + memory records |
| learning | Learning | Summary, "Open Learning page" → `/learning/workers/{id}` |
| sentinel | Sentinel | Two sub-views: **Configured** (the Package's policy; "From Package · r{n} · {state}"; "No authority is inferred when configuration is absent") and **Running** (what each serving runtime's own Runtime applies now; per-runtime live panel + read-only routing card) |
| runtimes | Runtimes | Table: Runtime · State and health · Package (and "Older than Package r{n}") · Created and last seen · Actions (Deploy again / Resume). Footer counts "N running · N deploying · N stopped · N failed · N terminated". Note: "Redeploy updates the Worker Runtime only. The harness image comes from the Package." Empty: "This Worker is composed and has no runtime. Deploy it from Packaging." Plus **Run sample** (below). |
| delivery | Delivery | "Customer packages prepared from this Worker and their transfer evidence." Package source publication state; the same customer-package rows; **Prepare customer package** (opens the delivery wizard for the newest ready Package). |

**Legacy views still reachable by URL and rendered inside Package:** `passport`, `instructions`, `dod`. They contain:
- **Identity:** status (+ credential detail), Worker ID, SPIFFE ID, Credential kind, Audience, Lifetime ("N minutes"), Issued ("Not yet issued"). "What this identity may do" (bounded scope) and "And may not" (excluded list: "Each of these is refused at run time, not merely discouraged."). Caution: "A JWT-SVID is a bearer token, not a certificate…revoking stops issuance rather than recalling what is already out."
- **Definition of Done:** per criterion: title, threshold, owner, adjudicator, measurable?, method, skill ref, detail.
- **Scope and models:** Kind of work, Harness, Generating model, Verifying model, out-of-scope.
- **What this Worker's owner may change:** the `configurable` fields — path, label, mode (exposure), meaning, current value, min/max, allowed values — "Includes the fixed ones" so a recipient knows what is locked.
- **Worker intent:** Owned outcome, Harness, Operating boundary, Explicit exclusions; "Editing creates the next immutable revision. This view never changes a deployed Worker in place."

**Run sample (Runtimes view):** list of small **synthetic** source archives (`contains_credentials: false`; key, name, summary, source/target technology, filename, size, sha256) that can be downloaded and submitted to the runtime chosen. States of a submitted run: `submitting` ("Accepted — the harness is unpacking and analysing it."), `refused` ("The harness refused this archive."), `interrupted` ("Interrupted when the Worker restarted. Submit the archive again."). Requires a **running and healthy** runtime; with several, the person must choose which ("never silently the first one").

## 5. User actions
| Action | Trigger | Preconditions | Result | Failure |
|---|---|---|---|---|
| Pause identity | Identity controls | Identity not REVOKED, not already PAUSED | `POST /compositions/{id}/identity/pause` — the identity realm is changed **before** anything is recorded | Error text shown ("The change could not be applied.") — silence would report a revocation that did not happen |
| Resume identity | Same | Status PAUSED | `…/identity/resume` | same |
| Revoke identity | "Revoke" → type the Worker's exact name to confirm | Not REVOKED; typed text equals the name | `…/identity/revoke`. **Terminal.** "Revoking stops this Worker authenticating to anything. Every runtime it has loses access when its current credential expires, and the identity cannot be issued again." | same |
| Deploy again / Resume (runtime) | Runtime actions | See Registry | See Registry | See Registry |
| Open Worker console | Header | Runtime serving | Opens the preferred access route | — |
| Run sample | Run sample | Healthy runtime chosen | Downloads/submits the archive; result appears in Runs | Per state above |
| Prepare customer package | Delivery view | A ready Package exists | Delivery wizard | — |
| Open run | Runs row ("View result"/"View live run") | — | Run trace (`?run=`) | "What this Worker has done could not be read." / "This Worker could not be reached." |
| Switch Sentinel view | Configured / Running | — | `?sentinel=` | — |
| Edit part | Package explorer | — | Compose at that checkpoint | — |
| Configure runtime | (Runtimes → configuration) | A runtime exists | `/workers/:id/runtimes/:runtimeId/configuration` | — |

## 6. Filters / search / sorting
Run list: sorted newest first (by completion). Memory records: filterable (type, contradicted, include archived) — see Learning. No search.

## 7. Navigation
In: Registry, Dashboard ledger ("View run" → `?view=runs&run=`), Launcher/Compose, shell notices (`/workers/{id}` after a deployment finishes), Learning. Out: Compose (edit / new revision), Learning Worker page, runtime configuration, Customer delivery wizard, Sentinel decisions. A `from` state lets "Back to …" return to the caller.

## 8. State model
Loading ("Loading Worker…") · Not found/archived ("It may have been archived, or the console could not reach it.") · Loaded · per-view loading/empty/error. If the id in the URL is a *runtime* id, the page redirects to its composition (keeping the `view` query). Identity states: `PROVISIONED | ACTIVE | PAUSED | REVOKED`; credential states `UNISSUED | ISSUED | DISABLED | UNAVAILABLE`. A page reading Sentinel/portfolio fails inside its own view rather than taking the page down.

## 9. Data dependencies
`GET /compositions/{id}/passport` (`worker-passport-v1`, one assembled read "rather than four requests" so identity, scope and runtimes appear at one moment); `GET /compositions/{id}`; `GET /worker-portfolio`; `GET /compositions/{id}/memories`; `GET /compositions/{id}/brain`; `GET /workers/{id}/runs`, `/workers/{id}/ui/api/worker/runs/{runId}`; `GET /customer-packages`; `GET /package-drafts/{id}/source`; `POST /compositions/{id}/identity/{pause|resume|revoke}`; `GET /sample-archives/{key}/download`.

## 10. Business rules
RULE-100 Revoke is irreversible and never re-issued (reviving it would revalidate any credential minted before revocation for the rest of its lifetime). RULE-101 Credentials are bearer tokens with a short TTL (mock: 600 s); the credential itself is never stored or shown. RULE-102 A Worker's authority is recorded **at issuance** (bounded scope + exclusions), not read from the current draft — a later edit is a new grant. RULE-103 Editing a Worker never mutates a deployed Worker: it creates the next immutable revision. RULE-104 A run's verdict belongs to the Worker (adjudication is the Worker's act); the console keeps no private copy it might later disagree with. RULE-105 "Unknown" ≠ "none": an unreachable Worker has not been shown to have done nothing (`reachable:false`).

## 11. Responsive requirements (inferred)
Tabs become a "Section" select below 768px. Runtime table collapses to labelled records. On a phone the Package explorer's detail sits below the list; choosing a part scrolls its heading into view.

## 12. Current UI structure — LEGACY UI — NOT A DESIGN REQUIREMENT
Header + evidence tiles + 8-tab strip → one view. Package view = left "Worker diagram" map + right per-part detail panel.
