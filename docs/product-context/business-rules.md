# Business rules

Every rule below was read from code, comments, tests or types. Nothing here is invented; where the **server** is the authority and the client only mirrors it, the rule says so. Rule ids are stable: the screen docs refer to them. **Confidence:** all CONFIRMED unless a row says otherwise.

| Rule | Condition | Behaviour | Affected screens | Confidence |
|---|---|---|---|---|
| RULE-001 | Any request | Authority is resolved server-side on every request. The console only decides what to show; an entry the account cannot use is hidden, not disabled, and a hidden entry is never a security boundary. | All | CONFIRMED |
| RULE-002 | Any value that may not be known | `null`/not-measured/unreachable is shown as unknown in words ("Not measured", "Not reported", "Did not report"). An unknown is never rendered as 0, empty, "none" or a tick. | All | CONFIRMED |
| RULE-003 | Any state-changing action | The actor, time and (where the platform asks) a reason are recorded; stops and resumes become Platform Sentinel decisions; identity, deployment and spending-limit receipts name who set what and when. | Operate, Registry, Worker detail, Sentinel | CONFIRMED |
| RULE-004 | A feature that is composed but not enforced / shadow / declared | The UI says what is true instead: "Declared — not enforced yet", "Recorded, not applied", "Would …", "Sharing is declared, not active". Shadow is never green or "served". | Compose, Learning, Sentinel | CONFIRMED |
| RULE-005 | Learning, Sentinel and Knowledge-reading pages | These are reading surfaces: no Approve/Stop/Unlearn on Learning pages; changes happen in the owning place (Compose, Maintenance, OKF browser, Knowledge governance, Sentinel › Workers). | Learning, Sentinel | CONFIRMED |
| RULE-006 | Showing a Skill, EVAL, DSL, criterion or agent | Show the human name; show the identifier only when no name resolves or when needed to quote into a ticket. | Delivery, Packaging, Compose, Knowledge | CONFIRMED |
| RULE-007 | Showing a time | Local time of the reader with the zone in the title; charts bucket in the reader's zone (UTC fallback disclosed). | All | CONFIRMED |
| RULE-008 | A sealed Package or recorded decision | Immutable. Change = new revision / new Package / new pack / new overlay version; the old one stays verifiable. | Packaging, Delivery, Worker detail, Knowledge governance, OKF | CONFIRMED |
| RULE-009 | Shared knowledge or sharing between Workers | Requires evidence and a second person / the other Worker's Sentinel; today sharing is declared only. | Learning, Knowledge governance, OKF | CONFIRMED |
| RULE-010 | Metric state ≠ OBSERVED | Render "Not measured"/"Not reported" (muted); never 0. | Dashboard, Registry, Learning | CONFIRMED |
| RULE-011 | Any average / total over runs | State the sample with it ("43/46 runs reported"); averages are over measured runs only. | Dashboard | CONFIRMED |
| RULE-012 | Cost figures | "Reported model cost is what the runs reported, not a bill." | Dashboard | CONFIRMED |
| RULE-013 | Definition of Done criteria on a dashboard or in Knowledge | List each criterion with passed/measured; never average into one score; gating ⇒ "stops a release"; no threshold ⇒ "No required threshold". | Dashboard, Knowledge › DoD, Worker detail | CONFIRMED |
| RULE-020 | Instruction document | Server conformance verdict must pass (score ≥ pass score, no ABSENT sections); until checked it reads "Instructions have not been checked yet". | Compose | CONFIRMED |
| RULE-021 | Draft identity fields | Worker name, accountable owner, one measurable outcome (≥ 20 characters) and an accepted input boundary are required before packaging. | Compose | CONFIRMED |
| RULE-022 | Primary Agent | Exactly one approved Agent: healthy (`healthy`/`ok`), not in mock mode, with a certified Passport. | Compose | CONFIRMED |
| RULE-023 | Collaborating Agents | Each needs a role (Maker / Verifier / Adjudicator); if any collaborators, at least one allowed Agent-to-Agent handoff, and each handoff edge must be enabled and synced. | Compose | CONFIRMED |
| RULE-024 | Skills | At least one Skill; each must be live/approved, have an allowed recorded licence unless its provenance is internal, and be assigned to the primary Agent. | Compose | CONFIRMED |
| RULE-025 | Resources / Tools | Each selected resource must be active/healthy; granting Tools requires an Agent. | Compose | CONFIRMED |
| RULE-026 | Incomplete capability catalogue | Blocks export until source failures are resolved ("The capability catalog is incomplete"). | Compose | CONFIRMED |
| RULE-027 | Environment | An available environment profile (+version), supported architecture, workspace storage and operator access mode are required. | Compose | CONFIRMED |
| RULE-028 | Models | Maker and verifier must come from the live catalogue and **differ** (independent verification); every evidential model (maker, verifier, judge) must be in the allowed list; automatic routing needs ≥ 2 allowed models; external routing needs an approved router reference; selected local models need known package size/requirements; tier problems block. | Compose | CONFIRMED |
| RULE-029 | Memory | The Worker's own scope must stay readable; a privacy operations (erasure) contact reference is required. | Compose | CONFIRMED |
| RULE-030 | Learning export | Tier above tier0 needs a customer approver group and a quarantine destination; tier0 must have destination disabled. | Compose | CONFIRMED |
| RULE-031 | Spending limit — where | Chosen at **deployment only** and recorded there; every deploy, Deploy again and Resume carries one; Compose never asks for it and a Package carries none (the draft's `monthly_budget` is separate). | Compose, Operate, Registry, Worker detail | CONFIRMED |
| RULE-032 | Spending limit — value | Must be within the offer's minimum/maximum, whole or 2-decimals; blank never means unlimited; an **inherited** amount counts only once explicitly confirmed; prefill source is stated (in force / inherited / Worker-type default). | SpendingLimitField | CONFIRMED |
| RULE-033 | Spending limit — month spend | If this month's spend cannot be read the deploy is refused ("…cannot be deployed. Try again later."); limits reset at the start of each UTC calendar month, shown in the reader's time. | SpendingLimitField | CONFIRMED |
| RULE-034 | Interaction triggers | Scheduled work needs a timezone and calendar; event-driven work needs an approved source and ≥ 1 event type. | Compose | CONFIRMED |
| RULE-035 | Governance | Operating mode and allowed environment are required; an active (non-shadow) Sentinel needs an approval reference. | Compose | CONFIRMED |
| RULE-036 | Definition of Done | ≥ 1 DoD Skill selected and unchanged in the catalogue since selection (else "changed in the catalog. Review it again"); ≥ 1 criterion with title, check, evidence, owner, adjudicator all filled **and a threshold**; owner ≠ adjudicator (case-insensitive); ≥ 1 available EVAL. | Compose | CONFIRMED |
| RULE-037 | Runtime settings | Container image must be an immutable digest; desktop access requires the desktop runtime profile. | Compose | CONFIRMED |
| RULE-038 | Editing a decision | Saving an edit restarts that stage and every later stage; checkpoints from there on are no longer confirmed; a deployed Worker is never changed in place — the result is the next immutable revision. | Compose, Worker detail | CONFIRMED |
| RULE-039 | Assembly | Nothing enters the Worker until the person confirms it; auto-assemble accepts resolved proposals but always stops on questions, failures and deployment actions. | Compose | CONFIRMED |
| RULE-040 | Resuming | The journey is reconstructed from server records (stage runs, experience, packages, operations); browser state is never evidence that a stage completed. The first non-accepted stage is the resume point. | Compose | CONFIRMED |
| RULE-041 | Bounded contexts / types / identities | An option whose availability is `in_build` or `withdrawn` is shown disabled with its reason; the server refuses it at readiness too (a disabled control is a courtesy). | Compose | CONFIRMED |
| RULE-042 | Identity reservation | Reserved when the draft is created (before any build); the Worker identifier path is shown only when a business domain is chosen (all four segments or none); the trust domain is the server's. | Compose | CONFIRMED |
| RULE-043 | Business domain | Optional. Without one: no domain language binds; Skills come from cross-cutting practice and the conversion itself. | Compose | CONFIRMED |
| RULE-044 | Geography | Optional; changes only which compliance checks bind (not a deployment region); checks that name no jurisdiction still bind everywhere; counts are live and per business; unreviewed regulatory text is flagged on the choice. | Compose | CONFIRMED |
| RULE-045 | Worker name | If given: ≥ 2 and ≤ 120 characters; if empty: named after work + domain. | Compose | CONFIRMED |
| RULE-046 | Growth | Allowed only up the ladder through available steps; a ceiling that is no longer reachable is treated as Keep; if saving growth fails the draft is kept (never created twice) with Retry/Continue. | Compose | CONFIRMED |
| RULE-047 | Confirming a stage | Sent once; on a dropped connection the console reads whether it was saved before offering anything; 409 ⇒ reload. | Compose | CONFIRMED |
| RULE-048 | Packaging | Is a separate decision after composing (not auto-started); the rail gains a Package-and-deploy station only once packaging begins. | Compose, Packaging | CONFIRMED |
| RULE-049 | Readiness | The client's readiness list is advisory; the server's gate at package creation is authoritative and its first issue is shown if it refuses. | Compose, Packaging | CONFIRMED |
| RULE-050 | Archiving a draft | Only administrators, only ACTIVE drafts with **no Package**; refused with 412 (changed) / 409 (package being prepared) / 403. | Saved drafts | CONFIRMED |
| RULE-051 | What an identity proves | A reserved identity is not evidence a draft was built (one exists from creation); packaged status comes from the Package list. | Saved drafts | CONFIRMED |
| RULE-060 | Offering a build | Only `READY_FOR_UNSIGNED_DRAFT` drafts are offered Build; blocked drafts show the server's reasons instead. | Packaging | CONFIRMED |
| RULE-061 | Stale Package | Package revision < draft revision ⇒ warn "Newer draft available"; a delivery prepared from the old Package would ship a Worker that no longer matches its composition. | Packaging, Delivery | CONFIRMED |
| RULE-062 | Queue membership | Packaged = has a Package and no non-terminated Worker; Deployed = has a Package and a Worker whose state ≠ TERMINATED. | Packaging | CONFIRMED |
| RULE-063 | Running build | Is resumed/viewed, never started twice; one operation per composition (newest) is shown. | Packaging, Shell | CONFIRMED |
| RULE-070 | Preparing delivery | Only a sealed `DRAFT_READY` Package. | Customer delivery | CONFIRMED |
| RULE-071 | Already delivered | A Worker present in the delivery directory is not offered again in "To prepare". | Customer delivery | CONFIRMED |
| RULE-072 | Eligibility unknown | If delivery records failed, are loading or were only partly read, Prepare is disabled with that reason. | Customer delivery | CONFIRMED |
| RULE-073 | Evidence scope | Prepared ≠ sent; a share link ≠ receipt; an acknowledgement ≠ deployment; a configured callback ≠ connected; customer runtime status is "not observed by this record". | Customer delivery, Registry | CONFIRMED |
| RULE-074 | Names vs keys | See RULE-006. | Delivery | CONFIRMED |
| RULE-080 | Sealed Package | Cannot be edited; narrowing seals a **new** Package (new revision + digest) because learning is attached beside the package so its own checksums keep verifying. | Delivery wizard | CONFIRMED |
| RULE-081 | Narrowing | Only Skills can be dropped; DSLs, EVALs and DoD travel as sealed (dropping them composes a different Worker); unavailable when a newer draft exists or holdings could not be read. | Delivery wizard | CONFIRMED |
| RULE-082 | Including learning | Optional, per section and per Skill addition; "not approval or adoption"; omitted additions key = all, list = exactly those. | Delivery wizard | CONFIRMED |
| RULE-083 | Duplicate preparation | An identical in-flight preparation is joined (`started:false`); retries are reconciled with the server first; the receipt is the delivery the operation names. | Delivery wizard | CONFIRMED |
| RULE-084 | Customer | Required, ≤ 120 characters. | Delivery wizard | CONFIRMED |
| RULE-090 | Registry scope | Lists every Worker (composition) with its runtime facet and latest outcome; a Worker with no runtime is still listed. | Registry | CONFIRMED |
| RULE-091 | Resume vs redeploy | Resume only for a stopped ECS runtime a person stopped (service kept); otherwise Deploy again (stopped or failed ECS, not `termination_failed`). | Registry, Operate, Worker detail | CONFIRMED |
| RULE-092 | Deploy again images | Choice between Current certified Runtime and As last time, each with pass/fail checks (package, contract, images, cost, desktop); a failed choice is not selectable. | Registry, Operate | CONFIRMED |
| RULE-093 | Held Worker | If the Platform Sentinel stopped/paused it, resume/redeploy needs a reason, recorded as a lift; `PLATFORM_HOLD`/`HARNESS_BLOCKED` refusals show the server's sentence and decision link and offer no retry. | Registry, Operate | CONFIRMED |
| RULE-094 | Health vs lifecycle | Health is a separate observation and is never printed over a stopped/failed/terminated lifecycle. | Registry, Worker detail | CONFIRMED |
| RULE-095 | Tone | Green only for verified results; active/configured/published/waiting/unknown are neutral. | All | CONFIRMED |
| RULE-100 | Revoked identity | Terminal; never re-issued (reviving would revalidate credentials minted before revocation); compose a new Worker. | Worker detail | CONFIRMED |
| RULE-101 | Credentials | Bearer tokens with short TTL; the credential is never stored or shown; revoke stops issuance, not recall. | Worker detail | CONFIRMED |
| RULE-102 | Identity authority | Recorded at issuance (bounded scope + exclusions); a later edit is a new grant. | Worker detail, Saved drafts | CONFIRMED |
| RULE-103 | Deployed Worker | Never mutated by editing; editing yields the next revision. | Worker detail, Compose | CONFIRMED |
| RULE-104 | Run verdicts | Belong to the Worker's own adjudicator; the console keeps no private copy it might disagree with; unadjudicated = "Awaiting evidence". | Worker detail, Dashboard | CONFIRMED |
| RULE-105 | Reachability | Unreachable Worker ⇒ unknown, not "no runs"; recorded runs kept by the platform are shown separately. | Worker detail | CONFIRMED |
| RULE-110 | Post-deploy configuration | Only fields the Package exposed as editable can be changed; each has bounds and a rule sentence. | Worker configuration | CONFIRMED |
| RULE-111 | Exposure modes | LOCKED · LOWER_ONLY · EDITABLE_WITHIN_BOUNDS · APPROVAL_REQUIRED · PLATFORM_MANAGED. | Compose, Worker configuration | CONFIRMED |
| RULE-112 | Approval-required fields | Saving needs an approval reference. | Worker configuration | CONFIRMED |
| RULE-113 | Concurrency | Config saves are ETag/If-Match; stale ⇒ keep edits, tell the person. | Worker configuration | CONFIRMED |
| RULE-114 | Tiered routing | While routing is tiered the Runtime grants each run its model; model settings are "Managed by the Runtime" and read-only. | Worker configuration, Learning | CONFIRMED |
| RULE-120 | Stopping a runtime | Requires a reason (≤ 500) and is recorded as a Platform Sentinel decision; interrupts any run in progress on that runtime only. | Operate, Sentinel | CONFIRMED |
| RULE-121 | Terminating | Irreversible for the runtime; Worker record, packages and runs remain. | Operate | CONFIRMED |
| RULE-122 | Deploying anything | Needs a spending limit choice (RULE-031). | Operate, Compose | CONFIRMED |
| RULE-130 | Learning score | `E + 2P + 3S + C` computed by the server, never recomputed by the console; unreported terms are "not reported"; partial scores are labelled. | Learning | CONFIRMED |
| RULE-131 | Shadow | Never "served", never green. | Learning, Sentinel | CONFIRMED |
| RULE-132 | Dashboard vs Learning counts | Different definitions (completed runs any verdict vs certified runs learned from); each page states its own. | Dashboard, Learning | CONFIRMED |
| RULE-133 | Sharing | Declared only; nothing has moved between Workers; admission path not built. | Learning | CONFIRMED |
| RULE-140 | Served knowledge | Learned knowledge is served only after a Worker Sentinel decision that applies (enforce mode); in shadow it is recorded, not served. | Learning, OKF | CONFIRMED |
| RULE-141 | Skill changes | A Worker only *proposes*; the shared Skill is authored by people; all UI says "proposed". | Learning | CONFIRMED |
| RULE-142 | Redaction receipts | Counts and detector names only; never a value. | Learning | CONFIRMED |
| RULE-143 | Sync mode | The platform may only make it stricter (full → metadata only → off). | Learning | CONFIRMED |
| RULE-144 | Comparisons | Learning-effect comparisons need ≥ 3 qualifying runs on each side of the same cohort; nothing claims causation. | Learning | CONFIRMED |
| RULE-150 | OKF edit goes live | Only when gates pass **and** a different person approves; authors cannot approve their own. | OKF browser | CONFIRMED |
| RULE-151 | OKF edit reason | Required, kept with the version. | OKF browser | CONFIRMED |
| RULE-152 | OKF edit size | Body ≤ 256 KiB. | OKF browser | CONFIRMED |
| RULE-153 | Served text integrity | Must match its manifest digest or it is not shown. | OKF browser | CONFIRMED |
| RULE-154 | Restoring | Creates a new overlay version; item versions are never reused; "Use the Package's version" is a recorded action. | OKF browser | CONFIRMED |
| RULE-155 | Held proposals | Name why: checks disagree · gates unratified · runtime behind · runtime overlay off. | OKF browser | CONFIRMED |
| RULE-160 | Applied | Only from the Worker's own Runtime acknowledgement; a decision unacknowledged after 5 minutes reads "Not confirmed by {Worker} since {time}". | Sentinel, Learning | CONFIRMED |
| RULE-161 | Shadow decisions | Recorded, never sent; verbs read "Would …". | Sentinel | CONFIRMED |
| RULE-162 | Open counts | "Not measured" is never 0; "Nothing open" is never "safe". | Sentinel | CONFIRMED |
| RULE-163 | Stop Worker | Needs the Worker's typed name and a reason; permission is checked server-side. | Sentinel | CONFIRMED |
| RULE-164 | Partial stop | Stop is per ECS runtime; a partial stop is shown as partial; a dropped response is re-read, never re-sent; LOCAL Workers are stopped from their Worker page. | Sentinel | CONFIRMED |
| RULE-165 | Platform bounds | Platform policy clamps Worker settings; policy can only tighten; viewing policy is admin-only; editing is not available yet. | Sentinel | CONFIRMED |
| RULE-166 | Decision chain | Hash-linked; integrity (verified / not verified / not checked) is always shown. | Sentinel, Learning | CONFIRMED |
| RULE-170 | A Skill | Is a body + contract + references, not a file. | Knowledge | CONFIRMED |
| RULE-171 | Publishing a Skill | Nothing is published unchecked; structure, contract, duplication and security checks run on the exact bytes; publish quotes the checked digest; a draft edited after checking is refused; an AI-drafted body is a proposal only and must be read. | Knowledge | CONFIRMED |
| RULE-172 | Skill revision | Starts from the registry's own bytes (`from_digest`); not offered for packages that bundle other Skills. | Knowledge | CONFIRMED |
| RULE-173 | DoD scope | A narrower scope may tighten a gate and never loosen one. | Knowledge | CONFIRMED |
| RULE-174 | Not measured vs failed | `measurable:false` ⇒ NOT_MEASURED, a different outcome from FAIL. | Knowledge, Worker detail | CONFIRMED |
| RULE-180 | Shared knowledge candidates | Become shared knowledge only by a person's Promote; publication additionally needs regression evidence. | Knowledge governance | CONFIRMED |
| RULE-181 | Candidates vs admitted | Counted separately so a proposal cannot read as admitted. | Knowledge governance | CONFIRMED |
| RULE-182 | Unmeasurable loop stages | `worker_local`/unavailable ⇒ unknown, never zero. | Knowledge governance | CONFIRMED |
| RULE-183 | Packs | Immutable; a new version is a new pack; only published after the regression gate passes. | Knowledge governance | CONFIRMED |
| RULE-184 | Decisions | Concurrency-checked by item version (409/412 ⇒ refresh the queue); purge is human-controlled, not an API. | Knowledge governance | CONFIRMED |
| RULE-190 | Certified harness | Requires a passed report **and** a recorded certification by a different person. | Harnesses | CONFIRMED |
| RULE-191 | Uncertified versions | Compose displays certification state but does not (yet) refuse an uncertified version. | Harnesses, Compose | CONFIRMED |
| RULE-192 | Availability | `available` ≠ choosable ≠ certified. | Harnesses | CONFIRMED |
| RULE-193 | Conformance | Is evidence, not a security boundary; a source contradiction ("admitted" without a record) is said, not resolved. | Harnesses | CONFIRMED |
| RULE-200 | Effective access | Role features ∪ group features, then individual grants/denies. | Admin | CONFIRMED |
| RULE-201 | Inheritance display | The inherited baseline is shown so a tick reads as "on top of the role". | Admin | CONFIRMED |
| RULE-202 | Invites | No password is created for an invitee; they set it from an emailed link. | Admin | CONFIRMED |
| RULE-203 | Editing a person | Signs them out of every open session. | Admin | CONFIRMED |
| RULE-204 | Console feature checks | Only `users.manage` is checked in the console; all other authority is server-side. | Admin, Shell | CONFIRMED |
| RULE-210 | Tokens | The browser never holds a token; sessions are httpOnly cookies. | Auth | CONFIRMED |
| RULE-211 | Sign-in errors | Wrong password and unknown account are indistinguishable; all other refusals are named with a specific recovery. | Login | CONFIRMED |
| RULE-212 | Recovery | Forgot/reset confirmations are identical whether or not an account exists; reset links expire in one hour. | Auth | CONFIRMED |
| RULE-213 | Navigation entries | Gated entries are hidden while permissions are unread. | Shell | CONFIRMED |
| RULE-214 | Background work | Observable from anywhere; completion produces a persistent notice that links to where the work left something; the outcome (failed/cancelled) is read, not assumed. | Shell | CONFIRMED |
| RULE-215 | Session | Re-verified on every navigation; failure to read permissions hides gated entries. | Shell | CONFIRMED |

## Gaps in numbering
Ids are grouped by area (001–009 principles, 010 Dashboard, 020–049 Compose, 050 Drafts, 060 Packaging, 070 Customer delivery, 080 Delivery wizard, 090 Registry, 100 Worker detail, 110 Configuration, 120 Operate, 130 Learning estate, 140 Learning Worker, 150 OKF, 160 Sentinel, 170 Knowledge library, 180 Knowledge governance, 190 Harnesses, 200 Admin, 210 Auth/Shell). Unused numbers are intentionally left free.
