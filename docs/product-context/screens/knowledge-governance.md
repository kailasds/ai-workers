# Screens: Knowledge governance — `/knowledge/coverage`, `/knowledge/inbox`, `/knowledge/packs` (catch-all `/knowledge/*`)

Source: `routes/knowledge/KnowledgePage.tsx`, `lib/knowledgeApi.ts`. Reached from the Knowledge library's quiet **Governance** link; "Back: ← Knowledge" returns to `/knowledge/skills`. Any other `/knowledge/<x>` (the retired overview, brains) redirects to `/learning`.

**Heading:** "Knowledge governance" — not "GBrain knowledge": "the rail says Knowledge … these are its governance views, not a second destination." Three views: **Coverage · Candidate decisions (inbox) · Packs**. A read-only **Context** select shows the single context (disabled). Permission needed: `knowledge.read` — "Your role cannot read this Knowledge view. Ask a platform administrator for knowledge.read." Edge-blocked: "The request was blocked."

## What this governs (CONFIRMED)
**Knowledge items** — the *mappings*, *pitfalls* and *negatives* a Worker can retrieve while migrating — are proposed by runs as **candidates**, reviewed by a person, **promoted** into a **pack**, and the pack is published as an immutable version after a regression gate passes. This is the *shared-knowledge governance loop*; the **loop stages** are `retrieve → record → extract → admit → publish` (`knowledge-loop-v1`; each stage `measured | worker_local | unavailable`, `worker_local` ⇒ count is null and must render as **unknown, not zero**; `blocked_by` names the missing prerequisite holding a stage at zero).

## Coverage — `/knowledge/coverage`
"Semantic coverage — Defined migration constructs and the admitted knowledge a Worker can retrieve for each. Candidates are counted separately until they are admitted." Table: Construct · Status (certified | corroborated | observed | **Nothing yet** (gap)) · Mappings · Pitfalls · Awaiting · Runs · Details. Summary counts (certified / corroborated / observed / gaps / proposed) and the pack in use (version, digest, item count). Detail: items covering the construct; "No admitted item covers this construct."; **Rehearsal** (available/unavailable with reason, "Rehearsal creation is unavailable."). Source freshness: `live | partial | stale | unavailable` → banner "Showing older Knowledge data" / "Knowledge data is incomplete" / "Knowledge source unavailable". Empty: "No taxonomy constructs found — Add the context taxonomy before measuring coverage." Limit: 200 constructs rendered (a stated ceiling).
Item confidence: `observed | corroborated | certified`; item type: `mapping | pitfall | negative`; generality `pattern | estate`; lane `lab | customer`.

## Candidate decisions — `/knowledge/inbox`
"Review literal evidence before changing shared knowledge." Lanes: **Lab** (count) and **Customer · unavailable** ("Customer candidates are unavailable. Customer emission is not enabled for this deployment."). Filters: Type (All types / Mappings / Pitfalls / Negatives …), status, contradiction, construct. Each candidate: type · status, title, "N runs · confidence", the **proposed diff** ("No file diff was proposed."), **ranked evidence** (run id, verdict PASS | FAIL | PARITY_UNPROVEN, stage analyse | specify | generate | validate | package | verdict, source kind episodic_event | diff | parity_report | recipe_ratio | verifier_result, score attribution, artifact ref, literal excerpt), **"Where this has spread"** lineage (retrievable now?, embedding present/model, packs it is in, retrievals count/runs/stages, emissions with gate AUTO | HOLD | NEVER and signed?, successors, "None still published.", "No Worker can receive this now.").
**Actions:** **Promote** (confirm: "Promote this candidate? It will enter the next pack proposal. Publication still requires regression evidence."), **Defer**, **Reject** (reason required, ≤ 2000 chars). The decision posts with `If-Match: "<item version>"`; a concurrent change shows "This candidate changed while you were reviewing it. The queue has been refreshed." A banner "Promotion is unavailable" appears when the service cannot take decisions. **Purge is human-controlled and "is not an API".** After a decision the item leaves the queue (deferred/decided items do not remain in it).

## Packs — `/knowledge/packs`
"Published packs — Immutable versions, regression result and observed Worker use." Per pack: version, state (`current | superseded | archived`), item count, regression (`pass | fail | unknown`, delta in percentage points, evidence ref), observed Worker count ("Worker use unavailable" if null), published time, digest. Open a pack: **diff from the previous version** (added / changed / removed items with type, title, content hash, evidence refs). Empty: "No published packs — A pack appears only after its regression gate passes."

## Data
`GET /knowledge/coverage?context=`, `/knowledge/loop?context=`, `/knowledge/items?context&lane&type&status&contradiction&construct_key`, `/knowledge/items/{id}`, `/knowledge/items/{id}/lineage`, `POST /knowledge/items/{id}/decisions`, `/knowledge/packs?context=`, `/knowledge/packs/{version}/diff?context&from`, plus the Learning-side `GET /knowledge/landscape`, `/knowledge/topics/{key}`, `/knowledge/brains` (estate memory landscape; see `learning-fleet.md`).

## Rules
RULE-180 A candidate becomes shared knowledge only by a person's Promote; publication additionally needs regression evidence. RULE-181 Candidates are counted separately from admitted items so a proposal cannot read as admitted. RULE-182 `worker_local`/unavailable ⇒ unknown, never zero. RULE-183 A pack is immutable; a new version is a new pack. RULE-184 Decisions are concurrency-checked by item version.

## Responsive / UI
Section nav → select under 768px. Current UI: LEGACY UI — NOT A DESIGN REQUIREMENT.

## UNKNOWN
Whether the `knowledge/landscape` and `topics` reads (memory landscape across Workers: topics = bounded contexts + "unclassified"; counts of observations, stale, contradictions, unembedded, at-risk Workers) currently have a mounted screen; their API client exists (`getKnowledgeLandscape`, `getKnowledgeTopic`, `getBrainFleet`).
