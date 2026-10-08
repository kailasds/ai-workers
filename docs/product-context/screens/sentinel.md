# Screens: Sentinel (platform oversight) — `/sentinel`, `/sentinel/workers`, `/sentinel/:dimension`, `/sentinel/decisions`, `/sentinel/decisions/:decisionId`, `/sentinel/policy`

Source: `routes/sentinel/*`, `routes/sentinel/platform/*`, `lib/platformSentinel.ts`, `lib/learningView.ts`, `lib/brainStatements.ts`, `lib/sentinelSettings.ts`, `lib/maturity.ts`. Mock: `/api/platform/sentinel/overview` (`platform-sentinel-overview-v1`, 7-day window), `/api/sentinel/learning` (`sentinel-learning-fleet-v1`).

Rail: **Sentinel** — "Oversight". Header copy on every Sentinel page: "Oversight across every Worker." A four-view local nav (tabs; a labelled select under 768px): **Overview · Workers · Decisions · Policy**. `/sentinel/:dimension` (monitor, enforce, align, control, unlearn) is reached from the overview tiles; an unknown dimension shows "No such Sentinel dimension — Sentinel has five dimensions: Monitor, Enforce, Align, Control and Unlearn."

## 0. What the Sentinel is (CONFIRMED; the only description to rely on)
> "The Sentinel weighs what runs teach a Worker before it becomes knowledge. Its decisions are recorded, not applied." (`SENTINEL_ROLE`) and "A missed Definition of Done check is not a Sentinel intervention."

There are **two Sentinels**, same five dimensions:
- the **Worker Sentinel** — runs inside each Worker's Runtime; decides on its own learning candidates (approve / pending_human / hold / reject / quarantine) and caps itself with the Platform Sentinel's rules; shown in Learning › Worker.
- the **Platform Sentinel** — fleet-wide; reads the Workers' decisions and signals, applies bounds, can restrict/stop/withhold at customer, harness or platform scope; shown here.

**Mode is two separate facts, never one:** *Decides* (`shadow` | `enforce` | "signals only") and *Applies* (`yes` | `no — {why}`). In the offline capture the Platform Sentinel is not acting: mode.set = null, acting = false, why = "The Platform Sentinel records its decisions; it applies none until its gates are ratified." **A decision is "applied" only when the Worker's own Runtime acknowledges it** (13 §6.3); a shadow decision reads "Would …" and was never sent. A decision not acknowledged within 5 minutes reads "Not confirmed by {Worker} since {time}."

**Five dimensions (CONFIRMED, `platform/dimensions.ts`):**
| Dimension | Tile question | Purpose |
|---|---|---|
| Monitor | Is every Worker watched? | Watches oversight and learning of every Worker and raises a fleet signal when something leaves its normal range. It decides nothing itself. |
| Enforce | Do all Workers stay inside the rules? | Caps every Worker's Sentinel with the platform rules and refuses anything that would cross a tenant, customer or reach boundary, naming the rule. |
| Align | Better at the work, or at the score? | Finds misalignment that only shows across Workers: one harness teaching the score, tampering on one version, lessons that do not fit where they were shared. |
| Control | How much may the fleet do right now? | Changes what Workers may do, smallest scope first. Restores need evidence or a person. |
| Unlearn | When a lesson is withdrawn, who lets go? | Decides for each Worker that received a withdrawn lesson whether it withholds it too, from that Worker's own evidence. |

**Severity 0–3** (counts keyed "0"…"3" plus `grant`): signal(0/1)… the UI words `signal · warning · restriction · stop`; "Nothing open" is never "safe" or a tick (13 §7.6). **Scope kinds:** worker, customer, harness, platform.

---

## 1. Overview — `/sentinel`
**Purpose:** posture first — how many running Workers are watched and what is in force — then the five dimensions (each one fact and one destination), what is in force now, and the head of the decision stream. "A dimension that is not acting says why, never a zero or a tick."
**Info:** Posture line "Watching {reporting} of {running} running Workers · {N restrictions in force | No restrictions in force}" / "No Workers are running"; coverage bar (running · reporting · no Sentinel · unavailable · not running; `complete:false` ⇒ says partial; each segment links to `/sentinel/workers?filter=`); decision-chain integrity (`verified true/false/null`, entries, `broken_at`); five dimension tiles (name, one-line question, status phrase from open counts "1 stop · 2 restrictions open" / "Nothing open" / "Not measured", mode words, "Last: {title} · {time}" or "Nothing recorded yet"); "In force now (N)" list (kind block | pause | restriction | directive | stop; title e.g. "Harness blocked", "Sharing held", "Directive · sentinel.routing.exploration = none"; scope chip; effect; workers + applied; since; expires; by; reason; "lift when": "admin + reason", "< 20% scorer-only over 10 runs"); "Decision stream" (latest entries, "View all decisions"); footer "N Workers need review · Workers view" / "No Workers need review".
Mock: window_days 7, viewer.admin true, coverage {running 1, reporting 0, no_sentinel 0, unavailable 1, not_running 34}, chain unverified (0 entries), all five dimensions built with zero open, stream empty, in_force empty, needs_review 0.
**Actions:** open a dimension; open a coverage filter; open Decisions; open Workers.

## 2. Workers — `/sentinel/workers` (`?filter=`, selection)
**Purpose:** per-Worker oversight coverage and the **stop** control.
**Filter (select):** Needs review · All running · Not running · Sentinel reporting · No Sentinel · Status unavailable.
**Coverage bar** "Coverage of running Workers" (reporting / No Sentinel / Unavailable).
**Row → detail (selected Worker):** name; short id · revision · bounded context; **Runtime coverage** per runtime ("No Worker Runtime" / "Did not report" / "No governance deployed" / "Sentinel reporting · enforce|shadow"); **Configured oversight** (the Package's policy; "View policy details"); **Recorded decisions** by runtime ("No Sentinel decision reported."); "View Sentinel settings" → Worker detail Sentinel tab. Notes: "Recorded, not applied. These decisions have not changed knowledge served to runs." / "Shadow decisions are recorded, not applied. Other runtimes report their own mode below." / "Contradictions between memories are not checked yet."
**Platform policy line:** "Platform policy · N bounds set" / "no bounds set" / "Platform policy is available to administrators." / "…could not be read; known bounds are unchanged."
**Stop Worker (the one destructive governance action):**
- Shows **Stop authority** and **Stop conditions composed** (from the Worker's `sentinel.control`).
- Stop applies to **ECS runtimes only** (one request per runtime; results shown per runtime: Stop requested · Stopped · Checking… · Not stopped · Not confirmed). A LOCAL Worker is stopped from its Worker page.
- Preconditions: type the Worker's exact name; give a **reason** (required, ≤ 500 chars); the server checks the viewer's permission ("Your permission is checked when you stop.").
- Result: each runtime's stop is recorded as its **own Platform Sentinel decision** with a link "Decision {id}". "A partial stop is never shown as done, and a dropped response is re-read, never re-sent." "Check again" re-reads pending ones; "Retry" re-sends only failed/unconfirmed ones.
- No serving runtime: "No runtime is serving, so there is nothing to stop."

## 3. Dimension — `/sentinel/:dimension`
Same template for all five: header (breadcrumb Sentinel › {Dimension}), question + purpose, **tiles** (Open, Restrictions in force, Workers affected, Applied N of M) where measured, mode words, **rubric** "What this dimension checks" (table ID · Question · Now (fleet) · Needed · Set by · Status pass/fail/pending/not applicable/**Not measured** + reason; a dimension not yet acting still lists every row as Not measured so a reader sees what it will check), **one dimension-specific panel**:
- Monitor → *Fleet watch* matrix (Worker × criterion PM1…PM7 → highest severity or not measured; reasons).
- Enforce → *Rules in force* (per section: Bounds, Managed, Directives), "Workers clamped (N)" (Worker + path), Grants (declared, active, refused); "Sharing is declared, not active."
- Align → *Patterns across Workers* (harness, criterion, measure, workers, phrase, severity).
- Control → *In force (N)*, *Harness switches* (harness key+version · workers · running|blocked), *Triggers* (trigger → action, scope).
- Unlearn → *Withdrawn shared items* (item, origin Worker, reason class, mandatory?, receivers withheld/kept/nothing, applied of N, decision link). Empty: "No shared lesson has been withdrawn."
Then "Decisions in {Dimension}" (filtered stream).
Not-built dimension: `built:false` + `built_by` slice — shows the slice, never zeros.

## 4. Decisions — `/sentinel/decisions`
"Platform Sentinel decisions" — every decision (and, when asked, every signal), **newest first**; filters kept in the URL: dimension (chips), severity (All severities | signal | warning | restriction | stop), scope (All scopes | worker | customer | harness | platform), mode (Shadow and enforce | Enforce | Shadow), signals toggle. Tiles: Decisions · Restrictions · Grants "N applied · N recorded" · Workers affected · Signals. Weekly severity table (Week × severities; a week absent was not reported). Table: Time · Dimension · Severity · Decision (verb + subject; **a per-receiver child sits under its parent**) · Scope · Workers · Applied · Mode. "Show older decisions" (cursor). Empty: "No platform decisions yet." Until the server serves the log, the earlier per-runtime view stays so nothing disappears.

## 5. Decision detail — `/sentinel/decisions/:decisionId`
(Also reached from Learning › Worker and from stop/resume reasons.) Headline (e.g. "Withheld from Payments batch"; "Would …" when recorded only); **Reasoning** (Because / Therefore / Would change if / Next check; or "Reason not reported"); **Rubric** (ID · Question · Measured · Needed · Result · Set by, with qualifiers like "weighed", "not comparable"); **Affected Workers (N)** (Worker · Customer · Effect · Applied: "Recorded only · not sent" / "Applied · {time}" / "Not applied" / "Sent · not yet confirmed" · its decision log); **Per receiver (N)**; **Evidence** (runs, item, origin Worker decision); **Integrity** (Hash, Previous, Policy, Inputs digests; Chain "Verified · N entries" / "Not verified at X" / "Not verified yet"). Fields also: decided_by, approved_by, policy revision, trigger (worker_decision | signal | person).

## 6. Policy — `/sentinel/policy` (platform administrators only)
"Platform policy · defaults, no revision saved" / "· r{n}". Rules **grouped by the one dimension that owns the path**: table Setting · Kind (bound | managed value | directive) · Platform rule, with the dotted path in mono. Empty: "The platform sets no bounds, managed values or directives." Non-admins: "Platform policy is available to administrators." **Read-only here — editing arrives with policy v2 (L3-37).** (Compose-time Sentinel settings, per Worker, are in `compose.md`.)

## Actions summary
| Action | Where | Preconditions | Result | Failure |
|---|---|---|---|---|
| Stop Worker (per ECS runtime) | Workers | typed name + reason + permission | Runtime stopped; Platform Sentinel decision recorded | message per runtime; dropped → re-read |
| Open decision / dimension / worker | many | — | navigation | — |

## Filters / state / data / rules
**Data:** `GET /platform/sentinel/overview`, `/platform/sentinel/dimensions/{dim}`, `/platform/sentinel/decisions[?dimension&severity&scope&mode&signals&cursor]`, `/platform/sentinel/decisions/{id}`, `GET /sentinel/learning`, platform policy document; `POST /workers/{id}/stop`. **Read states** (`Read<T>`): ok / forbidden / expired / not_found / not_built / unavailable. **Rules:** RULE-160 Applied only from the Worker's acknowledgement. RULE-161 Shadow = recorded, never sent. RULE-162 "Not measured" is never 0 and "Nothing open" is never "safe". RULE-163 Stopping needs a typed name + a reason and is itself a recorded decision. RULE-164 Each stop is per runtime; partial stop is shown as partial. RULE-165 Platform policy can only tighten a Worker (Worker settings are clamped to platform bounds). RULE-166 The decision chain is hash-linked (`hash`, `previous`) and its integrity is shown.
**Responsive:** tabs → select under 768px; tables collapse to labelled records. **Current UI:** LEGACY UI — NOT A DESIGN REQUIREMENT.

## Related: Fleet learning evidence (component `FleetLearning.tsx`)
A table "Learning evidence" of every live Worker counted by that Worker's own Runtime: Worker · State · Runs judged · Experiences · Remembered · Candidates (by status) · Sentinel decisions (by outcome) · Last learned · Bundle. "Every run each Worker Runtime judged, any verdict, replays included. Learning counts only certified runs, so its figures are lower." A Worker that does not answer keeps its row with "—" and says why (mock: "Refused the console's request."); a Worker without a Runtime is listed and not asked; one failing never fails the table. UNKNOWN: which route mounts it in the current build (the file exists; `/sentinel/workers` reads the same `sentinel-learning-fleet-v1`).
