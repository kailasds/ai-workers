# Screens: Learning › one Worker — `/learning/workers/:compositionId` and its sub-pages

Source: `routes/learning/worker/*`, `routes/learning/WorkerSkillPage.tsx`, `routes/workers/learning/*`, `lib/learningWorker.ts`, `lib/learningEvidence.ts`, `lib/learningRecords.ts`, `lib/knowledgeApi.ts`, `lib/platformSentinel.ts`.

This file documents **every route under `/learning/workers/:compositionId`**. They share: a breadcrumb `Learning › {Worker} › {page}`; a `Read<T>` result with states `ok | forbidden | expired | not_found | not_built | unavailable{message}`; and these truth rules (CONFIRMED in file headers): **an unreported value is null, never 0; shadow is never "served"; an absent artefact type is a card with a state, never a zero; read-only — no Approve/Stop/Unlearn here.**

| Route | Page | Section |
|---|---|---|
| `/learning/workers/:id` | Worker learning overview | A |
| `/learning/workers/:id/okf` | OKF browser (read / edit / history) | see `okf-browser.md` |
| `/learning/workers/:id/brain/:card` | One record type's items (card list) | B |
| `/learning/workers/:id/brain/:card/:itemId` | Evidence for one item | C |
| `/learning/workers/:id/effect` | Learning effect | D |
| `/learning/workers/:id/skills` | Skills (list + SKILL.md) | E |
| `/learning/workers/:id/skills/:changeIndex` | One proposed Skill change | F |
| `/learning/workers/:id/facts` | Facts (landscape/experience) | E |
| `/learning/workers/:id/sharing` | Sharing grants | G |
| `/learning/workers/:id/records` | All records by class | H |
| `/learning/workers/:id/records/:recordClass/:recordId` | One record | H |
| `/learning/workers/:id/sync` | Data transfer to the platform | I |
| `/learning/workers/:id/routing` | Model routing | J |
| `/learning/workers/:id/sentinel` | Sentinel decision log | K |
| `/learning/workers/:id/sentinel/:decisionId` | One Sentinel decision | K |

## A. Overview — `/learning/workers/:compositionId`
**Purpose:** one Worker's learning, in order: **OKF first, then GBrain, then the learning effect**, with the Sentinel sidecar beside them (between OKF and GBrain on a phone). A stopped Worker opens its retained copy immediately and says so — "there is no 'no runtime' dead end". No primary action.

**Header block:** name, harness, state (running / stopped / terminated + date), **provenance** (Runtime now vs platform copy), `live_failed` flag ("live read failed, platform copy shown"), "synced through run X; N later runs not synced".
**Explore strip:** OKF · GBrain · Learning effect (anchors) · Skills · Facts · Decision log · All records · Sync.

**OKF block — "Knowledge this Worker runs with":** first line answers *is learned knowledge served, and on what evidence?* — service state `served | shadow | composed_only` (shadow reads "Not served · Sentinel would approve N items"); bundle revision; approving decision; overlay (person edits, version, unverified run). Tiles: Items (composed vs learned), Compounded (items from N runs), Reused (served / helpful / last runs), Revisions (count, since, latest by Sentinel or person). Six sections: **Procedural (Skills and techniques) · Facts · Routing · Experience · Applicability · Sharing** — each with a real count/state, origin and evidence runs, or the reason it has nothing ("Not evaluated", "No grants recorded"). Links: "Browse and edit OKF", "View integrity details".

**GBrain block — "What GBrain produced":** nine record types, each with its actual producer: *Memories: experience facts* ("Runtime experiences stored in GBrain"), *Routing experience*, *Run memories*, *Agreed across runs* (beliefs with supporting runs), *Skill proposals* ("Proposed changes; not adopted Skills"), *Lessons from runs not met* ("Runtime records, never served"), *Run summaries*, *Housekeeping* (last pass or "No pass has run"), *Retention* (sweeps of expired memory). Card state `produced | not_produced | not_by_harness | declared` → "Not produced yet" / "Not produced by this harness" / "Declared · not enforced yet" with an "Availability details" disclosure.

**Sentinel sidecar:** "Decides: shadow|enforce|signals only" and "Applies: yes|no — {reason}" as **two separate facts**; five dimension statuses (Monitor, Enforce, Align, Control, Unlearn: "Watching · 1 warning", "Not available", "No decisions recorded"); recent decisions ("Would approve", "Quarantined"…); counts (approve/held/rejected/quarantined for the period); decision-chain integrity ("Decision chain not checked" / verified / broken at X; "Decisions A–B retained"); "Rubrics and gates" (gates passed over evaluated); routing version/eligibility; "View decision log". **"From the Platform Sentinel"**: rules that apply to this Worker (bounds · managed · directives), narrowed dimensions, platform decisions about it ("Applied" only from this Worker's own acknowledgement), withheld items; failure copy "Platform rules could not be read. This Worker runs on the strictest settings."

**Learning effect block** — see D.

## B. Record-type items — `/learning/workers/:id/brain/:card`
`card` ∈ `experience-facts | routing | run-memories | beliefs | skill-proposals | lessons | summaries | housekeeping | retention`. Header "{type title}"; "N records · {producer}" ("Count not reported" when null). Items list with filters (All / Execution / Execution + scorer / Scorer only / Superseded for evidence class). An **absent type explains its availability instead of listing nothing** ("Not produced by this harness." / "Declared · not enforced yet." / "Not produced on this platform yet."). "Recalled into n runs" is not a cause. Unknown card: "No such record type."

## C. Evidence — `/…/brain/:card/:itemId`
One item top to bottom: Statement (verbatim; "Count retained; item details not retained." if not kept); "Withheld by the Platform Sentinel · {decision id}" if withheld; **Derived by**; **Supporting runs** (time · verdict · certified · harness version); **Harness events** ("Event body not retained · structured fields from platform copy"); **Model usage**; **Used later** ("Not used in a later run yet."); **Sentinel decisions** referencing it. "A cause is drawn only where the event records one; neighbours in time are not causes."

## D. Learning effect — `/…/effect` (also embedded in A)
"What learning changed." **Comparable runs only**: same cohort (harness, task class, input). Columns = runs in order with tokens from a zero baseline; a gap is an unmeasured run, never zero. Tiles compare **Before (no learned item served) vs After (≥ 1 served)** for Tokens, Cost, Time, Repair loops — **only with ≥ 3 qualifying runs on each side**. Else: "Not comparable yet · N before, N after; need 3 each. {reason}". Confounders ("Other changes") and "Reuse" (items cited in certified runs: helpful/harmful counts, evidence class). Run detail: Run, Run ID, Verdict (+ certified), Tokens, Cost, Time, Repair loops, Attempts, Learned items served. "An increase is shown as an increase; nothing here claims learning caused the change." Errors: "Not available on this console yet." / "No comparable runs recorded for this Worker." / "Could not load the learning effect." + Retry.

## E. Skills and Facts — `/…/skills`, `/…/facts`
A list beside one full document: the Skill's **whole SKILL.md (never truncated)** or the fact verbatim with its confidence band as supplied ("Confidence not supplied") and freshness. `?item=` is the selection. Groups "(N)". "Proposed changes" → "Review proposals in the OKF browser". For a selected item: "Referenced by OKF", "Execution evidence" ("Supporting runs are not reported in this bundle."), "Open in the OKF browser". Phone: list and document take turns.

## F. One proposed Skill change — `/…/skills/:changeIndex`
A Skill change is a page, not an expansion (it used to expand seven criteria tables under one row). Shows "What the runs agreed" (claim, observation count, runs), a **diff** of the registry Skill text before vs after ("added/removed/same" lines; `lands`: created_section | extended_section | unknown), the rule the change had to meet (`minimum_observations`, `requires_dod_met`, `may_extend`, `never_changes`, `writes_registry_copy: false`, `new_skill_requires`), and evidence runs with each criterion (state, measured, threshold, gating, the adjudicator's account). **A Worker writes no Skill file — it records a *proposal*; the shared copy is authored by people. Everything that shows it says *proposed*.** If the Worker no longer reports a change at that position: "This Worker no longer reports a Skill change at that position."

## G. Sharing — `/…/sharing` (OKF section 6)
Callout "Sharing is declared, not active. No knowledge has moved between Workers." **Shared from this Worker:** "Shared with (N)" (Workers that may read) and "May compound on it (N)" (may add evidence). **Shared with this Worker:** "From other Workers". Each grant shows both Sentinels' reviews (origin & receiver: verdict + reasons / "Not yet reviewed"), state in the two-Sentinel protocol, Withdrawal terms, "Effect today". "Where this learning applies" (Workers sharing a bounded context + technology pair). **Sharing settings in effect:** Offering its learning (Its Sentinel reviews each grant / Never), Accepting others' learning, Review window (hours), When a review times out (The Platform Sentinel decides / Refused), When an origin withdraws (Withhold what the origin withdraws / Withhold unless it has its own evidence), "Withdrawn everywhere at once for {reasons}". Settings change in the Worker's Maintenance › Sentinel › Enforce › Sharing.

## H. All records — `/…/records` and `/…/records/:recordClass/:recordId`
"Everything the platform holds for this Worker, one class at a time" — a rail of classes with counts (`experiences, candidates, sentinel, gbrain, okf, routing, runs, align, metrics`), then the selected class as a table (Record · class columns · Synced). Sentinel decisions and OKF revisions open their own pages. **Metadata-only** mode: "Counts, scores and timings are synced; the content stays on the Worker." — rows say "Content not synced"; "Withheld by the filter". Filter: `?class=`, `unlearned`. "Show older records" (cursor). **One record:** what it is; where from (epoch, sync time, digest); what the egress filter redacted (**counts and detector names, never a value**); the document (experiences get a designed view: Rule, Status, Verdict "DoD met · verified by the Runtime", Where (type · stage), Before/After strategy and result); "Versions received" table (Received · Digest · Runtime epoch · Redacted). Withheld reasons: "Withheld by the platform." (platform_secret) / "Withheld by the confidential-data filter." An unlearned record keeps no content.

## I. Sync — `/…/sync`
"Whether this Worker's learning reaches the platform, and what the filter kept back." **Data transfer** mode: *Full · everything learned, after the confidential-data filter* · *Metadata only · counts, scores and timings, no content* · *Off · nothing leaves the Worker*; **Set by**: The default / The Worker's owner / The Platform Sentinel (**stricter only**); Since; Last batch. **Redaction in the last {window}**: values redacted by detector (counts only, "no redacted value is kept or shown"; filter version). **What the platform holds**: class · records · content · last synced (each links to its records/decision/OKF history). **Runtime epochs** the Sentinel chain runs through. Read-only: the setting changes in Maintenance › Sentinel, and the platform may only make it stricter.

## J. Model routing — `/…/routing`
The Worker's live Runtime routing view (policy, tiers, evidence per tier, recommendation, adopt/revert) given a home under Learning; a stopped Worker says "Routing history is not kept after the Worker stops." Details: `lib/workerRouting.ts` — tiers `low | mid | complex`; eligibility checks per class; policy versions & history; `postWorkerRouting` to adopt/revert. (Exact controls: partially read — UNKNOWN beyond this.)

## K. Sentinel decision log — `/…/sentinel` and `/…/sentinel/:decisionId`
Five dimension tiles (Monitor, Enforce, Align, Control, Unlearn) counted by severity filter the log. Each decision: dimension, severity shape, outcome, recorded reasoning and rubric. **Shadow verbs read "Would …"**; a missing reason stays missing ("Reason not reported"); "a fraction of gates is a gate count, not a score". Filters and the open decision live in the URL; selector "This Worker and platform". Detail: **Decision** (Outcome, Recorded as, Applied Yes/No, Mode, Decided {time · by}); **Reason** (Because…); **Rubric** (per criterion: Required, Observed, Result pass/fail/pending/not applicable, Evidence, Set by); **Evidence considered**; **Effect** ("Applied." / "Recorded only · no change applied"); **Integrity and source** (Policy, Envelope, Inputs, Hash, Previous digests). Empty: "No decisions recorded." / "No matches." Chain: "Decision chain not checked".

## Cross-cutting (for all of the above)
**Navigation:** each page has a breadcrumb and (A→) an Explore strip; Back returns to the originating Learning list with its state. **Data dependencies:** `/learning/workers/{id}` (`learning-worker-v1`), `/effect` (`learning-effect-v1`), `/decisions`, `/items?card=`, `/items/{itemId}/evidence`, `/sharing`, `/records`, `/sync`, `/platform-decisions`, `/compositions/{id}/skill-changes`, bundle files via the Runtime (digest-checked). **Business rules:** RULE-140 learned knowledge is "served" only after a Sentinel decision that *applies*; in shadow it is not served. RULE-141 A Skill change is a human-authored act; Worker output is a proposal. RULE-142 Redaction receipts carry counts only. RULE-143 Sync mode can only be made stricter by the platform. RULE-144 A comparison needs ≥ 3 qualifying runs per side. **Current UI:** LEGACY UI — NOT A DESIGN REQUIREMENT (breadcrumbs, cards, tile rows).
