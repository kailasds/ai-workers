# Application map

Source of truth: `apps/console-ui/src/app.tsx` (route table), `src/routes/shell/nav.ts` (navigation), each route component. **Confidence: CONFIRMED** unless a cell says otherwise.

**Product:** "AI Worker Platform" — a console to *compose, package, deliver, operate, observe and govern* AI Workers ("Compose, operate and govern accountable AI workers."). React 18 + React Router 7 single-page app; every content route is **lazy-loaded**; all authenticated routes render inside **AppShell** (session check + sidebar + background-work tracker); public routes render inside **PublicFrame**.

**Route-table facts**
- 69 `<Route>` entries: 4 public, 64 inside the shell (incl. catch-alls), 1 root redirect. 12 are pure redirects; 57 render content (including `*` Not found and the `/learning/*` and `/knowledge/*` catch-alls).
- Route order is semantic: static harness routes (`certify`, `sdk`, `conformance`, `reference`) are declared **before** `/harnesses/:key`; `/sentinel/workers|decisions|policy` before `/sentinel/:dimension`; `/knowledge/<six tabs>` before `/knowledge/*`.
- Error boundaries: whole shell ("The console could not load. Reload the page."), each page, and Compose specifically ("Compose could not load. Reload the page; your saved drafts are kept.").
- Navigation rail = 9 capabilities + 1 gated admin entry. **Operate** is deliberately not in the rail (see `screens/operate.md`).
- Legacy redirects exist so old links keep working: `/compose/expert`, `/fleet/*`, `/observe/*` → `/operate`; `/govern/*` → `/dashboard`; `/knowledge/brains` → `/learning`; `/harnesses/reference*` → SDK pages; `/workers/:id/okf` → `/learning/workers/:id/okf` (query kept).

## Rail (what the person sees; labels are product vocabulary)
| Order | Label | Descriptor | Route | Gate |
|---|---|---|---|---|
| 1 | Dashboard | What Workers deliver | /dashboard | — |
| 2 | Compose | Create Workers | /compose | — |
| 3 | Packaging | Seal composed Workers | /packaging | — |
| 4 | Customer delivery | Prepare for a customer | /customer-delivery | — |
| 5 | Registry | Manage Workers | /workers | — |
| 6 | Knowledge | TCS knowledge | /knowledge | — |
| 7 | Learning | What Workers add | /learning | — |
| 8 | Sentinel | Oversight | /sentinel | — |
| 9 | Harnesses | Build and certify | /harnesses | — |
| foot | User management | People and groups | /admin/people | feature `users.manage` |

## Route table
Columns: Area | Route | Purpose | Main data | Main actions | Important states | Related routes. "Screen doc" is the file in `screens/`.

| Area | Route | Purpose | Main data | Main actions | Important states | Related routes | Screen doc |
|---|---|---|---|---|---|---|---|
| Access (public) | `/login` | Sign in with platform identity | username, password; session context (env · realm) | Sign in | 10 named failure kinds (invalid, locked, rate-limited, IdP down, offline, not provisioned, disabled, invite pending, network-restricted, server error) | `/auth/forgot`, `/home` | auth-and-shell |
| Access (public) | `/auth/forgot` | Request a password-reset link | email | Send link | Account-agnostic confirmation; error | `/login` | auth-and-shell |
| Access (public) | `/auth/set-password?token=` | Accept an invite: set first password | token → name/role; password rules | Set password and activate | link incomplete / expired / checking / done | `/login` | auth-and-shell |
| Access (public) | `/auth/reset?token=` | Choose a new password | same | Set new password | same | `/login` | auth-and-shell |
| Home | `/` | Redirect → `/home` | — | — | — | — | auth-and-shell |
| Home | `/home` | Launcher: pick a workspace | 3 constant tiles | Open Compose / Packaging / Customer delivery | — | the three | auth-and-shell |
| Dashboard | `/dashboard` (`?period=7d|30d|90d|all`, `?page=`) | Outcomes, DoD, cost across the estate | `dashboard-executive-v4` | Change period, refresh, open run | loading / error / stale / empty / unmeasured | `/workers`, `/packaging`, `/workers/:id?view=runs&run=` | dashboard |
| Compose | `/compose` | New Worker declaration (4 decisions), then guided assembly | worker types, identities, domains, geographies, contexts | Choose, Confirm identity | phase type/assign/resuming/assembling | `/compose/drafts` | compose |
| Compose | `/compose/guided/:compositionId` (`?mode`, `step`, `checkpoint`, `part`, `view`, `restart`, `station`, `delivery`) | Open/resume a draft; confirm stages; package & deploy | composition, stage runs, compose experience | Confirm checkpoint, Edit, Package and deploy | station states, stage states, composed | `/packaging`, `/workers/:id` | compose |
| Compose | `/compose/:compositionId` | Alias of guided | same | same | same | same | compose |
| Compose | `/compose/expert` | Redirect → `/compose` | — | — | — | — | compose |
| Compose | `/compose/drafts` | Saved drafts list | compositions | Continue, New Worker, Archive (admin) | empty / error / archive confirm | `/compose` | saved-drafts |
| Packaging | `/packaging` (`?queue=work|packaged|deployed`) | Queue of composed Workers by packaging stage | packageable compositions, workers, delivery operations | Build Package, View Package, Prepare delivery | ready / blocked / stale / running | `/compose/guided/:id?station=package_deploy`, `/customer-delivery/prepare/:pkg` | packaging |
| Customer delivery | `/customer-delivery` (`?view=delivered`, `q`, `learned`, `state`, `page`, `open`) | Choose what to prepare; track what has gone out | packageable + customer packages | Prepare, Share link, Acknowledge, Publish source | eligibility unknown / partial / per-state | wizard, Worker | customer-delivery |
| Customer delivery | `/customer-delivery/prepare/:packageId` | 4-step wizard: Contents · Learning · Customer · Review | holdings, matured offer | Narrow Skills, Prepare delivery | idle/starting/running/succeeded/failed/interrupted | `/customer-delivery?view=delivered` | delivery-wizard |
| Operate | `/operate` | Runtime & package operations console (not in rail) | workers, operations, summary | Stop, Terminate, Deploy again, Resume, Download, local deploy | pending / error / dropped | Registry | operate |
| Registry | `/workers` (`?view=tcs|customer`, `q`, `sort`, `context`, `runtime`, `brain`, `growth`, `sentinel`, `page`, `open`, `focus`) | List every Worker; customer packages | worker portfolio, delivery directory | Search/filter, open, runtimes, Deploy again, Resume | serving / stopped / attention; loading / empty / error | Worker detail | registry |
| Worker | `/workers/:compositionId` (`?view=overview|runs|brain|knowledge|learning|sentinel|runtimes|delivery` + legacy `passport|instructions|dod`, `run`, `package`, `brain`, `sentinel`) | One Worker's Package, runs, memory, learning, Sentinel, runtimes, delivery, identity | worker passport (+ many) | Pause/Resume/Revoke identity, Run sample, Deploy again, Prepare customer package | identity states, runtime states, per-view | Compose, Learning, config | worker-detail |
| Worker | `/workers/:compositionId/okf` | Redirect → Learning OKF browser (query kept) | — | — | — | — | okf-browser |
| Worker | `/workers/:compositionId/runtimes/:workerId/configuration` (`?section=`) | Post-deploy configuration & maintenance | maintenance schema + config (ETag) | Save changes | unsaved / restart required / applies live | Worker detail, Learning routing | worker-configuration |
| Knowledge | `/knowledge` | Redirect → `/knowledge/skills` | — | — | — | — | knowledge-library |
| Knowledge | `/knowledge/skills` | Skill library | Skills registry | Search, filter, open, Write/Revise a Skill | partial registry | `/knowledge/capture` | knowledge-library |
| Knowledge | `/knowledge/languages` | Domain Specific Languages by business hierarchy | DSL catalogue, hierarchy, graph | Browse, open | unfiled, not available to Workers | — | knowledge-library |
| Knowledge | `/knowledge/evals` | EVAL playbooks, assigned vs inherited | eval catalogue, hierarchy, golden dataset | Browse, open | no rubric stored | — | knowledge-library |
| Knowledge | `/knowledge/dod` | Definition-of-Done scopes and criteria | DoD library + run evidence | Browse | in_build, not graded | — | knowledge-library |
| Knowledge | `/knowledge/models` | Fine-tuned small models (SLM Farm) | small models | Browse | empty | — | knowledge-library |
| Knowledge | `/knowledge/capture` | Write/Revise a Skill wizard (6 steps) | Skill draft/check/publish | Draft, Check, Publish | publishable / blocked | `/knowledge/skills` | knowledge-library |
| Knowledge | `/knowledge/brains` | Redirect → `/learning` | — | — | — | — | learning-fleet |
| Knowledge | `/knowledge/*` (`coverage`, `inbox`, `packs`; else → `/learning`) | Knowledge governance (candidate decisions, packs, coverage) | knowledge coverage/items/packs | Promote / Defer / Reject, view diff | lane customer unavailable, stale | `/knowledge/skills` | knowledge-governance |
| Learning | `/learning`, `/learning/workers`, `/learning/*` | Rank Workers by what they learned | `learning-workers-v1` | Period, search, sort, open | unreported / partial / stopped | per-Worker | learning-fleet |
| Learning | `/learning/shared` (via `/learning/*`) | Declared (inactive) sharing by bounded context | portfolio + sharing | View Workers | "declared, not active" | Sharing | learning-fleet |
| Learning | `/learning/workers/:compositionId` | One Worker's learning overview (OKF, GBrain, effect, Sentinel sidecar) | `learning-worker-v1` | Explore sub-pages | live vs platform copy; stopped | all below | worker-learning |
| Learning | `…/okf` (`?path`, `mode`, `proposal`, `worker`, `rev`) | Browse/edit the knowledge the Worker runs with | OKF bundle + edit API | Propose / Approve / Decline / Withdraw / Restore | proposal states | Skills, Facts | okf-browser |
| Learning | `…/brain/:card` | Items of one GBrain record type | items | Open evidence | card states | evidence | worker-learning |
| Learning | `…/brain/:card/:itemId` | Evidence for one item | item evidence | — | retained / withheld | — | worker-learning |
| Learning | `…/effect` | Before/after learning effect | `learning-effect-v1` | Pick a run | not comparable | — | worker-learning |
| Learning | `…/skills` | Skills in the bundle + SKILL.md | OKF bundle | Select | — | OKF | worker-learning |
| Learning | `…/skills/:changeIndex` | One proposed Skill change (diff + evidence) | skill changes | — | no longer reported | — | worker-learning |
| Learning | `…/facts` | Landscape/experience facts | OKF bundle | Select | — | OKF | worker-learning |
| Learning | `…/sharing` | Sharing grants & settings | sharing doc | — | declared, not active | settings in Maintenance | worker-learning |
| Learning | `…/records` (`?class`) | All records the platform holds, by class | records | Show older | metadata-only / off | record | worker-learning |
| Learning | `…/records/:recordClass/:recordId` | One record with redaction receipt | record detail | — | withheld / unlearned | — | worker-learning |
| Learning | `…/sync` | Learning data-transfer mode & redaction | sync status | — | full / metadata only / off | records | worker-learning |
| Learning | `…/routing` | Model routing view for the Worker | routing view | Adopt / revert | stopped Worker | configuration | worker-learning |
| Learning | `…/sentinel` (`?decision`) | Worker Sentinel decision log | decisions | Filter, open | chain unverified | decision | worker-learning |
| Learning | `…/sentinel/:decisionId` | One decision in Worker context | platform decision | — | — | Sentinel | sentinel |
| Sentinel | `/sentinel` | Platform Sentinel overview | `platform-sentinel-overview-v1` | Open dimension / filter | not acting | — | sentinel |
| Sentinel | `/sentinel/workers` (`?filter`) | Per-Worker coverage; stop a Worker | portfolio + fleet learning | Stop Worker | per-runtime stop states | Worker | sentinel |
| Sentinel | `/sentinel/decisions` | Platform decision log | `platform-sentinel-decisions-v1` | Filter, open | — | decision | sentinel |
| Sentinel | `/sentinel/decisions/:decisionId` | One platform decision | decision doc | — | applied / pending / not confirmed | Worker | sentinel |
| Sentinel | `/sentinel/policy` | Platform rules in force (admin) | policy doc | read | forbidden for non-admin | — | sentinel |
| Sentinel | `/sentinel/:dimension` (monitor, enforce, align, control, unlearn) | One dimension: rubric + panel + decisions | dimension doc | read | not built | — | sentinel |
| Harnesses | `/harnesses` | Catalogue of execution adapters | harness catalogue | open, Certification guide | availability | harness | harnesses |
| Harnesses | `/harnesses/:key` | One harness: manifest facts | harness detail | read | no manifest | — | harnesses |
| Harnesses | `/harnesses/certify` | 5-step certification guide + status table | catalogue + reports | read | — | conformance | harnesses |
| Harnesses | `/harnesses/conformance` | Conformance report cards | reports | open | admitted/checked/rejected | report | harnesses |
| Harnesses | `/harnesses/conformance/:reportId` | One report: 15 checks | report | Download JSON | pass/fail/pending | — | harnesses |
| Harnesses | `/harnesses/sdk` | Redirect → `/harnesses/sdk/overview` | — | — | — | — | harnesses |
| Harnesses | `/harnesses/sdk/:page` | SDK reference (14 pages) | contract doc | read | contract unreadable | — | harnesses |
| Harnesses | `/harnesses/reference`, `/harnesses/reference/:page` | Redirects to SDK pages | — | — | — | — | harnesses |
| Admin | `/admin` | Redirect → `/admin/people` | — | — | — | — | admin-people-groups |
| Admin | `/admin/people` | People list | users + catalog | Invite, resend, disable/enable | active / awaiting / disabled | person | admin-people-groups |
| Admin | `/admin/people/:personId` | Invite / edit a person | user + catalog | Save | dirty / saving / problem | groups | admin-people-groups |
| Admin | `/admin/groups` | Groups | groups + catalog | Create / edit / delete | — | people | admin-people-groups |
| Legacy | `/fleet/*`, `/observe/*` | Redirect → `/operate` | — | — | — | — | operate |
| Legacy | `/govern/*` | Redirect → `/dashboard` | — | — | — | — | dashboard |
| Fallback | `*` | Not found (inside shell) | — | go to nearest section | — | — | auth-and-shell |

## Shells and cross-route behaviour
- **AppShell** (all authenticated routes): verifies `GET /auth/me` + `/auth/permissions` on **every navigation**; polls active delivery operations every 15 s; raises completion notices; sidebar; phone Menu. See `screens/auth-and-shell.md`.
- **PublicFrame** (login & recovery): page + fixed TCS watermark.
- **"Came from" memory:** many pages accept router state (`from`) so a Back link names where the person came from (e.g. "Back to Dashboard", "Back to Learning"); lists keep page/filter/search/open record **in the URL** so Back restores them.
- **Deep links that write nothing:** `?station=package_deploy`, `?checkpoint=`, `?view=`, `?run=` only select what to show.

## Entity → screens cheat-sheet
Worker (composition): Compose, Saved drafts, Packaging, Registry, Worker detail, Learning, Sentinel · Package: Packaging, Customer delivery, Delivery wizard, Worker detail › Delivery · Runtime: Registry, Worker detail › Runtimes, Operate, Configuration · Run: Dashboard ledger, Worker detail › Runs · Skill/DSL/EVAL/DoD: Knowledge, Compose, Delivery wizard · Memory/knowledge items: Worker detail, Learning, OKF browser, Knowledge governance · Sentinel decisions: Learning (Worker), Sentinel (platform) · Person/Group: Admin.
