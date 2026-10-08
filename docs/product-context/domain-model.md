# Domain model

Plain-business-language description of every major entity, with **real values from the repo** (offline capture `apps/console-ui/offline-mock/routes.json`, dated 2026-10-06; test fixtures; type definitions in `src/lib/durableApi.ts`, `knowledgeApi.ts`, `portal.ts`, `session.ts`). Markers: **CONFIRMED** (stated in code/types/comments), **INFERRED** (reasonable reading), **UNKNOWN**.

Column legend for attribute tables: *Required?* = needed for the entity to be valid/ready (per readiness rules); *Editable?* = a person can change it in the console (Y / N / via-Compose / system).

---

## 0. The one-paragraph story
A person **composes** a **Worker**: they pick a kind of work, an identity, a business domain and a bounded context, and the platform assembles the Worker's **instructions, capabilities (Agent, Skills, domain languages, Tools), environment, models, memory and learning policy, evaluations, Definition of Done and governance**. The confirmed composition is a numbered **revision** of a draft. When ready, a person **packages** it — a sealed, versioned, checksummed **Package** — and **deploys** it as a **Runtime** (ECS or local) under a **spending limit**, or **delivers** it to a **customer**. A deployed Worker performs **runs**; each run is judged against the Worker's **Definition of Done** and gets a **verdict**. Runs leave **memories**; the Worker's own **Sentinel** weighs what runs teach it before it becomes **knowledge**; the **Platform Sentinel** oversees every Worker and can restrict or stop them. People and groups administer who may do what.

### Relationship chain (CONFIRMED structure)
```
Worker Type ─┬─ Identity ── Business Domain (optional) ── Geography (optional)
             └─ Bounded Context ─────────────────────────────────────────────┐
                                                                              ▼
Person ──composes──▶ WORKER (composition, revisions r1…rn, owner, SPIFFE identity)
                       │ contains (per revision)
                       ├─ Instructions (10 sections) + Pattern
                       ├─ AGENTS (primary + collaborators, A2A handoffs)
                       ├─ CAPABILITIES: Skills · Domain Specific Languages · Resources/Tools · Harness
                       ├─ Environment profile · Models policy · Memory policy · Learning policy · Interaction policy
                       ├─ EVALs · Definition of Done (criteria, owner ≠ adjudicator)
                       └─ Governance: operating mode · autonomy · Sentinel policy · configuration exposure · growth (maturity envelope)
                       │ sealed into
                       ▼
                   PACKAGE (immutable, digest) ──narrowed──▶ new Package (fewer Skills)
                       │                    └──prepared for──▶ CUSTOMER DELIVERY (share link · acknowledgement · source publication)
                       │ deployed as (spending limit, lifetime)
                       ▼
                   RUNTIME (Worker record: ECS|Local, slot, health) ◀── identity: credential (JWT-SVID)
                       │ performs
                       ▼
                   RUN ──judged by──▶ ADJUDICATION (verdict MET | NOT_MET | NOT_ADJUDICABLE, per-criterion)
                       │ leaves
                       ▼
                   MEMORY / EXPERIENCE ──candidate──▶ WORKER SENTINEL decision ──▶ KNOWLEDGE the Worker runs with (OKF)
                                                                               └─▶ proposed SKILL CHANGE (a human writes the shared Skill)
                   PLATFORM SENTINEL ── oversees all Workers ── decisions · restrictions in force · stops
```

---

## 1. Worker (a "composition")
**Meaning:** the thing the business creates and manages: an accountable, bounded AI agent with a name, an owner, an identity and a defined scope. In the data it is a **composition** (`composition-v1`) with revisions; "AI Worker" is the product word. **Why the user cares:** it is the unit of accountability — who owns it, what it may do, whether it met its Definition of Done.
| Field | Meaning | Example | Required? | Editable? | Displayed where? |
|---|---|---|---|---|---|
| id (composition_id) | UUID | `a9cb82d0-4508-4a8b-bd56-fbdbb856018b` | system | N | Registry (short id only if ambiguous), URLs |
| name (worker_name) | Display name; auto-named after work + domain if blank, min 2 chars | "Test Script Generation and Execution · Insurance" | Yes (ready) | via-Compose (rename in Worker intent) | everywhere |
| owner | Accountable person (display name; subject kept separately) | "Ancy P S" | Yes (ready) | via-Compose | Registry, Packaging |
| worker_type | Kind of work | `quality-engineering` | Yes | N after creation | Registry, Compose |
| identity key / business domain / geography | The declaration | `qe-test-script-generation` / `insurance` / (none) | type+identity+context yes; domain, geography optional | N after creation (restart Compose) | Compose, Worker detail |
| bounded_context | The one business boundary | key `qe-testcases-to-executed-scripts`, label "Test Automation Script Generation + Test Suite Execution + Reporting", 4 exclusions | Yes | N | Registry, Worker detail |
| outcome | One measurable outcome (≥ 20 chars) | "Produce a working automation script for every supplied test case, execute the suite against the deployed application, and report pass, fail or skipped per scenario with the evidence each verdict rests on." | Yes (ready) | via-Compose | Registry, Worker detail |
| current_revision / record_version | Revision number (r11) / write-concurrency counter | 11 | system | N | Registry ("r11"), Packaging |
| status | `ACTIVE` \| `ARCHIVED` | ACTIVE | system | admins archive unpackaged drafts | Saved drafts |
| created_at / updated_at | Times | 2026-10-05T10:13:57Z | system | N | Registry ("composed {date}") |
| identity (see §2) | The Worker's principal | SPIFFE id | system (issued at first build) | pause/resume/revoke | Worker detail |
**States:** draft (assembling) → composed (all assembly stations READY) → packaged → deployed (≥ 1 non-terminated runtime) → (stopped / terminated); archived (unpackaged drafts only). Registry shows the runtime facet: Serving / Stopped / Not serving / No runtime / needs attention.
**Actions:** create, continue, edit (new revision), rename, archive, package, deploy, stop, deliver, pause/resume/revoke identity.
**Relationships:** has many revisions, packages, runtimes, runs, memories; belongs to one bounded context/type/identity; owned by one person; has one identity.
**Real counts (capture):** 50 active Workers; 38 packaged; 35 "deployed" bucket; 1 serving; 29 in the QE test-automation context, 16 in "Converts Integration Service to Target Code", 4 in "…Unit Tested Target Code", 1 in "…Traced Target Code".

## 2. Worker identity (the Worker as a principal)
**Meaning:** a non-human identity (SPIFFE id + a short-lived bearer credential, JWT-SVID) that the Worker authenticates with. Reserved when the draft is created; **issued at first build**; its **bounded scope and exclusions are recorded at issuance** (a later edit is a new grant). **Why:** limits blast radius and makes actions attributable.
| Field | Meaning | Example | Required? | Editable? | Displayed |
|---|---|---|---|---|---|
| worker_id | `aw:tenant/<tenant>/worker/<slug>` | `aw:tenant/tcs-development/worker/qe-worker-0610-0c2a6718` | system | N | Worker detail |
| spiffe_id | Path `…/worker/{type}/{identity}/{domain}/{context}/{slug}` (flat form if no domain) | `spiffe://tcs.aiworker/worker/quality-engineering/qe-test-script-generation/insurance/qe-testcases-to-executed-scripts/…` | system | N | Compose preview, Worker detail |
| status | `PROVISIONED` \| `ACTIVE` \| `PAUSED` \| `REVOKED` | PROVISIONED | system | pause/resume/revoke | Registry ("Identity active"), Worker detail |
| credential_state | `UNISSUED` \| `ISSUED` \| `DISABLED` \| `UNAVAILABLE` | UNISSUED | system | N | Worker detail |
| token_ttl_seconds | Credential lifetime | 600 | system | N | "10 minutes" |
| can_present_credential | Whether it can authenticate now | false | system | N | Worker detail |
| bounded_scope / scope_excludes | What it may do / will refuse | "Test automation from written test cases" / ["Test Case Design and verification", "Test Data Discovery or Reference Data creation", "Issue Troubleshooting", "Defect Management"] | system | N | Saved drafts, Worker detail |
| revoked_at | When revoked | null | system | N | Worker detail |
**Rules:** REVOKED is terminal and never re-issued (RULE-100).

## 3. Worker type, Identity assignment, Business domain, Geography, Bounded context
| Entity | Meaning | Real examples | Notes |
|---|---|---|---|
| **Worker type** | The kind of work; decides which identities exist | `modernization` "Modernisation Worker" (3 contexts) · `quality-engineering` "Quality Engineering Worker" (2) · `software-engineering` "Full Stack Software Engineering Worker" (**in_build**, 0) | availability `available \| in_build \| withdrawn` |
| **Identity (assignment)** | What the Worker *is*; entitles bounded contexts | `qe-test-script-generation` "Test Script Generation and Execution" | `entitles[]`, `bounded_context_count` |
| **Business domain** | The business: decides Skills, DSLs and EVALs that come with it; optional | `insurance`, `payments` (Payments publishes 4 DSLs) | `skill_count`, `dsl_domain_ids` |
| **Geography** | Whose law the work answers to; optional; only changes which compliance EVALs bind (not a deployment region) | European Union (8 checks), India (5), United Kingdom (0; "Regulatory text not yet reviewed"), North America (8); "everywhere" = `bfsi.compliance.claims_handling`, `bfsi.compliance.underwriting_fairness` | counted live |
| **Bounded context** | The one business boundary: outcome, procedure (pipeline of N stages), in-scope/out-of-scope, DoD criteria, evaluation slugs, harness, models. Contexts form a **ladder** (each adds to the previous) | "Converts Integration Service to Target Code" → "…to Unit Tested Target Code" → "…to Traced Target Code" | `availability available \| in_build \| withdrawn`; `harness_stage`, `step_label`, `adds` |

## 4. Draft revision and Compose progress
**Meaning:** the saved, versioned definition of a Worker (`draft-v8`), plus the server-side record of which **stages** were run and **accepted**. **Stage run:** one automatic assembly job per stage with an event stream; its proposal is what the person confirms. **Compose experience:** the six stations and their states. All fields: see `screens/compose.md` §4.4.
**Stages (10):** identity · instructions · deterministic_steps · capabilities · environment · models · evaluations · memory · definition_of_done · governance. **Stations (6):** role_identity · worker_intent · brain · definition_of_done · autonomy · package_deploy. **Review checkpoints (8):** see `compose.md`.
**States:** stage `RUNNING | SETTLED | FAILED | CANCELLED` (+ degraded, accepted_at); station `NOT_STARTED | IN_PROGRESS | REVIEW | READY | NEEDS_ATTENTION`.
**Readiness** (`worker-readiness`): `READY_FOR_UNSIGNED_DRAFT | BLOCKED`, with issues by section (purpose, capabilities, environment, models, memory, learning, interaction, definition_of_done, governance, safety, package) and `source_snapshot CURRENT | CHANGED | UNBOUND`; authority is **ADVISORY** (the packaging gate is the server's).

## 5. Capabilities
| Entity | Meaning | Key attributes | Real example |
|---|---|---|---|
| **Agent** | An approved, certified software agent the Worker uses (primary + collaborators with roles Maker/Verifier/Adjudicator; allowed Agent-to-Agent handoffs) | key, name, health, mock_mode, certification (must be "certified"), governance, assigned skills | 250 agents in capture, e.g. "Authorization Optimization" |
| **Skill** | A reusable body of know-how: instructions + contract + references. Types `capability` or `definition_of_done` | name, title, description, category (27), version, status, tags, provenance, licence, assigned_agent_keys, worker_count, group | "BDD Feature File Authoring Standards" (`qe-bdd-authoring-standards`, quality_engineering, internal, 1.0.0, live). 111 Skills: Engineering 36 · Security 8 · Compliance 10 · Domain 57 |
| **Domain Specific Language (DSL)** | Business concepts, rules, relationships of an area, bound to a Worker with a reason | domain_id, name, path, version, market, industry, lines of business, statistics, plugin_slug | `payments-cards` "Card authorisation and acquiring" (11 axioms, 15 entities, 30 rules). 10 in capture |
| **Resource / Tool** | An enterprise API or tool the Worker may call; granted with allowed operations, data-boundary refs, budgets, revocation IMMEDIATE/DRAIN | key, resource_type, actions, auth_mode | "Branch Coverage API" (`branch-coverage-api`, getBranchCoverage) |
| **Harness** | The packaged execution image the Worker runs on (see `screens/harnesses.md`) | key, vendor, manifest, availability, settings | "Integration Modernisation Harness" 2.2.0; "Quality Engineering Harness" |
| **Environment profile** | Where/how it runs: kind HEADLESS/BROWSER/DESKTOP/CUSTOM, architectures, persistence (EPHEMERAL/S3_SYNC/EFS), access (NONE/TERMINAL/FILES/DESKTOP), cold start class | — | UNKNOWN (no capture of `/compose/environment-profiles`) |
| **Model** | LLM available through the gateway: id, provider, is_local, is_fine_tuned, availability | `anthropic/claude-3-5-sonnet`; `claude-sonnet-5` (maker), `gemini-2.5-pro-cto-oth` (verifier) in the fixture draft | 22 models in capture |
| **Pattern** | A named starting template for instructions + policy defaults + capability shape + a DoD template | key, version, recommended | `worker-pattern-v1` |

## 6. Evaluations and Definition of Done
| Entity | Meaning | Attributes | Example |
|---|---|---|---|
| **EVAL** | A check a Worker can be held to; `hard_gate` = required gate vs measured check; eval_type prompt/code/hybrid/deterministic/rule/statistical; pass_threshold, weight, category, version, review_note | `qe.ac_traceability` "Acceptance-Criteria Traceability" | 121 in capture, grouped engineering/security/compliance/domain |
| **DoD criterion** (composed) | What the Worker must prove: title, threshold (e.g. "85%"), check, evidence, owner, adjudicator (≠ owner) | — | "Functional Equivalence ≥ 85" |
| **DoD rubric** (library) | Platform definition of a criterion: key, display name, aliases, default threshold, calculation, method (llm_judge / harness_metric / code_skill / external_tool), skill_ref, measurement document+paths+normalisation, gating_by_default, availability AVAILABLE / REQUIRES_TOOL / NOT_IMPLEMENTED | 18 in capture: functional-equivalence, spec-coverage, codebleu-score, code-quality, golden-dataset-eval-pass-rate, ut-coverage … | A criterion may be **gating** ("stops a release") or **observed**; **NOT_MEASURED ≠ failed** |
| **Golden dataset** | The labelled cases a conversion is judged against (cases, enabled vs skipped with reasons, pass score) | total/enabled cases, dimensions | "the 29 cases … four of them are never run" |

## 7. Policies (parts of the draft that govern behaviour)
| Policy | Fields / values (CONFIRMED) |
|---|---|
| **Operating mode / Autonomy** | `propose` · `approval` · `bounded` · `autonomous`; **Autonomy level 1–4** ("each level widens what the Worker may do without being asked"); allowed_environment; approval_actions; monthly_budget. Mock runs: all 46 at Level 3. |
| **Models** | routing_mode `pinned` \| `litellm_auto` \| `external`; evidential routes maker/verifier/adjudicator (verifier ≠ maker); runtime routing (candidate list, intent routes, classifier, fallback, session affinity); objectives; resilience (timeout 60 s, retries 2, circuit breaker 5, cache); telemetry. Tiered routing: tiers `low/mid/complex`. |
| **Memory** (`memory-policy-v3`) | readable scopes platform/tenant/crew/worker; writable worker\|crew; types episodic/semantic/procedural; visibility private\|world; retention days; explain; housekeeping; erasure contact |
| **Learning** | export tier `tier0`–`tier3`; destination disabled/customer_quarantine/tcs_quarantine; approvals; capture inputs (trajectory_structure, dod_results, approved_feedback, costs, tool_names); candidate types (correction, procedure, evaluation_case, failure_pattern, knowledge_claim); minimum contexts; promotion needs approval |
| **Interaction** | trigger: on demand / scheduled (timezone, calendar) / event (source, event types) / continuous / long-running; invokers |
| **Configuration exposure** | per-setting mode LOCKED, LOWER_ONLY, EDITABLE_WITHIN_BOUNDS, APPROVAL_REQUIRED, PLATFORM_MANAGED + bounds |
| **Sentinel policy** | mode shadow\|active; max intervention observe/pause/stop; detectors; approval ref; five dimensions (monitor, enforce, align, control, unlearn) |
| **Growth (maturity envelope)** | two ladders (bounded context; autonomy rungs L1–L4), start, ceiling, promotion criteria per step, demotion rules (DoD regression window, boundary violation → demote to start, autonomy digest change → reset to start), above ceiling → propose_to_human \| stop. Platform maturity mode is `shadow` ("nothing moves yet"). |
| **Spending limit** | A **monthly USD limit chosen at deployment** (never in Compose; a Package carries none); required for every deploy / Deploy again / Resume; min/max bounds; prefilled from in-force, inherited (must be confirmed) or worker-type default; resets at UTC month start; deployment refused if this month's spend cannot be read. |

## 8. Package
**Meaning:** the sealed, versioned, checksummed artifact built from an accepted revision; what is deployed or delivered. Immutable — "narrowing" (dropping Skills) creates a **new** Package.
| Field | Meaning | Example | Editable? | Displayed |
|---|---|---|---|---|
| id | UUID | `0d90912c-a7d4-4df7-8f24-29c8083f63b2` | system | Worker detail, Packaging |
| composition_revision / package_sequence | Revision sealed / nth package | 11 | system | "Package r11" |
| status | `DRAFT_QUEUED \| DRAFT_PREPARING \| DRAFT_READY \| DRAFT_FAILED \| ARCHIVED` | DRAFT_READY | system | Packaging |
| artifact_sha256 / size / filename | Integrity | — | system | Delivery detail |
| failure_code | Why a build failed | — | system | — |
| contents | Sections integrity VERIFIED/FAILED: identity & intent, governance (DoD + Sentinel), runtime & maintenance, intelligence (Skills, memory, learning), integrity (checksums & provenance) | all VERIFIED (delivery example) | system | Delivery detail |
| stale | package revision < draft revision | — | derived | Packaging, wizard |
**Build phases (six shown in the packaging progress rail; deployment has its own rail of "fourteen milestones" per a code comment):** Validate accepted revision → Seal identity and instructions → Render deterministic pipeline → Pack agents, skills and Harness → Bind EVALs, Definition of Done and governance → Store package and integrity digest. **Source publication:** optional publish of generated source to GitLab (`NOT_PUBLISHED | PUBLISHING | PUBLISHED | FAILED | UNAVAILABLE | UNREACHABLE`; project `ai_worker/modernization_worker`).

## 9. Runtime (the "Worker record")
**Meaning:** one deployed instance of a Package; a Worker may have several (slots). Statuses are two separate observations: **lifecycle** (state) and **health**.
| Field | Meaning | Example | Displayed |
|---|---|---|---|
| id | Runtime UUID | `804ced56-4056-4c39-a0e7-c9143a9e6c03` | Registry detail, Operate |
| target | `ECS` \| `LOCAL` | ECS | Registry |
| state | `DEPLOYING \| RUNNING \| STOPPED \| FAILED \| TERMINATED` | RUNNING | Registry, Operate |
| health | `STARTING \| HEALTHY \| UNHEALTHY \| STOPPED \| UNKNOWN` | HEALTHY | same |
| runtime_slot, desktop_enabled, runtime_fronted | which slot; has desktop; Runtime fronts routing | 1, true, true | Worker detail |
| image | image digest | `…/aiworker-dev/candidates@sha256:650b8c19…` | details |
| restart_count, created_at, observed_at, expires_at | — | expires 2026-10-06T10:52Z (auto-stop) | Worker detail |
| stop_reason | `stopped` (a person), `expired` (auto-stop), `terminated`, `termination_failed` | null | Registry ("Stopped by an operator", "Expired at its auto-stop time", "Termination failed. Retrying.") |
**Capture mix:** 43 runtime records: 34 STOPPED ECS, 6 TERMINATED ECS, 1 RUNNING/HEALTHY ECS, 1 STOPPED LOCAL, 1 TERMINATED LOCAL.
**Actions:** deploy (ECS / local) with spending limit and lifetime (15 min–7 days, or "until stopped"); stop (reason); resume (reason, only if a person stopped it); deploy again (current certified vs as-last-time images; reason if held); terminate (irreversible); configure; open console (desktop/screen/configuration route); run sample.
**Hold:** a Platform Sentinel stop/pause (`WorkerHold {kind stop|pause, decision_id, by, reason, since}`); deploy-again/resume then needs a reason recorded as a lift.

## 10. Run and Adjudication
**Meaning:** one execution of work by a Worker, judged by the Worker's own adjudicator against the Definition of Done.
| Field | Meaning | Example |
|---|---|---|
| run_ref / run_id | id | `r-20260930t115950-23cc74d6` |
| state | `submitting`, `refused`, running…, `COMPLETED \| FAILED \| CANCELLED` | — |
| verdict | `MET \| NOT_MET \| NOT_ADJUDICABLE` ("Awaiting evidence") | MET |
| criteria[] | per criterion: key, threshold, state `PASS \| FAIL \| NOT_MEASURED \| OBSERVED \| UNAVAILABLE`, measured, type, source, adjudicator, gating, note, account, not_automated cases | — |
| duration_seconds | — | 84.24 |
| usage | input/output/total tokens, model_cost_usd as `{state, value}` (a Worker that could not read its usage says so) | 106,273 tokens; $0.261650 |
| routing | legs (stage, model, tier, complexity) | "Claude-5.0-Sonnet" chosen 99× across ANALYZER, CODE_REMEDIATOR, EVALUATOR, MODERNIZER, SPEC_GENERATOR |
| from_code → to_code | conversion pair | — |
**Estate stats (capture, 30 days):** 46 completed runs, 20 DoD met, 18 not met, 8 awaiting evidence; cost coverage 43/46; $8.56/run average; 3.89 M tokens/run.

## 11. Customer delivery
Fields: delivery_id, composition_id, worker_name, revision, version, digest, destination_label (customer), state `PREPARING | PREPARED | SHARED | DOWNLOADED | ACKNOWLEDGED | EXPIRED | FAILED`, expires_at, last_evidence_at, requirements (architecture, CPU, memory, storage, container runtime), contents[] with integrity, callback {configured, observed}, source {state, repository, tag}, size_bytes, images {packaging SEPARATE|BUNDLED, size, sha256}.
**Real example:** "Integration modernisation · Payments" r12 for "Bank X", SHARED, digest `sha256:a85b81c6…`, 101,917 bytes, requirements Linux ARM64 / 1 vCPU / 2 GB / 20 GB, source PUBLISHED to `…/workers/integration_modernisation_payments/r12-a85b81c6efe0`, tag `integration_modernisation_payments-r12-a85b81c6efe0`, callback DISABLED/NOT_OBSERVED. 6 delivery records in capture.
**Matured additions:** what a Worker earned that the Package does not contain — memory records (by kind), brain claims (agreed sentences with observation counts), Skill additions (per Skill, per section, runs that agreed) — put **beside** the sealed Package with their own digests; optional, "not approval or adoption".

## 12. Memory, Brain (GBrain), Experience, Lesson, Candidate
| Entity | Meaning | Attributes | Notes |
|---|---|---|---|
| **Memory (record)** | One thing a Worker learned, with citations (≥ 1 required) | id, memory_type episodic/semantic/procedural, scope platform/tenant/crew/worker, content, salience, citations, contradiction_of, stale, source_run_id, run {verdict, criteria}, created_at, archived_at | `configured:false` (never allowed) ≠ zero (has not learned yet) |
| **Brain / GBrain** | The Worker's memory engine (e.g. GBrain 0.48.1.0) | state `not_packaged \| unreachable \| sealed \| idle \| learning`, engine+store (postgres/pglite), durability (ephemeral / local_volume / efs / s3_sync / external_postgres; survives_restart), holds (facts, entities, pages, chunks, links, timeline), recall (embedding route/model/dimensions, embedded ratio, stale chunks, width agrees, latency), housekeeping, verbs | Capture example: Worker composed **without** a memory engine → "does not learn from its own runs. Nothing is wrong." durability "ephemeral — destroyed every time the task is replaced" |
| **Experience** | A rule-derived learning from a run (failure_recovery, stable_recovery, eval_delta, human_correction, skill_recurring_failure, knowledge_contradicted, novel_success, cost_reduction, landscape_fact, run_recovery) | verified (certified, non-replay), dod_met, remembered (fact id), baseline vs adaptation strategy | |
| **Lesson** | What a run that did **not** meet DoD teaches (uncertified, never served) | status open/resolved; resolved by a later certified run passing the same cases | |
| **Candidate** | A proposed piece of knowledge from experiences | kind, title, claim, status, supporting/contradicting runs, distinct contexts, confidence {score, band}, counters helpful/harmful | judged by the Worker Sentinel |
| **Claim (agreed)** | A sentence several runs agree on | kind, key, sentence, observations, runs | sent with delivery if chosen |

## 13. Knowledge vs Learning (the difference — CONFIRMED)
| | **Knowledge** (`/knowledge`) | **Learning** (`/learning`) |
|---|---|---|
| What | The **library** of what TCS knows: Skills, Domain Specific Languages, EVALs, DoD rubrics, small models; plus **governance** of shared knowledge items and packs | The **record of change**: what a given Worker (and the estate) has *added* by running |
| Who authors | People (Skill wizard, registries); shared knowledge items promoted by a person | Workers produce experiences, memories, candidates, **proposed** Skill changes; the Worker Sentinel decides what becomes served knowledge |
| Direction | Given **to** a Worker at compose time | Comes **from** a Worker's runs |
| Unit of change | Publish/revise a Skill; promote a knowledge item; publish an immutable pack | Run → memory/experience → candidate → Sentinel decision → (served) concept in the Worker's OKF; a *proposed* Skill change (never written by the Worker) |
| Reader | People choosing what Workers can be given | People asking "did the Workers get better?" |
**Meeting point:** a Worker's **OKF bundle** (Open Knowledge Format `okf-0.2`: concepts + Skills + index) is what the Worker's Runtime *serves*; it has a **composed** part (from the Package) and a **learned/compounded** part, plus a person's **overlay** (edits that need gates + a second person). The OKF browser sits under Learning because it shows what *this Worker* runs with.

```
KNOWLEDGE (library, people-authored)                LEARNING (record, Worker-produced)
 Skills ─┐                                            Run ─▶ Memory/Experience ─▶ Candidate
 DSLs   ─┼─ composed into ─▶ Worker (Package) ─▶ runs                        │
 EVALs  ─┤                                                 Worker Sentinel decision (shadow/enforce)
 DoD    ─┘                                                      │ approve                 │ proposes
 Knowledge items (mappings/pitfalls) ──promote──▶ PACK          ▼                          ▼
 (shared, governed: candidates → person decides → pack)   OKF served to next run     Proposed Skill change
                                                                 ▲                        (human writes shared Skill)
                                      person edit (propose → gates → 2nd person approves) ┘
```
**Shared-knowledge governance (Knowledge › Governance):** candidate items (mapping/pitfall/negative; lane lab/customer; confidence observed/corroborated/certified; generality pattern/estate) → person Promote/Defer/Reject → pack (immutable version; regression gate; state current/superseded/archived).

## 14. Sentinel
| Entity | Meaning | Attributes |
|---|---|---|
| **Worker Sentinel** | Runs inside each Worker Runtime; weighs candidates; per decision: id, candidate, outcome `approve \| pending_human \| hold \| reject \| quarantine`, mode shadow/enforce, applied, transition, **gates** (pass/fail/not_applicable/pending), reasons, required_actions, evidence runs, envelope digest, policy revision, hash chain, execution-replay requirement | |
| **Platform Sentinel decision** | Fleet decision: id (e.g. P-000413), time, dimension, severity 0–3, grant?, headline, subject, outcome, mode, applied, scope {worker/customer/harness/platform}, decided_by, approved_by, policy revision, parent/children (per receiver), trigger, reasoning {because, therefore, would change if, next check}, criteria (rubric), affected Workers (with applied state), evidence, digests, hash/previous | |
| **In force** | A currently active restriction: kind block/pause/restriction/directive/stop, scope, effect, workers, applied, since, expires, by, reason, lift_when | none in capture |
| **Signal** | A fleet observation that is not a decision | — |
Capture: Platform Sentinel not acting; 0 decisions, 0 in force; coverage running 1 / reporting 0 / unavailable 1 / not running 34; chain unverified (0 entries).

## 15. Harness and conformance
Harness (see §5). **Conformance report:** id, harness+version, image digest, recipe, suite version, contract {major, minor}, 15 checks with group and result, counts, state `admitted \| checked \| rejected`, admission {at, by}, submitted_by, source {repository, commit}, adapter analysis (untouched / edited / added files).

## 16. People, groups, roles, features
| Entity | Attributes | Example |
|---|---|---|
| **Person** | id, email, username, displayName, role + roleLabel, status `invited \| active \| disabled`, features (effective), groups, internetAccess, provisioned, invitedBy/At, activatedAt, lastActiveAt, lastInviteStatus `sent \| failed \| skipped` | Dana Okafor, Composer, active (fixture) |
| **Group** | id, slug, name, description, defaultRole, defaultInternetAccess, features, memberCount | `bfsi-reviewers` "BFSI reviewers" (fixture) |
| **Role** | key, label, description, features | administrator, composer, operator, viewer, auditor (fixture) |
| **Feature** | key, label, group, description | `compose.view`, `compose.author`, `workers.view/build/deploy/operate/retire`, `evidence.view/export`, `environment.manage`, `users.manage` |
| **Session identity** | subject, username, email, displayName, roles[] | capture: `offline-demo-capture`, role `aiworker-admin` (the role string the console reads for admin-only archive) |
| **Permissions** | userId, username, email, displayName, role, roleLabel, features, groups, bootstrap | — |

## 17. Operations (background work)
`WorkflowRunRecord`: id, operation (`PREPARE_DRAFT`, `DEPLOY_ECS`, `DEPLOY_LOCAL`, `RUN_READINESS`, customer delivery preparation), state `QUEUED \| RUNNING \| WAITING_RETRY \| PAUSED \| CANCELLING \| CANCELLED \| SUCCEEDED \| FAILED`, phase, progress (0–100), retryable, error_code, created_at. Observable via SSE (`/workflows/{id}/events`) with polling fallback; resumable and cancellable.

## UNKNOWN / not captured
Environment profiles and tool catalogue values; real people/groups data (capture returns `session_expired`); `learning-worker-v1` and `worker-learning-v1` real payloads (capture: Worker has no Brain, runtime refuses learning reads); platform Sentinel decisions (none recorded).
