# Legacy UI vs product requirement

The current application is the source of **product** truth, not of **design** truth. This file separates what the new UI must carry forward from what is merely how today's UI happens to be built. Everything under "CAN COMPLETELY CHANGE" is legacy presentation; **no part of it is a requirement**.

Markers: **C** = CONFIRMED in code/comments, **I** = INFERRED, **U** = UNKNOWN.

---

## A. MUST PRESERVE (behaviour, data, rules — the product)

### A1. Information that must remain reachable
| Area | Must remain available to the user |
|---|---|
| Dashboard | Active Workers (snapshot), completed runs (any verdict), average duration, reported model cost with coverage, registered/packaged counts; runs over time and verdict split; DoD per-criterion pass/measured with threshold & gating; spend per period in cost **and** tokens; per-identity and per-bounded-context cost per run with coverage; the run ledger (run, Worker, context, verdict, duration, spend; newest first; truncation disclosure); period choice (7d/30d/90d/all) and last-updated/refresh; freshness and data-quality facts that exist in the data but are not shown today (**should** be surfaced) (C) |
| Compose | Every declaration field (type, identity, domain, geography, bounded context incl. produces/procedure/includes/excluded, growth ceiling, name, auto-vs-review); all ten stage decisions with the *why* (what was searched, selected, rejected, and reasons); all draft fields in `screens/compose.md` §4.4; readiness issues by section; revision number and saved/unsaved state (C) |
| Packaging | Per composed Worker: name, revision, context/domain, composed & packaged times, counts of Skills/DSLs/EVALs/DoD criteria, operating mode, harness (or "Generic runtime"), readiness + each blocking reason, stale-Package warning, running operation + progress (C) |
| Delivery | Eligible sealed Packages with recorded learning (runs, proposed Skill changes, memory records by kind), sealed-Package contents by name, delivery records with state, customer, last evidence, requirements, contents integrity, images mode/size/digest, callback status, source publication, artifact identity (C) |
| Registry | Worker identity (name, owner, context, revision, identity state), runtime facet (serving/stopped/attention + substrate), latest outcome, learning summary, brain/Sentinel composition, console access (C) |
| Worker detail | Package anatomy (six parts), identity (ids, credential facts, scope & exclusions), DoD criteria, runs with verdict/criteria/routing/usage, memory, learning, Sentinel (configured vs running), runtimes with lifecycle/health/package/age, delivery records, sample archives, configurable fields (incl. locked ones) (C) |
| Learning | Fleet and per-Worker learning with provenance (live vs platform copy), OKF service state (served/shadow/composed-only), GBrain record types and their producers/availability, item evidence chains, learning effect (before/after with sample sizes), Skill-change diffs with evidence, sharing grants and settings, all-records by class with redaction receipts, sync mode and who set it, routing, Sentinel decision log (C) |
| Knowledge | Skills (all metadata + full package files), DSLs by business hierarchy with graph/statistics and availability to Workers, EVALs (gate vs measured, how executed, rubric/code), DoD scopes/criteria/evidence, golden datasets (cases, skipped & why), small-model pairs, shared-knowledge candidates with evidence/lineage and packs with diffs (C) |
| Sentinel | Posture, five dimensions (question, purpose, rubric status), in-force restrictions, decision stream/log with reasoning, rubric, affected Workers' applied state, evidence, integrity chain; platform policy by dimension (admin); per-Worker coverage and Stop (C) |
| Harnesses | Catalogue, manifest facts (stages, metrics, events, runtime needs, settings, pages, vocabulary), certification state and guide, conformance reports (15 checks with evidence), SDK reference pages (C) |
| Admin | People (status, role, groups, network, last active), person edit (role, groups, network, feature exceptions with inherited baseline), groups (grants, members) (C) |
| Account | Sign-in with named failures, forgot/reset/invite flows with password rules (C) |

### A2. Workflows and actions (every one in `workflows.md`)
Create/resume/revise Worker; package; deploy (ECS/local) with spending limit and lifetime; stop/resume/deploy again/terminate runtime; pause/resume/revoke identity; inspect run; run sample; change allowed post-deploy configuration; prepare/narrow/share/acknowledge/publish customer delivery; write/revise Skill; propose/approve/decline/withdraw/restore OKF edits; promote/defer/reject knowledge candidates; stop a Worker via Sentinel; certify harness guide; archive draft; onboard/administer people; account recovery; follow background work.

### A3. Business rules and honesty rules
All 126 rules in `business-rules.md` — in particular: unknown ≠ zero; coverage with every average; shadow/declared/recorded-not-applied wording; applied-only-on-acknowledgement; two-person approval; reasons for stop/resume; typed-name guards; immutable Package/revision semantics; spending-limit rules; independent verifier; owner ≠ adjudicator.

### A4. Behavioural mechanics
URL-addressable state (search, filters, sort, period, page, open record, section, step, station) and origin-aware Back; durable long-running operations with reattach & reconcile (no double-submit); optimistic concurrency with edit-preserving recovery; dropped-request re-read; server-authority permissions with hide-not-disable; polling intervals as functional needs (shell 15 s, dashboard 30 s) or equivalent push; local-time display with zone disclosure; Skill/EVAL/DSL names over keys; counts for every list, caveats for partial reads.

### A5. Accessibility floor
Colour never the sole carrier; shape + word for every state; named controls; focus management on navigation/confirm/paging/cancel; `aria-live` polite for async results without focus theft; table captions & phone-collapsed labelled records; reduced motion; one H1; skip link; keyboard-operable composite widgets.

---

## B. SHOULD PRESERVE (strong conventions with reasons, but a redesign may justify changing them)

| Item | Why it matters | Source |
|---|---|---|
| Product vocabulary: Worker, Compose, Package, Packaging, Customer delivery, Registry, Knowledge, Learning, Sentinel, Harness, bounded context, Definition of Done, Skill, Domain Specific Language (DSL), EVAL, Brain/GBrain, OKF, Runtime | Users, docs and customers already use these words; the code comments record repeated corrections toward them ("Registry" not "Worker Registry"; "Domain Specific Language" spelled out because "Languages" reads as human languages) | C |
| Lifecycle order: Compose → Package → Deliver/Deploy, as separate occasions (the person who seals is often not the person who composed) | ADR 0078 | C |
| Knowledge (library) vs Learning (record of change) as distinct concepts | Different readers, different questions | C |
| Compose is a *proposal-and-confirm* experience (platform assembles, person confirms; reasons visible) | The product's core promise ("a credential being issued") | C |
| The 4 pre-identity decisions and 8 review checkpoints as the unit of confirmation | Server stage model + explicit ADR | C |
| Launcher offering the three occasions rather than dropping into a capability | Deliberate decision | C |
| Operate's functions being folded into the Registry/Worker (not a separate rail destination) | Removed from the rail twice | C |
| Worker diagram as an anatomy map of six parts | Shared by Compose and Worker detail so they cannot drift | C |
| Background-work visibility + completion notices that link to the result | Real defect history ("not taking me to the worker") | C |
| Preview of what a Package will contain before sealing; stale-Package warning | Prevents shipping a mismatched Worker | C |
| Dashboard outcome-first hierarchy (one figure per fact + its basis) | Asked for repeatedly in comments | C |
| Sentinel two-fact mode (Decides / Applies) | Prevents misreading shadow as active | C |
| Names beat identifiers; short ids only when ambiguous | Repeated user complaints | C |

---

## C. CAN COMPLETELY CHANGE (legacy presentation — not requirements)

| Legacy choice | Why it is legacy, not product | What the new design may do |
|---|---|---|
| Dark-teal full-height left sidebar, nine entries + foot entry, phone Menu button | Presentation of navigation | Any navigation model (top bar, command palette, workspace switcher, contextual nav) provided every route's content stays reachable and gated entries hide |
| Page-per-capability IA (9 rail items) | The route table is a reflection of code history; observed overlaps: Operate vs Registry; Worker detail tabs *Brain activity / Knowledge / Learning / Sentinel* vs the Learning and Sentinel areas; Customer packages appear in Registry, Customer delivery and Worker › Delivery; Knowledge governance has no obvious entry; "Knowledge" names both a library and a Worker-detail tab (I) | A fresh information architecture; merge or split screens freely |
| Tab strips, Section select under 768 px | Pattern | Any equivalent |
| Cards, 16 px radius, hairlines, KPI squares with solid tiles, colours, icons, typography, spacing | Pure visual language | Anything |
| Stepper/rail/diagram in Compose; the "assembly lane" animation | Visualisation of the ten-stage workflow; decoration | Different representation of the same workflow and its evidence |
| Wizard layout for delivery and Skill creation | The *steps and decisions* are product; the container is not | Single page, dialog, guided panel, etc. |
| Tables with column sets; list rows | Containers | Any, provided the information listed in A1 is present |
| In-row "confirm in place" panels | Pattern | Dialogs, popovers, side sheets |
| Charts (SVG column chart, ring, rails) | Chart form | Other chart types; must keep the buckets, selectable exact values, zero baselines, "no bar for unmeasured", and table alternative |
| Per-Worker Learning split across 14 routes | Route granularity | One Worker workspace with sections |
| Launcher tiles artwork; wordmark treatment; watermark | Brand/decor | Anything |
| Route URLs | Implementation | New URLs allowed if old ones redirect and state is URL-addressable (A4) |
| Skeletons' shapes, empty-state illustrations | Visual | Anything |
| Polling vs push | Transport | Either, within A4 |

---

## D. Things the legacy UI does **not** do (so the new UI is free to invent, but must not claim)
- Surface `freshness` sources, `data_quality` and `model_routing` from the executive dashboard (data exists, UI omits) (C).
- A screen for `/admin/activity` events (API exists) (C/U).
- A mounted view for estate memory landscape/topics (`/knowledge/landscape`, `/knowledge/topics`, `/knowledge/brains`) (U).
- Editing platform Sentinel policy ("arrives with policy v2") (C).
- Active sharing between Workers ("admission path not built") (C).
- A customer-lane for knowledge candidates ("Customer emission is not enabled for this deployment") (C).
- Enforcing certification at Compose ("does not refuse an uncertified version yet") (C).
- Any live status of a delivered Worker at the customer ("Customer runtime status: not observed by this record") (C).
