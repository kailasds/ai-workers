# Screen: Packaging — `/packaging`

Source: `routes/packaging/PackagingPage.tsx`; `getPackageableCompositions`, `getWorkers`, `getDeliveryOperations` (`lib/durableApi.ts`); mock `/api/compositions/packageable`.

Rail: **Packaging** — "Seal composed Workers". Launcher tile: "Package a Worker — Build a versioned Package from a composed Worker." (CONFIRMED)

## 1. Purpose
A **queue** of composed Workers by what a person can do with them next: build a sealed, versioned **Package**, see what has been packaged, and see what is deployed. Packaging is its own destination because it is its own occasion: "the person who seals a Worker is often not the person who composed it" (CONFIRMED, nav.ts).

## 2. Primary user
Release / packaging engineer.

## 3. User jobs
Find composed Workers ready to seal; see why others are not ready; see what a Package will contain before sealing; notice that a Worker's draft moved on after it was sealed; resume a build that is already running; go on to Customer delivery.

## 4. Information available
**Queues (three; kept in URL `?queue=work|packaged|deployed`, default `work`):**
| Queue | Rule (CONFIRMED) | Hint | Row action |
|---|---|---|---|
| To package | no Package yet **and** readiness `READY_FOR_UNSIGNED_DRAFT` (ready rows); `BLOCKED` rows appear in the collapsed "Still being assembled (N)" | "Ready to build, or still assembling" | **Build Package** → `/compose/guided/{id}?station=package_deploy` |
| Packaged | has a Package and **no non-terminated Worker** exists for the composition | "Built, not yet deployed" | **Prepare delivery** (→ `/customer-delivery/prepare/{packageId}`) and **View Package** (or `Build r{n}` when stale) |
| Deployed | has a Package and a Worker whose state ≠ TERMINATED exists | "Running as a Worker" | same row layout |

Counts on the queue cards are the **estate totals** (`totals.to_package`, `.packaged`, `.deployed`) when nothing is searched; when searching they are the matching rows' counts. If the list holds fewer rows than `totals.active`: "Showing the newest {n} of {m} Workers. The counts above are for all of them." Mock: active 50 · to_package 12 · packaged 3 · deployed 35.

**Row fields:** Worker name; id (first 8 chars) · revision; status pill — "Ready to package" (neutral) / "Packaged" (success) / "Packaged at r{a} · draft at r{b}" (warning, **stale**) / the running operation ("Building Package", "Deploying Worker", "Assessing readiness", "Working") (info); bounded-context label · business domain · "composed {time}" · "packaged {time}"; "{n} Skills · {n} EVALs"; warning "Newer draft available" when stale.

**Package contents** (collapsed, 6 facts; zero is printed, not dropped): Skills · Domain Specific Language · EVALs · Definition of Done · Autonomy (operating mode: propose/approval/bounded/autonomous) · Harness ("Generic runtime" when none — "a difference worth seeing before sealing").

**Blocked rows** list each reason from the readiness read, e.g. mock codes `DRAFT_PRIMARY_AGENT_KEY` "Complete primary Agent before preparing.", `DRAFT_SKILL_NAMES`, `DRAFT_OPERATING_MODE`, `DRAFT_ALLOWED_ENVIRONMENT`, `DRAFT_DEFINITION_OF_DONE`, `DRAFT_EVALUATION_IDS` (sections: capabilities, governance, definition_of_done, …). "{n} more" when `blocking_issues` exceeds the listed ones.

**Running work** on a row: label + phase + `{progress}%` + a progress bar; row action becomes "View build" → `/compose/guided/{id}?station=package_deploy&delivery={workflowId}`. One operation per composition: the newest.

Example (mock): "QE worker 0610", r11, READY_FOR_UNSIGNED_DRAFT, 5 Skills · 1 language · 10 EVALs · 5 DoD criteria · operating_mode bounded · Quality Engineering Harness, identity PROVISIONED/UNISSUED, no package. 23 READY / 27 BLOCKED of the 50 returned; 38 have packages.

## 5. User actions
| Action | Trigger | Preconditions | Result | Failure |
|---|---|---|---|---|
| Switch queue | Queue cards / phone Section select | — | Sets `?queue=` | — |
| Search | "Search Worker or bounded context" | — | Filters name, context label, identity scope | "No matches." + Clear filters |
| Build Package / View Package / Build r{n} | Row link | — | Opens the journey's Package-and-deploy station | — |
| Prepare delivery | Row link (Packaged/Deployed rows with a Package, not running) | Package exists | Opens the delivery wizard | — |
| Customer delivery | Section header link | — | `/customer-delivery` | — |
| Retry | Error banner | Load failed | Reloads | "Could not load Packaging. The packaging list could not be loaded. Check the console API, then try again." |

## 6. Filters / search / sorting
Search (text). Sorted **newest first** in every queue (a sealed row is dated by its Package, others by their last composition change). Counts are estate-wide.

## 7. Navigation
In: rail, Launcher, Dashboard "{n} packaged", shell Work-in-progress. Out: guided Compose (package station), Customer delivery wizard, Worker.

## 8. State model
Loading ("Reading compositions…") · Loaded · Empty per queue ("No Packages built." etc.) · Error banner · Row states: ready, blocked, packaged, stale, running, deployed.
Polling: running operations re-read every **5 s**, paused while the tab is hidden; failure of that read is silent (queue stays). Workers read once to decide the Packaged/Deployed split (silent failure).

## 9. Data dependencies
`GET /compositions/packageable` (`packageable-compositions-v1`: composition_id, name, revision, identity summary, bounded_context_key, readiness, blocking_issues, issues[{code,message,section}], contents, package{id,status,composition_revision,created_at}|null, maturity{runs,runs_met,skill_changes,claims,memories,…}); `GET /workers`; `GET /delivery-operations?active=true`.

## 10. Business rules
RULE-060 Only `READY_FOR_UNSIGNED_DRAFT` drafts are offered a Build action; blocked drafts show their reasons instead. RULE-061 A Package is **stale** when its revision < the draft revision; a customer delivery prepared from a stale Package would ship a Worker that no longer matches its composition. RULE-062 A Worker with a non-terminated runtime moves from Packaged to Deployed. RULE-063 A running build is resumed, never started twice ("the workflow refuses one").

## 11. Responsive requirements (inferred)
Below 768px the three queue cards become one native "Section" select with counts in the options (CONFIRMED). Row text takes full width and the action wraps under it.

## 12. Current UI structure — LEGACY UI — NOT A DESIGN REQUIREMENT
Header → three queue cards (icon, count) → one card list per queue with hairline-divided rows → collapsed "Still being assembled".
