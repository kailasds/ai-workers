# Screen: Operate — `/operate`

Source: `routes/operate/OperatePage.tsx`; legacy redirects `/fleet/*` and `/observe/*` → `/operate`.

**Not in the navigation rail, on purpose, and "taken out twice"**: it duplicates the Registry (every Worker, its state and runtimes). The route still resolves, and the shell's "Work in progress" panel links to it for packaging/deployment work needing a decision. "Do not add it back, and do not add new links to it." (CONFIRMED, nav.ts). A new UI should treat Operate as **a set of capabilities to fold into the Registry/Worker detail**, not as a destination.

## 1. Purpose
Operational control of running **runtimes** and **package operations**: stop, terminate, deploy again, resume, download a package, deploy locally, and see delivery/deployment activity.

## 2. Primary user
Platform operator.

## 3. User jobs
See what is running and healthy; stop or terminate a runtime; relaunch a stopped one; follow packaging/deploy operations; cancel/resume an operation; download a package; start a local deploy; edit a runtime's model routing configuration.

## 4. Information available
- **Operations summary** (links to sections): Running runtimes, Healthy runtimes, Active operations, Needs attention (from `/dashboard/summary` — "Not reported" when absent).
- **Workers (runtimes) table:** per runtime — name, "Worker {id8} · deployed {time}", image, state/health/stop reason, target (ECS/Local), actions. Stopped runtimes are hidden behind "Show N stopped runtimes" unless a filter is active. A runtime being terminated (termination_failed) is "not stopped": Stop is withheld because it "would make it resumable and end the retry".
- **Selected runtime detail:** Access (routes), Package contents (component id, kind, delivery mode, state), Runtime modules (Memory, Learning candidates, Evaluations, Telemetry, Sentinel), Configuration (model routing, session affinity, memory retention days, memory visibility, learning export tier, sentinel mode).
- **Package operations** (records of Packages by composition with state; "Download package" when ready; local deploy "Runs on this host through the deploy broker and stays up until it is stopped.").
- **Delivery activity:** "N active|recent operation(s) · newest first" (paged).

## 5. User actions
| Action | Trigger | Preconditions | Result | Failure |
|---|---|---|---|---|
| Stop runtime | More actions | Running, not termination_failed | In-place confirm naming the one runtime: "A run in progress on this runtime is interrupted. Other runtimes of this Worker keep running." **Reason required** (`reasonReady`) — recorded as a Platform Sentinel decision; shows "Stopped · {name}" + "Decision {id}" link, or "the reason could not be recorded" | Dropped request → "The connection dropped before the console answered. The list shows what the platform recorded afterwards." |
| Terminate runtime | More actions (destructive) | — | In-place confirm: "The runtime is ended and removed. It cannot be resumed; the Worker's record, packages and runs stay in the Registry." (also destroys the service, its secret and its staged package) | Same dropped-request handling (a terminate that lost its answer had usually terminated) |
| Deploy again / Resume | Row | See Registry | See Registry | See Registry |
| Cancel / Resume an operation | Operation row | Workflow state allows | `POST /workflows/{id}/cancel|resume` | "The operation could not be updated." / "Lost track of this operation." |
| Deploy locally | Package row | Spending limit entered ("Enter a spending limit to deploy.") | `POST /package-drafts/{id}/deployments/local`, polls the local operation every 2 s up to 180 s | Broker's reason (e.g. a full host, F74) |
| Download package | Package row | Package ready | Downloads the sealed artifact | — |
| Save configuration | Runtime detail | Editable | Updates runtime configuration | "Configuration could not be saved." |
| Search | "Search Workers and Packages" | — | Filters | — |

## 6. Filters / search / sorting
Free-text search; "Show stopped runtimes" toggle; delivery activity paged ("active only" via URL).

## 7. Navigation
In: shell "Work in progress" → "View all". Out: Sentinel decisions ("Decision {id}").

## 8. State model
Loading · Loaded · "Could not load Operate." + Retry · Action pending per row · Action error callout (danger, or warning "The console did not answer.") · Info callout "Lost track of this operation."

## 9. Data dependencies
`/dashboard/summary`, `/workers`, `/operations`, `/delivery-operations`, `/workers/{id}/components`, `/workers/{id}/status`, `/workers/{id}/configuration`, `/compositions/{id}/brain`, stop/terminate/redeploy/resume, `/workflows/{id}`.

## 10. Business rules
RULE-120 Stopping requires a reason and is recorded in the Platform Sentinel chain. RULE-121 Terminate is irreversible for the runtime but preserves the Worker's record, packages and runs. RULE-122 Deploying anything (local, ECS, Deploy again, Resume) requires a **spending limit** choice (RULE-031).

## 11. Responsive requirements — UNKNOWN (tables with labelled cells; not examined further).

## 12. Current UI structure — LEGACY UI — NOT A DESIGN REQUIREMENT
Summary strip → Workers table with in-row confirm panels → Package operations table → Delivery activity table.
