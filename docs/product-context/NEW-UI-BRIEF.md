# NEW UI BRIEF — AI Worker Platform console

**Audience:** the next Claude instance (or designer/engineer) building a completely fresh UI.
**Read first:** this file. **Then, as needed:** `application-map.md` (every route), `domain-model.md` (entities, real data), `workflows.md`, `business-rules.md` (126 rules), `data-contracts.md`, `shared-patterns.md`, `legacy-vs-requirement.md`, `screens/*.md` (per-screen detail).
**Evidence standard:** every statement in these docs is marked CONFIRMED / INFERRED / UNKNOWN and traced to code, comments, tests or the offline data capture (`apps/console-ui/offline-mock/routes.json`, 2026-10-06). The current UI is **not** a design reference — its layout, colour, components and navigation are explicitly legacy.

---

## 1. Product
**AI Worker Platform** is a control console for *creating, packaging, delivering, running, observing and governing AI Workers* — accountable, bounded AI agents with an owner, a cryptographic identity, a defined scope, a **Definition of Done** that is measured on every run, and a **Sentinel** that oversees what they learn and do. Tagline in the product: *"Compose, operate and govern accountable AI workers."* Operated by Tata Consultancy Services (TCS) for its own delivery teams and for handing finished Workers to customers (BFSI-centred: insurance, payments, lending, wealth, QE, integration modernisation).

The product is **honesty-first**: it distinguishes measured vs unmeasured, applied vs recorded, served vs shadow, declared vs enforced, unknown vs none. A redesign that "cleans up" these distinctions into simpler numbers or green ticks breaks the product.

## 2. Users (INFERRED from permissions, copy and code comments)
| User | Needs | Evidence |
|---|---|---|
| **Composer** | Define a Worker confidently; see *why* each part was chosen; revise safely | role "Composer: composes and edits Workers. Cannot deploy or run them." |
| **Packager / release engineer** | Seal a versioned Package; know it matches the latest composition; see what's inside | Packaging exists because "the person who seals a Worker is often not the person who composed it" |
| **Operator** | Deploy under a spending limit, watch health, stop/resume/redeploy, run a sample | role "Builds, deploys and runs Workers. Cannot change what a Worker is." |
| **Delivery manager** | Prepare a Package for a named customer, optionally with what the Worker learned; track transfer evidence | Customer delivery area |
| **Delivery lead / executive** | See what Workers delivered, whether they met their bar, and what it cost | Dashboard "executive" projection |
| **Reviewer / auditor** | Read evidence: runs, decisions, passports, DoD results; export | role "Auditor: reads evidence" |
| **Knowledge steward** | Curate Skills, languages, EVALs, DoD; decide what shared knowledge is admitted | Knowledge area |
| **Platform governor** | Oversee the whole fleet; read decisions; stop a Worker; set platform rules | Sentinel area |
| **Harness engineer / vendor** | Build and certify an execution harness; read the SDK | Harnesses area (readable by all sessions) |
| **Administrator** | Onboard people, roles, groups | Admin area (`users.manage`) |
| **Customer operator** (downstream) | Receives a Package; later changes only what they were allowed to | "what may I change" configuration field list |

## 3. Core concepts (shared vocabulary — keep these words)
- **Worker** (composition): the accountable unit. **Revision**: an immutable numbered version of its definition.
- **Worker type → Identity → Business domain → Geography → Bounded context**: the declaration. A *bounded context* is the single business boundary a Worker works in (what it produces, its procedure, what it includes and refuses). Contexts form a **ladder**; a Worker may be allowed to **grow** up it on evidence.
- **Instructions** (10 sections) and **Pattern**; **Agent**(s), **Skills**, **Domain Specific Languages (DSL)**, **Tools/Resources**, **Harness**, **Environment**, **Models**, **Memory**, **Learning**, **Interaction**, **EVALs**, **Definition of Done (DoD)**, **Governance** (operating mode, autonomy level, Sentinel, configuration exposure, growth).
- **Package**: sealed, versioned, checksummed artifact; **Customer delivery**: a Package prepared for a named customer; **Runtime**: a deployed instance (ECS or local); **Run**: one execution, judged → **verdict** (Met / Not met / Awaiting evidence); **Spending limit**: monthly cap set at deployment.
- **Knowledge** (library, people-authored) vs **Learning** (record of what Workers added): memory, experience, candidate, **OKF** (the knowledge bundle a Worker runs with), proposed **Skill change**.
- **Sentinel**: *Worker Sentinel* (inside each Worker) and *Platform Sentinel* (fleet), five dimensions **Monitor, Enforce, Align, Control, Unlearn**; decisions are hash-chained; mode is *Decides* (shadow/enforce) and *Applies* (yes/no) — two facts.
- **Identity** (SPIFFE id, short-lived bearer credential): pause / resume / **revoke (terminal)**.

## 4. Primary workflows (detail in `workflows.md`)
1 Sign in / recover / onboard · 2 **Create a Worker** (auto-assemble or review 8 checkpoints) · 3 Resume/revise · 4 **Package** · 5 **Deploy** (target, spending limit, lifetime) · 6 Inspect Worker and run · 7 **Lifecycle** (stop with reason / resume / deploy again / terminate) · 8 Identity pause/revoke · 9 Post-deploy configuration · 10 **Customer delivery** (narrow Skills, include learning, name customer, share, acknowledge, publish source) · 11 Write/revise a Skill · 12 Change a Worker's knowledge (propose → gates → second person) · 13 Govern shared knowledge · 14 Inspect learning · 15 Oversight (Sentinel decisions, stop a Worker) · 16 Certify a harness (guide) · 17 Archive draft · 18 Follow background work.

## 5. Required screens (capabilities, not layouts)
The new IA may merge/split these freely. **Each must be reachable, deep-linkable, and carry the info and actions in its `screens/` file.**
| Capability | What it is for | Detail |
|---|---|---|
| Sign-in & recovery (4 public routes) | Access | `auth-and-shell.md` |
| Launcher / entry | Choose Compose / Package / Deliver | same |
| Outcomes overview ("Dashboard") | What Workers delivered, DoD, cost, run ledger | `dashboard.md` |
| Worker creation (declaration + guided assembly) | Compose | `compose.md` |
| Draft list | Continue / archive | `saved-drafts.md` |
| Packaging queue | Seal Workers | `packaging.md` |
| Delivery queue + records | Prepare/track | `customer-delivery.md` |
| Delivery preparation | Contents, learning, customer, review | `delivery-wizard.md` |
| Worker registry | Find/triage all Workers + customer packages | `registry.md` |
| Worker workspace | Package, runs, memory, knowledge, learning, Sentinel, runtimes, delivery, identity | `worker-detail.md` |
| Runtime configuration | Allowed post-deploy changes | `worker-configuration.md` |
| Operations | Stop/terminate/redeploy/operations feed (fold into Registry/Worker) | `operate.md` |
| Learning (estate + per-Worker incl. OKF, evidence, effect, sharing, records, sync, routing, Skill-change, decision log) | Did the Workers get better and why | `learning-fleet.md`, `worker-learning.md`, `okf-browser.md` |
| Sentinel (overview, workers, dimensions, decisions, policy) | Fleet oversight | `sentinel.md` |
| Knowledge library (Skills, DSLs, EVALs, DoD, models, Skill authoring) | What TCS knows | `knowledge-library.md` |
| Knowledge governance (coverage, candidate decisions, packs) | Admit shared knowledge | `knowledge-governance.md` |
| Harnesses (catalogue, harness, certify guide, conformance, SDK docs) | Build/certify | `harnesses.md` |
| Administration (people, person, groups) | Access | `admin-people-groups.md` |
| Global: background-work tracker + completion notices; session/permission-aware nav; not-found | Cross-cutting | `auth-and-shell.md`, `shared-patterns.md` |

## 6. Required information per screen
See each `screens/*.md` §4 (tables: Information · Meaning · Source · Example · Importance) and `legacy-vs-requirement.md` §A1. The most commonly lost items: **coverage statements beside averages; the basis/period of every number; freshness & provenance (live vs retained copy); reasons for rejected/disabled options; digest and revision identifiers; "why was this chosen"; partial-read disclosures; the exact wording of unknown states.**

## 7. Required actions (with their guards)
| Action | Guard that must stay |
|---|---|
| Confirm a Compose checkpoint | Server accepts once; conflict ⇒ reload; dropped ⇒ check before resend; unsaved edits block |
| Edit a decision | Restarts that stage and every later stage |
| Build Package | Readiness gate; archived draft cannot package; idempotent |
| Deploy / Deploy again / Resume | Spending limit (bounds, inherited confirmation, month-spend readable); platform hold ⇒ no retry; reason if held |
| Stop runtime | Named target + required reason (recorded as Platform Sentinel decision) |
| Terminate | Named target + irreversible warning |
| Revoke identity | Type the Worker's name; terminal |
| Sentinel Stop Worker | Typed name + reason; per-runtime results; no blind re-send |
| Narrow Package | New Package, only Skills, explicit apply |
| Prepare delivery | Customer required; images mode; learning optional; reattachable |
| Share link / Acknowledge / Publish source | Evidence wording; confirm-in-place for the latter two |
| OKF edit | Reason; gates; second-person approval |
| Promote / Defer / Reject candidate | Reason on reject; version-checked |
| Publish Skill | All checks pass on exact bytes; digest quoted |
| Save post-deploy config | ETag; approval ref where required |
| Archive draft | Admin; no Package; confirm |
| Invite / edit / disable person | Edit signs them out everywhere; exceptions-only grants/denies |

## 8. Required states
Per `screens/*.md` §8 and `shared-patterns.md`: **loading (labelled shape, no fake progress) · loaded · refreshing (keeps content) · failed refresh (keeps last data + says when) · empty (never populated vs filtered-to-nothing vs unreadable vs not-applicable) · partial read (state the coverage) · unknown/not measured · stale · forbidden · session expired · not built on this platform · degraded (assist returned nothing)**; domain states: stage RUNNING/SETTLED/FAILED/CANCELLED; station NOT_STARTED/IN_PROGRESS/REVIEW/READY/NEEDS_ATTENTION; package DRAFT_QUEUED…ARCHIVED; runtime DEPLOYING/RUNNING/STOPPED/FAILED/TERMINATED + health STARTING/HEALTHY/UNHEALTHY/STOPPED/UNKNOWN + stop reason; workflow QUEUED…FAILED; delivery PREPARING…FAILED; identity PROVISIONED/ACTIVE/PAUSED/REVOKED; verdict MET/NOT_MET/NOT_ADJUDICABLE; proposal states (10); Sentinel severity 0–3 + grant; decision outcomes approve/pending_human/hold/reject/quarantine; sync mode full/metadata_only/off; readiness READY/BLOCKED.

## 9. Business rules
`business-rules.md` (RULE-001…215, 126 rules). The ten that most change a design:
1. Unknown is never zero (RULE-002/010). 2. Every average states its sample (011). 3. Shadow/declared/recorded ≠ applied/enforced/served (004, 131, 160, 161). 4. Applied only on the Worker's acknowledgement (160). 5. Sealed things are immutable; change = new revision/Package/pack (008, 080, 103). 6. A different person approves shared knowledge changes (150). 7. Stop/resume need a reason; revoke is terminal; typed names guard the destructive ones (093, 100, 120, 163). 8. Spending limit is a deployment-time, mandatory, never-blank decision (031–033). 9. Verifier ≠ maker; owner ≠ adjudicator (028, 036). 10. Authority is server-side; hide entries the account cannot use (001, 204, 213).

## 10. What the new UI is FREE to change
Everything in `legacy-vs-requirement.md` §C — navigation model, information architecture and grouping, route structure (with redirects), layout, density, visual language (colour, type, radius, iconography), components (tabs vs select, tables vs cards vs lists, dialogs vs inline panels, wizard vs single page), chart forms, the Worker diagram and assembly animation, launcher, naming of rail items (keeping product vocabulary), empty-state art, how and when to merge screens (e.g. one Worker workspace instead of Registry + Operate + Learning-per-Worker + Sentinel-per-Worker), whether Operate exists as a destination, whether Knowledge governance has its own area.

## 11. What the new UI MUST NOT change
Everything in `legacy-vs-requirement.md` §A — the information, workflows, actions, states, business rules, behavioural mechanics (URL-held state, durable operations with reattach, optimistic concurrency, dropped-request reconciliation, server-authority permissions) and the accessibility floor. Also: do not invent data (e.g. do not add a "health score", a single DoD score, a "success rate" for learning, or a "safe" badge — none exist), do not turn recorded/shadow decisions into applied-looking states, and do not collapse the Knowledge/Learning distinction.

## 12. Design goal
**A new information architecture, not a restyle.** Today's IA mirrors code history (nine capability pages plus deep per-Worker sub-areas that overlap). The new design should be organised around **the questions people ask** — e.g. *"What do I want to build / ship / run / trust?"* and *"What is going on with this Worker?"* — while keeping every capability, rule and piece of evidence reachable. Questions the new IA must answer (not prescribed answers):
- Where does a person start on a given day, and how do the three occasions (compose, package, deliver) hand off to each other (and to different people)?
- Is there one **Worker workspace** that unifies identity, Package, runtimes, runs, memory, learning, Sentinel and delivery — and how is the estate-level view related to it?
- How are **estate** views (Dashboard, Learning fleet, Sentinel overview, Registry) distinguished from **one-Worker** views so counts with different definitions are never confused?
- How is **Knowledge (library)** presented so Compose can pull from it and stewards can govern it, without merging it into Learning?
- Where do **long-running operations** live so that nobody loses them?
- How do **destructive and consequential** actions look so that named targets, reasons and recorded decisions are unmistakable?
- How do **absent, partial and stale** data look so they are unmistakably not zero?

## 13. Known unknowns the new design should not assume away
- Environment profiles/tool catalogue, per-field labels inside the large Compose stage editors (`ComposePage`, `InstructionsDecision`, `CapabilitiesDecision`, `SentinelSettings`) — see `screens/compose.md` UNKNOWN.
- Real people/groups data and platform Sentinel decisions (the capture is empty/expired for them).
- Whether estate memory landscape/topics screens are meant to return.
- Responsive details beyond what the code proves (listed per screen).

---

## Final validation checklist
- [x] Application not modified: no file outside `docs/product-context/` was written by this task (verify with `git status`; only that directory is untracked).
- [x] No commit, no install, no screenshots, no UI created, no redesign performed.
- [x] Every production route is in `application-map.md` (69 route entries; 57 content, 12 redirects) and mapped to a screen file via `screens/README.md`.
- [x] Real example data is quoted from the repo (capture/fixtures); none invented. Where no data exists the doc says UNKNOWN.
- [x] CONFIRMED / INFERRED / UNKNOWN markings used; unknowns collected in each file and in §13.
- [x] Business rules numbered RULE-001… with Condition / Behaviour / Affected screens (126).
- [x] Data/API areas mapped in `data-contracts.md` (auth/admin, dashboard, compose, drafts/registry, packaging/deploy/delivery, worker/runtime/configuration, knowledge, learning, sentinel, harnesses).
- [x] Legacy vs requirement separated (`legacy-vs-requirement.md`), shared patterns tagged with *Can be redesigned?*.
- [ ] Not done (deliberately, read-only scope): server inspection; line-by-line reading of the four largest Compose editor files; pixel/viewport behaviour.
