# Screen: Compose (guided Worker composition) — `/compose`, `/compose/guided/:compositionId`, `/compose/:compositionId`

Source: `routes/compose/guided/GuidedCompose.tsx`, `DossierWorkspace.tsx`, `Workspace.tsx`, `GrowthChoice.tsx`, `routes/compose/composeModel.ts` (`WorkerDraft`, `getReadiness`, `draftRequest`), `lib/durableApi.ts` (stage runs, compose catalogues), `lib/growth.ts`. Mock examples from `offline-mock/routes.json`.

Three URLs render the **same component** (`GuidedCompose`), wrapped in a route error boundary titled "Compose could not load. Reload the page; your saved drafts are kept." (CONFIRMED)

| URL | Meaning |
|---|---|
| `/compose` | New Worker. Starts at the 4-decision declaration (no draft exists yet). |
| `/compose/guided/:compositionId` | Open an existing draft. Restores the journey from server records. |
| `/compose/:compositionId` | Alias of the above (same component). |
| `/compose/expert` | Redirects to `/compose` (the "expert" form no longer exists as a route). |

Query parameters on the guided URL (CONFIRMED): `mode=review` (review each checkpoint; absent = auto-assemble), `step=<checkpointKey>` (durable review pointer), `checkpoint=<stationKey>` (deep-link to a station), `part=skills|language|evaluations|gbrain|sentinel` (open a Brain part), `view=` (Sentinel tab), `restart=<stage>` (re-run from a stage after an edit), `station=package_deploy` (land on packaging), `delivery=<workflowId>` (from the shell's "Work in progress").

---

## 1. Purpose

Compose is where a person **creates a Worker**. A person chooses a Worker type, an identity, a business domain, a geography and a bounded context. The platform then assembles the rest (instructions, steps, capabilities, environment, models, evaluations, memory, Definition of Done, governance) one stage at a time. The person confirms each proposal; **nothing enters the Worker until it is confirmed**. (CONFIRMED, file header: "Compose, as a credential being issued … Each station ends in a proposal they confirm")

Compose ends with a *composed* Worker (a saved, versioned draft). It then offers "Package and deploy". Building the sealed Package is a separate decision. (CONFIRMED, ADR 0078/0096 comments)

## 2. Primary user

A Worker composer / delivery engineer. The rail copy says that "the person who seals a Worker is often not the person who composed it", so composing and packaging are separate occasions. (CONFIRMED)

## 3. User jobs

1. Start a new Worker by declaring what kind of work it does and where it is allowed to work.
2. Let the platform assemble the Worker automatically, or review every checkpoint.
3. Inspect why each Agent, Skill, language or Tool was chosen, and what was screened out.
4. Edit any decision and have the later decisions recompute.
5. Leave and come back later; the draft is saved server-side.
6. Move on to Package and deploy.

## 4. Information available

### 4.1 Before a draft exists: the 4 declaration decisions

Heading `DECISIONS = ['Worker type', 'Identity', 'Bounded context', 'Confirm identity']`, counted "N of 4 decisions".

| Field | Type / control | Meaning | Default | Required? | Validation | Depends on | Example (mock data) |
|---|---|---|---|---|---|---|---|
| Worker type | Radio card (single) | The kind of work: determines which identities exist | none | **Yes** to continue | A type whose `availability != 'available'` is disabled and shows "This choice is not available. {detail}" | — | "Modernisation Worker": *Rebuilds a legacy application in a modern language and proves the behaviour still matches.* (3 bounded contexts). "Quality Engineering Worker": *Turns written test cases into automation against a running application and reports each verdict.* (2 contexts). "Full Stack Software Engineering Worker": **in_build** — "No harness has been admitted for this type yet." (0 contexts) |
| Identity | Searchable select | What the Worker *is* (e.g. "Test Script Generation and Execution"). Decides **which bounded contexts it may be bound to**. | none | **Yes** (to see contexts) | Unavailable identities are disabled with the reason. Option meta: "{n} scope(s)". | Worker type | "qe-test-script-generation" = Test Script Generation and Execution |
| Business domain | Searchable select | The business the Worker operates in. Decides which Skills, Domain Specific Languages (DSLs) and EVALs come with it. | none ("No business domain") | **No** | — | Worker type | e.g. "payments-cards" (Card authorisation and acquiring). Option meta: "{n} Skills · {n} Domain Specific Languages". |
| Geography | Searchable select | Whose law the work answers to. Changes **only** which compliance checks bind. It is **not** a deployment region. | "Not stated" | **No** | — | Business domain (counts are recomputed when it changes) | European Union: "The AI Act and DORA bind work placed here." (8 compliance checks); India: DPDP Act + RBI (5); United Kingdom (0 checks, review_note "Regulatory text not yet reviewed"); North America (8). "Everywhere" checks (apply even with no geography): `bfsi.compliance.claims_handling`, `bfsi.compliance.underwriting_fairness`. |
| Bounded context | Radio list (single), shown additively (base + "+ increment") | The one business boundary the Worker works in: what it produces, its procedure, what it includes and refuses | none | **Yes** | A context with `availability != 'available'` is disabled with chip "In build · Available later" (reason in tooltip) | Identity | Selected context shows: Produces (`outcome`), Procedure (`pipeline.display_name` · N stages), Includes (`in_scope`), "N excluded actions" (`out_of_scope`) |
| Growth | Keep / Allow growth + "Growth ceiling" select | Whether the Worker may later move to a **wider bounded context** on evidence | Keep | No | Allow is disabled when there is no wider context (reasons: "This bounded context has no wider one to grow into." / "This is the widest bounded context for this identity." / "The next bounded context, X, is not available yet."). A ceiling that is no longer reachable reads as Keep. Cannot grow past an unavailable step. | Bounded context | Help (shadow mode): "The Sentinel records when the Worker qualifies for the next bounded context, up to the ceiling. Nothing moves yet." |
| Worker name | Text (max 120) | How the Worker is listed everywhere | empty → named after its work and business domain | No | If 1 character: "A name has at least 2 characters." | Bounded context chosen | — |
| Auto-assemble preset | Checkbox | ON: continue through configured checkpoints; assembly pauses for input, errors, deployment actions. OFF: pause at each checkpoint to review and confirm. | ON (unless `?mode=review`) | — | — | — | — |

Live "Worker identity" summary (read-only): Worker type, Identity, Business domain ("None"), Geography ("Not stated" or "{name} · {n} compliance checks"), Bounded context, Worker identifier `spiffe://…/worker/{type}/{identity}/{domain}/{context}/…`. **The identifier path is shown only if a business domain is chosen** ("All four segments or none — ADR 0074"); otherwise the flat form `spiffe://…/worker/…`. The trust domain is elided until the server mints it. Footer text: "The identity is reserved when you confirm. Everything after this attaches to it."

**Conditional logic (CONFIRMED):**
- IF Worker type changes → identity, domain, bounded context are cleared.
- IF Identity changes → bounded context is cleared.
- IF no Identity → context list says "Available once an identity is assigned."
- IF Identity has 0 contexts → "{identity} entitles no bounded context yet."
- Business domain is **not** a precondition for contexts (the API filters by type and identity only).
- "Confirm identity" is enabled only when a bounded context is chosen, not busy, the name is not 1 char, and growth is not in an unsaved state.

**What "Confirm identity" does (CONFIRMED):** creates the composition via `POST /compositions` with a complete `draft-v8` document seeded from the bounded context (`outcome` from the context; maker model = context `seed_maker_model_id`; verifier = context `verifier_model_id`; candidate models = those two). If a growth ceiling was chosen, it is written immediately afterwards (`PATCH` of `maturity_envelope`). Then it navigates to `/compose/guided/{id}` (with `?mode=review` if auto-assemble is off).
- IF growth write fails after the draft exists → the draft is kept (never created twice) and a "Growth not saved" panel offers **Retry** (if retryable) and **Continue** (go on without it); the declaration is locked meanwhile.

### 4.2 After a draft exists: ten stages, six stations, eight checkpoints

**Ten server stages (`STAGE_ORDER`, CONFIRMED):** `identity` → `instructions` → `deterministic_steps` → `capabilities` → `environment` → `models` → `evaluations` → `memory` → `definition_of_done` → `governance`.

Stage runs are server-side jobs that stream events: `stage.started`, `source.opened`, `candidates.filtered`, `candidate.rejected`, `item.selected`, `reasoning.note`, `input.required`, `stage.settled`, `stage.failed` (a closed set of nine). A stage record has state `RUNNING | SETTLED | FAILED | CANCELLED`, `degraded` + reason, `proposal`, `accepted_at`, `elapsed_ms`.

**Six stations (rail), CONFIRMED** (from `compose-experience-v2`): `role_identity`, `worker_intent`, `brain`, `definition_of_done`, `autonomy`, and (appears once packaging starts) `package_deploy`. Station states: `NOT_STARTED | IN_PROGRESS | REVIEW | READY | NEEDS_ATTENTION`. Each has `preset` (bool) and `editable` (bool).

**Mapping stage → station (CONFIRMED, deliberately not 1:1):** identity→role_identity; instructions, deterministic_steps, environment, models→worker_intent; capabilities, memory, evaluations→brain; definition_of_done→definition_of_done; governance→autonomy.

**Eight review checkpoints (`REVIEW_CHECKPOINTS`, used in review mode; ADR 0096, CONFIRMED):**

| # | Key | Station | Title | What confirming decides | Button | Accepts stage |
|---|---|---|---|---|---|---|
| 1 | bounded_context | role_identity | Bounded context | The identity it is issued under and the one business boundary it works in. | Confirm bounded context | identity |
| 2 | worker_intent | worker_intent | Worker intent | Outcome, procedure and Tools. | Confirm Worker intent | models (the silent stages instructions, deterministic_steps, capabilities, environment run on the way) |
| 3 | skills | brain (part skills) | Skills | Instructions used during a run. | Confirm Skills | none (a reading of `capabilities`) |
| 4 | domain_language | brain (part language) | Domain Specific Language | Business rules for this Worker. | Confirm domain language | none |
| 5 | evals | brain (part evaluations) | EVALs | Checks bound to this work. | Confirm EVALs | evaluations |
| 6 | gbrain | brain (part gbrain) | Memory and learning | What is kept between runs. | Confirm memory and learning | memory |
| 7 | definition_of_done | definition_of_done | Definition of Done | Every required criterion must be met. | Confirm Definition of Done | definition_of_done |
| 8 | autonomy | autonomy | Autonomy and Sentinel | How far it may act, and what the Sentinel does. | Confirm autonomy | governance |

Progress text: auto mode "Auto-assemble · {n} of {m} stations" (or "… {m} of {m} stations confirmed"); review mode "{n} of 8 checks" / "8 of 8 checks confirmed".

### 4.3 What each station shows (Dossier)

| Station / part | Information (CONFIRMED from `DossierWorkspace.tsx` headings) |
|---|---|
| **Bounded context** (role_identity) | Context progression (the ladder of contexts and where this one sits), selected context heading, "Identity detail" (collapsible), what it includes / excludes, Growth panel |
| **Worker intent** | Worker name (editable, rename), Outcome, Instructions (the 10 sections: outcome, inputs, procedure, decision rules, quality bar, data handling, authority, failure handling, interaction, reporting — see §4.4), the generated `worker-intent.md` document (editable; "The Worker intent could not be read. It is in the package either way."), Deterministic steps ("Set when the Deterministic steps stage runs."), Agents and Harness, Environment and Tools, Model routing |
| **Brain › Skills** | The Skills bound; open one to read its package files (`SKILL.md` = "Worker instruction", plus reference/template files) |
| **Brain › Domain Specific Language** | The DSLs bound, with the composer's reason for each |
| **Brain › EVALs** | The checks bound (governed EVALs from the compliance/QE catalogue) |
| **Brain › Memory and learning** | Memory (types, scopes, retention, visibility), "Recall and retention", "Skill changes" ("Shared Skill: Never written by a Worker"), "Memory upkeep", "Sharing"; subheads "When it learns something that contradicts what it knew", "Nothing it learns may change", "Prohibitions composed", "Keeping recall inside its context", "Watching the recall budget", "Stopping it" |
| **Brain › Sentinel** | Sentinel settings for this Worker (sections: knowledge, skills, facts, routing, sharing — see `screens/worker-learning.md` for the same five sections in the Learning area) |
| **Definition of Done** | Table: Criterion · Required threshold · Calculation · Source EVAL · Details. Summary "N stop a release · N observed · Evidence retained per run". Per criterion "View validation logic": How the number is arrived at / What makes it pass / Measured against / EVALs it reads / The rule, as it is written. Evidence-requirement rows ("Artifact presence": "The run must produce this artifact before completion."). Empty: "No Definition of Done recorded." |
| **Autonomy** | Autonomy level (1–4, "Each level widens what the Worker may do without being asked", tag "Composed level"; empty "No autonomy level is set yet. It is set when the Autonomy stage runs."), "Maturity and learning" (growth along the two ladders, "Confirming autonomy confirms these too"), "Edit autonomy" |
| **Package and deploy** | See `screens/packaging.md` and the delivery workspace in `workflows.md` |

### 4.4 Draft fields (the `WorkerDraft` — `draft-v8`)

All fields below exist in the saved draft (CONFIRMED, `composeModel.ts`). "User editable" means a person can change it through the stage editors (the editors open from "Edit" on a station); "System" means the stage proposes it and the person confirms.

| Field | Meaning | Required for readiness? | Notes / validation (CONFIRMED) |
|---|---|---|---|
| workerName | Display name | Yes | "Add a Worker name." |
| boundedContextKey / businessDomainKey / geography | The declaration | Context yes | geography optional |
| owner | Accountable owner | Yes | "Assign an accountable owner." |
| outcome | One measurable outcome | Yes | ≥ 20 characters: "State one measurable outcome." |
| inputBoundary | Accepted input boundary | Yes | "Define the accepted input boundary." |
| primaryAgentId | The one approved Agent | Yes | Must be healthy (`healthy`/`ok`), not mock mode, with a **certified Passport** |
| collaboratorIds + collaboratorRoles | Collaborating Agents; role Maker / Verifier / Adjudicator | Role required per collaborator | Must be in catalogue |
| a2aHandoffs | Allowed Agent-to-Agent calls (caller, callee, purpose, action classes, policy ref) | ≥ 1 if any collaborators | Each edge must be enabled and `synced` |
| skillIds | Approved Skills | ≥ 1 | Each: status live/approved; licence allowed unless provenance internal; assigned to the primary Agent |
| domainLanguages | DSLs bound (domainId + why) | No | Server stage binds; editable (ADR 0096) |
| resourceIds | Enterprise resources/APIs | No | Must be active/healthy |
| harnessKeys + harnessSettings | Packaged harness the Worker serves from; settings keyed `<harness>.<path>` | No | Secret settings hold a Secrets-Manager **name**, never a secret |
| pipelineOverrides | reflection_enabled, validation_enabled, output_folders | No | tri-state |
| environment (EnvironmentSelection) | Environment profile key+version, architecture, persistence mode, access mode, tool grants | Yes | profile, architecture, workspace storage, operator access required; "Choose an Agent before granting Tools." |
| operatingMode | `propose` / `approval` / `bounded` / `autonomous` — how the Worker may act | Yes | "Choose how the Worker may act." |
| allowedEnvironment | The environment it may act in | Yes | "Set the allowed environment." |
| approvalActions | Actions needing approval | No | — |
| monthlyBudget | Monthly budget USD (draft-level) | No | Separate from the **spending limit set at deployment** (RULE-031) |
| dodCriteria | Definition of Done criteria (id, title, threshold, check, evidence, owner, adjudicator) | ≥ 1; all fields filled; threshold required; **owner ≠ adjudicator** (case-insensitive) | "Complete Definition of Done criterion N.", "“X” needs a threshold it can be measured against.", "Criterion N needs an independent adjudicator." |
| dodSkillSelections | DoD Skills pinned (key, version, digest, source url, state UNCHANGED/CUSTOMIZED) | ≥ 1 | If the catalogue Skill changed since selection: "X changed in the catalog. Review it again." |
| evaluationIds / evalSuiteId | Governed EVALs | ≥ 1, all available | "Select available evaluations." |
| modelsPolicy | routing_mode (`pinned` / `litellm_auto` / `external`), evidential routes (maker, verifier, adjudicator), runtime routing (candidate model ids), tier models | Maker and verifier from live catalogue; **verifier ≠ maker** | Each evidential model must be in the allowed list; automatic routing needs ≥ 2 allowed models; external routing needs a router reference; tier problems; local models need known size |
| memoryPolicy | readable_scopes (platform/tenant/crew/worker), writable scope (worker/crew), types (episodic/semantic/procedural), visibility (private/world), explain, housekeeping, erasure contact | `worker` scope must stay readable; erasure contact ref required | "This Worker memory must remain readable.", "Set the privacy operations reference." |
| learningPolicy | export tier (`tier0`…`tier3`), destination (`disabled` / `customer_quarantine` / `tcs_quarantine`), approval (customer approver group), capture inputs, candidate types, minimum contexts, feedback, promotion needs approval | See rules | tier ≠ tier0 → customer approver group required; tier0 → destination must be disabled; tier ≠ tier0 → destination must not be disabled |
| interactionPolicy | trigger mode (on demand / scheduled / event / …), schedule (timezone, calendar), event (source, event types) | Conditional | Scheduled needs timezone + calendar; event needs approved source + ≥ 1 event type |
| configurationExposure | Per-setting exposure: LOCKED / LOWER_ONLY / EDITABLE_WITHIN_BOUNDS / APPROVAL_REQUIRED / PLATFORM_MANAGED, with bounds | No | What the Worker's owner may change after deployment |
| sentinel* | mode `shadow`/`active`, max intervention `observe`/`pause`/`stop`, detectors, approval ref | Active needs approval ref | "Active AI Sentinel controls need an approval reference." |
| runtimeImage, runtimeArchitecture (amd64/arm64), runtimeProfile (api/browser/desktop), runtimeSize (small/medium/large), desktopEnabled | Runtime settings | Image must be an immutable digest | "Set an immutable container image digest."; desktop access requires profile `desktop` |
| deliveryMethod (download/content_store/ecs), awsRegion, ecsEnvironment, contentStore, ecsAutoStopMinutes | Delivery settings | — | `0` auto-stop = until a person stops it |
| instructions | The 10-section instruction document (below) | Must **conform** | Server verdict; see rule below |
| patternKey/patternVersion | Worker pattern (template) the draft started from | Yes | "Choose a Worker pattern." |
| intentDocument, intentEdited, intentSourceDigest | Generated `worker-intent.md` and whether a person edited it | — | Rewriting an edited document asks first |

**Instruction document sections** (`worker-instructions-v1`, CONFIRMED): outcome {statement, out_of_scope[], bounded_scope}; inputs {name, format, limit, source}[]; procedure {title, mode: deterministic|model, detail}[]; decision_rules {rules{when,then}[], escalations{when,to}[]}; quality_bar {key, threshold}[]; data_handling {classification: public|internal|confidential|restricted, redactions[], retention_days, never_log[]}; authority {allowed_tools[], forbidden_actions[], budget_ceiling_usd}; failure_handling {failure, response, escalate}[]; interaction {modes: on_demand|event|schedule|continuous|long_running, invokers[]}; reporting {name, destination}[].
**Conformance:** the server scores the document per section as `ABSENT | PARTIAL | COMPLETE`, with a total score, a pass score and a band (`INSUFFICIENT | PARTIAL | CONFORMANT | COMPLETE`). Each gap names the field to fix. Readiness fails if the instructions do not pass: "N instruction section(s) are missing: …" or "Instructions score X of Y; Z is needed." Until the server has answered: "Instructions have not been checked yet." (CONFIRMED)

**Readiness groups** (ten, in order; CONFIRMED): Instructions conformant · Capabilities valid · Environment and Tools set · Models set · Memory set · Learning set · Interaction set · Definition of Done set · Governance set · Delivery settings complete. Plus the server's `WorkerReadiness` (`READY_FOR_UNSIGNED_DRAFT | BLOCKED`, `authority: ADVISORY`, `source_snapshot: CURRENT | CHANGED | UNBOUND`).

## 5. User actions

| Action | Trigger | Preconditions | Result | Failure |
|---|---|---|---|---|
| Choose Worker type | Radio + "Choose Worker type" | A type selected and available | Moves to the Identity/Context decision | Catalogue error line: "Could not load Worker types." / "No Worker types available." |
| Confirm identity | Footer button | Context chosen | Creates the draft; opens the guided journey; reserves the identity | "The draft could not be created." + message; growth-unsaved panel (Retry/Continue) |
| Auto-assemble toggle | Checkbox | Context chosen | Chooses auto vs review walk | — |
| Confirm a checkpoint | Footer button named per checkpoint | Stage settled and proposal read, no pending edits | Writes the stage acceptance; advances | 409: "This draft changed. Reload before saving." + Reload. Dropped connection: "Checking whether the change was saved…" then either reload (it was saved) or "Changes not saved. The connection was interrupted before the console recorded it." / "Connection interrupted. Could not check whether the change was saved. Reload before confirming again." Other: "Changes not saved. {reason}" + Retry (re-sends same answers) |
| Answer a question | Stage `input.required` event (field, question, options, required) | Stage stopped with questions | Answers sent with the accept | — |
| Retry a failed stage | Retry in the workspace | Stage failed | Restarts the stage run | stage.failed shows code + message |
| Read the result again | Button in alert | Stage settled, proposal read failed: "The search finished but its result could not be read. Nothing can be confirmed until it is." | Reloads proposal | — |
| Edit a decision | "Edit" on a station / part | Station editable | Opens the stage editor (inline). Saving restarts that stage **and every stage after it** (`?restart=`); checkpoints from there on are no longer confirmed | Cancel returns to where it was |
| Back (review) | Footer | reviewStep > 0 | Goes one checkpoint back; never un-accepts a stage; footer then offers "Go to {next}" | — |
| Go to a station | Rail / diagram click | No unsaved edits | Moves focus | "Save or cancel the changes to {X} before leaving this station." |
| Save and close | Header | — | Navigates to `/compose/drafts` (everything is already saved server-side) | — |
| Package and deploy | Footer (appears when composed) / "Resume packaging" in header once started | All assembly stations READY | Opens the packaging/deployment workspace in-page | — |
| Rename Worker | Worker intent › name | — | Updates name; header refreshes | — |
| Write growth | Growth panel (Bounded context station) | Draft exists | PATCH `maturity_envelope` (If-Match record_version) | See DeclaredGrowthError |

## 6. Filters / search / sorting

- Searchable selects (Identity, Business domain, Geography). No sorting.
- Brain search evidence is shown under "Search evidence" / "Show what was searched" (sources opened with counts, filters with counts in scope, selected items with the reason, rejected items with the reason).

## 7. Navigation

- In: Launcher "Compose a Worker"; rail "Compose"; Saved drafts "Continue"/"New Worker"; shell "Work in progress" links (`?station=package_deploy&delivery=<id>`); Registry/Worker detail deep links (`?checkpoint=`).
- Out: breadcrumb "Compose" → `/compose/drafts`; "Saved drafts" button; Packaging (`/packaging`); a finished deployment notice → `/workers/{id}`.
- Header breadcrumb: Compose › {display identity or "New Worker"}. Scope line: "Revision {n} · Saved" or "· Unsaved changes".

## 8. State model (supported states only)

- **Journey phase:** `type` → `assign` → (created) `resuming` → `assembling`. "Opening the Worker — Restoring saved decisions." while resuming; failure shows the error message in place.
- **Per stage:** `idle | running (live) | settled | failed`, plus `accepted`; proposal state `loaded | failed`.
- **Station:** `NOT_STARTED | IN_PROGRESS | REVIEW | READY | NEEDS_ATTENTION`; rail marks danger (failed) or warning (questions).
- **Composed:** all assembly stations READY and no active stage and no held checkpoint → "Worker composed: Every checkpoint is confirmed and written to revision {n}. Nothing is built yet." with a checklist of the 8 checkpoints (each a link back).
- **Packaging station:** `NOT_STARTED | IN_PROGRESS | READY | NEEDS_ATTENTION` from the live packaging poll (every 8 s while packaging runs and its workspace is not mounted).
- **Resume rule:** the journey resumes at the first stage not yet accepted; in review mode `?step=` wins unless a restart was requested (then the first non-confirmed checkpoint). Browser state is never used as evidence that a stage completed. (CONFIRMED)

## 9. Data dependencies

`GET /compose/worker-types`, `/compose/worker-identities?worker_type=`, `/compose/bounded-contexts?worker_type=&identity=`, `/compose/geographies?business_domain=`, `/compose/dod-rubrics`; `POST /compositions`; `GET /compositions/{id}`; `GET /compositions/{id}/stage-runs`; `POST /compositions/{id}/stages/{stage}` (starts a run, returns an events URL); `GET /compose/stage-runs/{id}`; `POST /compose/stage-runs/{id}/accept` (body `{answers}`); `GET /compositions/{id}/compose-experience`; `GET /compositions/{id}/passport` (own packages); `GET /delivery-operations?composition=`; `GET/PATCH /compositions/{id}/growth`; `GET /compose/catalog`, `/compose/patterns`, `/compose/instruction-guide`, `POST /compose/instructions/evaluate`, `POST /compose/assist` (+ `/assist/health`), `/compose/policy-options`, `/compose/environment-profiles`, `/compose/tools`. Detail in `data-contracts.md`.

## 10. Business rules

RULE-020 … RULE-049 (see `business-rules.md`): independent verifier; owner ≠ adjudicator; threshold required for each criterion; certified Agent only; licence rule for Skills; shared learning needs an approver group; active Sentinel needs approval ref; etc.

## 11. Responsive requirements (inferred)

- A phone shows a "Section select" (or a named Back) instead of the rail, and puts "Worker summary" in a collapsible `details`. On desktop the diagram beside the decision is the station navigation (CONFIRMED, `usePhone()`, comments).
- Nested views (Sentinel part, Maturity) open as a nested page on a phone with a named "Back to Worker Brain" / "Back to Autonomy" and focus returns to the opener.
- Moving station scrolls the decision column to its top only when it is out of view; respects `prefers-reduced-motion`.

## 12. Current UI structure — LEGACY UI — NOT A DESIGN REQUIREMENT

Declaration: header with decision count → one big single-column form (Assign identity / Select bounded context / Growth / name / auto-assemble toggle / identity preview) → footer Back + Confirm. Journey: header → left station rail → left/center "Worker being built" diagram → right decision column (workspace) → footer with Back / progress text / confirm button. An animation shows selections "travelling" into the Worker during live assembly (AssemblyLane) — decoration only.

## UNKNOWN / not fully read

- The exact content and controls of each stage editor inside `ComposePage.tsx` (1,627 lines), `InstructionsDecision.tsx` (1,780), `CapabilitiesDecision.tsx` (828), `SentinelSettings.tsx` (1,149), `JourneyWorkspace.tsx` (1,468) were summarised from their data model and headings, not read line by line. UNKNOWN: precise per-field labels in those editors.
