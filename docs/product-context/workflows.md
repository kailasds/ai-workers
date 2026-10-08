# Workflows

End-to-end user workflows as the product actually supports them. Each has: **Goal · Actor · Starting state · Trigger · Steps · Decisions · Preconditions · Outputs · Failure paths · States · Related screens · APIs/data**. Confidence is CONFIRMED unless marked. API paths are relative to the console API base (`/api`). RULE-nnn ids refer to `business-rules.md`.

**Index:** WF-01 Sign in · WF-02 Account recovery · WF-03 Onboard a person · WF-04 Create a Worker (auto-assemble) · WF-05 Create a Worker (review every checkpoint) · WF-06 Resume / continue a draft · WF-07 Revise (configure) a composed Worker · WF-08 Package a Worker · WF-09 Deploy a Worker · WF-10 Inspect a Worker · WF-11 Inspect a run · WF-12 Run a sample · WF-13 Lifecycle: stop · resume · deploy again · terminate · WF-14 Identity: pause · resume · revoke · WF-15 Post-deploy configuration · WF-16 Prepare a customer delivery · WF-17 Track a delivery · WF-18 Write / revise a Skill · WF-19 Change a Worker's knowledge (OKF edit) · WF-20 Govern shared knowledge (candidates, packs) · WF-21 Inspect learning · WF-22 Oversight: review Sentinel decisions and stop a Worker · WF-23 Certify a harness · WF-24 Archive a draft · WF-25 Follow background work.

---

## WF-01 Sign in
- **Goal:** get a session. **Actor:** any provisioned person. **Start:** signed out, any URL. **Trigger:** open the console (any protected route redirects to `/login` with `from`).
- **Steps:** 1 enter username + password → 2 `POST /auth/login` → 3 session cookie set (httpOnly) → 4 navigate to `from` or `/home` → 5 shell verifies `/auth/me` + `/auth/permissions`.
- **Decisions:** none. **Preconditions:** account provisioned, active, invite accepted, on an allowed network.
- **Outputs:** session; role/feature-aware shell. **Failure paths:** see the 10 named sign-in failures (`screens/auth-and-shell.md`); password field cleared after failure; locked/rate-limited give seconds to wait.
- **States:** idle · submitting · failed(kind). **Screens:** login. **APIs:** `POST /auth/login`, `GET /auth/me`, `GET /auth/permissions`, `GET /auth/context`.

## WF-02 Account recovery
- **Goal:** regain access. **Actor:** person without a session. **Trigger:** "forgot password" or an invite/reset email link.
- **Steps (forgot):** enter email → `POST /auth/forgot-password` → identical confirmation either way ("link expires in one hour") → open emailed link `/auth/reset?token=` → page reads the link (name/role/min length) → choose a password (8+ chars, upper, lower, digit, symbol; confirm twice) → `POST /auth/reset` → "You can sign in now".
- **Steps (invite):** `/auth/set-password?token=` → same, `POST /auth/accept-invite` ("Set password and activate").
- **Failure:** incomplete / expired / unreadable link ("Ask your administrator to send the invite again." / "Ask for a new reset link from the sign-in page."); mismatch; realm rejection shown verbatim. **Screens:** forgot, set-password. **Rules:** RULE-211, RULE-212.

## WF-03 Onboard a person
- **Actor:** administrator (`users.manage`). **Start:** Admin › People. **Trigger:** "Invite".
- **Steps:** 1 enter work email (+ optional display name) → 2 choose a role → 3 optionally pick groups → 4 choose internet sign-in vs office network → 5 tick/untick individual features (shows inherited baseline) → 6 save → 7 system sends an invite email (outcome sent/failed/skipped) → 8 invitee sets a password (WF-02) → status becomes Active.
- **Decisions:** role; groups; exceptions. **Preconditions:** email delivery + identity provisioning configured, else "Nobody can be onboarded yet" / "Invites will not be delivered".
- **Failure:** invite not delivered → "Send it again, or share the link directly" (Resend). **Outputs:** account `invited` then `active`. **APIs:** `GET /admin/catalog`, `POST /admin/users`, `POST /admin/users/{id}/resend-invite`, `PATCH`, `POST …/disable|enable`. **Screens:** people, person, groups.

## WF-04 Create a Worker — auto-assemble (default)
- **Goal:** produce a composed Worker with minimal intervention. **Actor:** composer. **Start:** none. **Trigger:** Compose a Worker / New Worker.
- **Steps:**
  1. Choose **Worker type** (available only).
  2. Choose **Identity**; optionally **Business domain** and **Geography**.
  3. Choose **Bounded context**; optionally allow **Growth** to a wider context (ceiling); optionally name the Worker.
  4. Leave "Auto-assemble preset" on; **Confirm identity** → draft created (complete `draft-v8` seeded from the context, with a maker and a different verifier model) → identity reserved → growth written.
  5. The platform runs the **ten stages** in order (identity → instructions → deterministic steps → capabilities → environment → models → evaluations → memory → Definition of Done → governance), each streaming what it searched, selected and rejected. Settled stages with no questions are accepted automatically.
  6. **It stops** for a question (`input.required`), a failure, or a proposal that could not be read — the person answers/retries.
  7. When all assembly stations are READY the page says **"Worker composed — Every checkpoint is confirmed and written to revision N. Nothing is built yet."** and offers **Package and deploy**.
- **Decisions:** type / identity / domain / geography / context / growth ceiling / name / auto vs review. **Preconditions:** an available type, identity, context.
- **Outputs:** a composition at revision N (state composed). **Failure paths:** draft creation fails ("The draft could not be created."); growth write fails after creation (draft kept, "Growth not saved" Retry/Continue); a stage fails (Retry); 409 on accept ("This draft changed. Reload before saving."); dropped connection (checks whether saved before re-sending); stage question needing an answer.
- **States:** phase type → assign → resuming → assembling; stage idle/running/settled/failed; station NOT_STARTED…READY. **Screens:** compose. **APIs:** see `data-contracts.md` (worker-types, worker-identities, bounded-contexts, geographies, `POST /compositions`, growth PATCH, `POST /compositions/{id}/stages/{stage}`, `POST /compose/stage-runs/{id}/accept`, stage-runs, compose-experience).

## WF-05 Create a Worker — review every checkpoint
- Same as WF-04 steps 1–4 with auto-assemble **off** (`?mode=review`). Then **eight checkpoints**, each requiring an explicit confirm: Bounded context → Worker intent (outcome, procedure, Tools; runs instructions, deterministic steps, capabilities, environment and models stages silently) → Skills → Domain Specific Language → EVALs → Memory and learning → Definition of Done → Autonomy and Sentinel.
- **Decisions at each checkpoint:** confirm, **Edit** (opens the stage editor; saving restarts that stage and everything after), or **Back** (re-read; never un-accepts). Unsaved panel edits block the confirm and block leaving the station ("Save or cancel the changes to X first").
- **Durable pointer:** `?step=` written on every move; reload returns to the held checkpoint. **Outputs/failures:** as WF-04. **Screens:** compose.

## WF-06 Resume / continue a draft
- **Actor:** composer. **Trigger:** Saved drafts › Continue; deep link; "Save and close" earlier.
- **Steps:** open `/compose/guided/{id}` → the page rebuilds from server records (composition, bounded contexts, stage runs, compose experience, own packages, delivery operations) → resumes at the first stage not accepted (auto) or the checkpoint pointer (review); `?station=`, `?checkpoint=`, `?part=` deep-link to a place.
- **Failure:** "This Worker references a bounded context that is no longer available." (blocking); browser state is never used as evidence that a stage completed. **Related:** WF-24.

## WF-07 Revise (configure) a composed Worker
- **Goal:** change a decision. **Trigger:** "Edit" on a station/part (Compose or Worker detail › Package), or "Prepare new revision" on a locked setting.
- **Steps:** open the stage editor inline → change → save (`updateComposition`/`patchComposition` with `If-Match` record version) → the stage **and every later stage restart** (`?restart=<stage>`) so dependent choices are recomputed → re-confirm the affected checkpoints.
- **Decisions:** which stage. **Preconditions:** station editable. **Outputs:** next immutable revision; **a deployed Worker is never mutated in place**. **Failure:** 412 stale version → reload; editing a packaged revision makes the Package **stale** (WF-08). **Screens:** compose, worker-detail.

## WF-08 Package a Worker
- **Goal:** seal a versioned, checksummed Package from the accepted revision. **Actor:** packager (often not the composer). **Start:** composed Worker. **Trigger:** Packaging › Build Package, or Compose › Package and deploy.
- **Steps:** 1 (Packaging) pick from "To package › Ready"; blocked drafts list their reasons → 2 open the journey's Package-and-deploy station → 3 optional preflight choices: **sample projects** to seed the Worker desktop, **tools to package**, **run depth** (Full vs Shallow where the harness offers it), publish generated **source** to GitLab (default per platform) → 4 **Build the Worker Package** → durable workflow `PREPARE_DRAFT` (validate accepted revision → seal identity and instructions → render deterministic pipeline → pack agents, skills and Harness → bind EVALs, DoD and governance → store package and integrity digest) → 5 receipt: artifact filename, SHA-256 digest, size; verified sections.
- **Decisions:** samples/tools/run depth/source; whether to rebuild when stale.
- **Preconditions:** readiness `READY_FOR_UNSIGNED_DRAFT` (server gate; first issue shown if refused: "The accepted revision is not ready to package."); draft ACTIVE ("Draft archived. This draft cannot create another Package.").
- **Outputs:** Package `DRAFT_READY`. **Failure:** `DRAFT_FAILED` with `failure_code`; workflow paused ("Packaging paused. Open Operate to resume it.") or stopped; a blocked Package names the Compose station that owns the issue and offers one way there ("Open Autonomy" etc.); a refused Package due to Sentinel → "Edit autonomy and accept to update the Sentinel detectors."
- **Resilience:** the operation survives closing the browser ("You can close this page. Deployment continues…"); reload recovers the latest milestone; a duplicate build is refused/joined (Idempotency-Key). **States:** QUEUED/RUNNING/WAITING_RETRY/PAUSED/CANCELLING/CANCELLED/SUCCEEDED/FAILED. **Screens:** packaging, compose (package station), operate. **APIs:** `POST /package-drafts`, `GET /package-drafts/{id}`, `/workflows/{id}` (+events), `GET/POST /package-drafts/{id}/source`, `GET /compositions/{id}/revisions/{rev}/readiness`.

## WF-09 Deploy a Worker
- **Goal:** run the Worker. **Actor:** operator. **Start:** Package `DRAFT_READY`. **Trigger:** Deploy this Worker (journey) / local deploy (Operate).
- **Steps:** 1 choose **target**: TCS environment (Amazon ECS; shows region, cluster, size, FARGATE/FARGATE_SPOT, private) or **Local container** (this host via the deploy broker) → 2 enter the **monthly spending limit** (min/max shown; prefilled from in-force / inherited (must be ticked "confirmed") / Worker type default; shows next reset) → 3 (ECS) choose **runtime duration**: 2 h / 8 h / 24 h / 7 d / custom 15 min–7 d / **until stopped** (warning: "Fargate charges for as long as it runs") → 4 Deploy → durable workflow (`DEPLOY_ECS`) or local operation (polled 2 s up to 180 s) → 5 Worker observed healthy → "Worker ready — Run a sample here or open its console".
- **Decisions:** target, limit, duration. **Preconditions:** Package built; target available; this month's spend readable ("This month's spend could not be read, so the Worker cannot be deployed. Try again later."); no platform hold/harness block.
- **Failure:** "Deployment stopped. Open Operate for the workflow evidence."; "Deployment finished without a healthy Worker observation."; dropped connection → reads the Worker's recorded state before offering a retry ("no Worker was created. Retry the deployment."); `PLATFORM_HOLD` / `HARNESS_BLOCKED` → server sentence + "Decision {id}" link, no retry. Target + last failure reason are remembered per viewer in browser storage only as a convenience.
- **Outputs:** Runtime record, spending limit receipt ("$X a month · set at deployment by … · time"), source-publication state. **Screens:** compose (package & deploy), operate. **Related:** WF-13.

## WF-10 Inspect a Worker
- **Goal:** understand one Worker. **Steps:** Registry (search/filter) → Worker detail → Package (anatomy: identity & context, intent, brain, DoD, autonomy, runtime) → Runs → Brain activity → Knowledge → Learning → Sentinel (Configured vs Running) → Runtimes → Delivery. **Decisions:** which view. Each part has an **Edit** link into Compose. **Screens:** registry, worker-detail. **Data:** `GET /compositions/{id}/passport` and the per-view reads; failures are contained inside their own view.

## WF-11 Inspect a run
- **Goal:** answer "did it meet its bar, why, at what cost?" **Entry points:** Dashboard ledger "View run"; Worker detail › Runs.
- **Steps:** open run → verdict (MET / NOT_MET / Awaiting evidence) → per-criterion table (state, measured, threshold, gating, source, adjudicator, note/account, cases not automated) → routing legs by stage/model/tier → usage (tokens, cost, "Not measured" where unread) → independent check → for learning-related views: the memories it left and the Sentinel decisions that referenced it (Evidence pages).
- **Failure:** "This Worker could not be reached." (unknown ≠ none); Worker no longer reports the run. **Screens:** dashboard, worker-detail, worker-learning (evidence). **APIs:** `/workers/{id}/runs`, `/workers/{id}/ui/api/worker/runs/{runId}`, `/learning/workers/{id}/…`.

## WF-12 Run a sample
- **Goal:** try the Worker on a small synthetic source. **Preconditions:** ≥ 1 runtime running **and** healthy (if several, choose which). **Steps:** Worker detail › Runtimes › Run sample → pick a sample archive (key, source→target technology, size, sha256, contains_credentials:false) → submit → states `submitting` → harness accepts → result appears in Runs. **Failure:** "The harness refused this archive."; "Interrupted when the Worker restarted. Submit the archive again."

## WF-13 Lifecycle: stop · resume · deploy again · terminate
- **Actor:** operator / platform. **Start:** a runtime.
- **Stop:** (Operate or Sentinel › Workers) confirm naming the one runtime; **reason required** (≤ 500 chars); "A run in progress on this runtime is interrupted." → `POST /workers/{id}/stop` → runtime STOPPED (`stop_reason: stopped`) → a **Platform Sentinel decision** records the reason ("Decision {id}" link). Sentinel › Workers variant: also requires typing the Worker's name and stops **each ECS runtime separately** with partial-stop reporting.
- **Resume:** only when a person stopped it (ECS, STOPPED, `stopped`); reason + spending limit required; service restarts "with the images it had"; the stop is lifted and recorded.
- **Deploy again:** stopped or failed ECS runtime (not `termination_failed`); choose **Current certified Runtime** or **As last time** (each shows pass/fail checks for package, contract, images, cost, desktop); spending limit; shows auto-stop line and learning-seed line; if held, reason required.
- **Terminate:** irreversible; destroys service, secret, staged package; keeps the Worker's record, packages and runs.
- **Failure:** platform refusal (`PLATFORM_HOLD`/`HARNESS_BLOCKED`); dropped request (re-read, do not re-send); `RESUME_REASON_*`. **Auto-stop:** runtimes expire (`stop_reason: expired`, "Expired at its auto-stop time").

## WF-14 Identity: pause · resume · revoke
- **Pause** (reversible) / **Resume**: `POST /compositions/{id}/identity/{pause|resume}` — the identity realm is changed **before** anything is recorded. **Revoke:** type the Worker's exact name; terminal; every runtime loses access when its current credential expires; "Compose a new Worker instead." **Failure:** error text shown (never swallowed). **Screen:** worker-detail (identity section).

## WF-15 Post-deploy configuration
- **Steps:** Worker detail › Runtimes › Configuration → choose a section → change allowed fields (bounds enforced; lock icon on locked ones with "Prepare new revision") → if any changed field is APPROVAL_REQUIRED supply an approval reference → Save (`PATCH` with `If-Match` ETag) → "Saved and applied live." or "Saved. Restart the Worker to apply these changes." **Failure:** 412 "This Worker changed after you opened it. Your edits are still shown." **Related:** WF-07 for locked fields.

## WF-16 Prepare a customer delivery
- **Goal:** ready one sealed Package for a named customer. **Actor:** delivery manager. **Trigger:** Customer delivery › Prepare delivery (or Packaging row, or Worker › Delivery).
- **Steps:** (1) Contents — review what the Package holds (Skills, DSLs and why bound, EVALs, DoD); optionally untick Skills → a **narrower new Package** is sealed on continue (new revision + digest); (2) Learning — optionally include memory records, learned Skill claims, selected Skill additions (shown with counts; "not approval or adoption"); (3) Customer — name (≤ 120) and container-image mode (SEPARATE | BUNDLED); (4) Review all and **Prepare delivery** → durable operation, id in URL → phases → receipt (delivery record, digest, size, matured additions with digests).
- **Decisions:** which Skills; which learning; customer; images. **Preconditions:** `DRAFT_READY` Package; delivery directory fully read (else the entry is disabled with the reason).
- **Failure/resume:** reload/second tab **reattaches**; interrupted → Retry (reconciles against server, never starts a second); paused → Resume preparation; cancelled/failed → "Nothing was prepared." **Screens:** customer-delivery, delivery-wizard.

## WF-17 Track a delivery
- **Steps:** Customer delivery › Prepared packages → open a record → **Create share link** (Package link + Container images link; expiry; copy; "Send them to the customer yourself; no message was sent.") → later **Record acknowledgement** (state must be SHARED/DOWNLOADED; "does not verify the customer deployed") → optionally **Publish source** (GitLab project, tag). **States:** PREPARING → PREPARED → SHARED → DOWNLOADED → ACKNOWLEDGED; EXPIRED; FAILED. **Evidence scope:** never claims receipt/deployment.

## WF-18 Write / revise a Skill
- **Steps:** Knowledge › Skills › Write a Skill (or Revise) → What it is → The body (optionally **Draft it** from pasted expert notes; async; ≥ 40 chars) → What it carries (companion files) → How to judge it (goal, 3–6 dimensions, hard fails, cases) → Checks (structure, contract, duplication, security scan on the exact bytes; must be publishable) → Who may load it (agents) → Publish (quotes the checked digest; revision also quotes `from_digest`). **Outputs:** Skill live in the registry; visibility (loadable agents or why none). **Failure:** draft gave up after 4 min; blocking findings; digest mismatch (edited after check); registry not writable.

## WF-19 Change a Worker's knowledge (OKF edit)
- **Goal:** correct what a Worker runs with. **Actor:** operator/admin (others read).
- **Steps:** Learning › Worker › Browse and edit OKF → open an item → Edit (title, applies-to, stale-after, kind, body ≤ 256 KiB) → give a **reason** → Send → proposal states: Being checked → (Waiting for the Runtime) → Being scanned → Waiting for approval → **another person approves** → Live on the next run. Declined / Held (checks disagree, gates unratified, runtime behind, overlay off) / Rejected / Out of date / Withdrawn. History allows **Restore** a version or **Use the Package's version**.
- **Preconditions:** a bundle exists ("No run has received knowledge yet."); role can write. **Rules:** RULE-150…155.

## WF-20 Govern shared knowledge
- **Goal:** decide which proposed shared knowledge becomes available to all Workers. **Actor:** knowledge reviewer (`knowledge.read` + decision permission).
- **Steps:** Knowledge › Governance › Candidate decisions → filter → read the proposed diff, ranked literal evidence and lineage → **Promote** (enters the next pack proposal) / **Defer** / **Reject** (reason) → packs: review published versions, regression result, diff vs previous. Coverage view shows which constructs have admitted knowledge.
- **Failure:** the candidate changed meanwhile → queue refreshed; customer lane unavailable; promotion unavailable. **Rules:** RULE-180…184.

## WF-21 Inspect learning
- **Goal:** know whether a Worker (or the estate) is getting better and why. **Steps:** Learning (rank, tiles, period) → Worker learning → OKF block (is learned knowledge served? shadow vs served) → GBrain cards → a record type → an item's Evidence → Learning effect (before/after, ≥ 3 runs a side) → Sharing, Sync, All records, Skills/Facts, proposed Skill changes. **Unknown ≠ zero** throughout.

## WF-22 Oversight: review Sentinel decisions and stop a Worker
- **Steps (review):** Sentinel overview (posture, in force, stream) → dimension → decisions (filters) → decision detail (reasoning, rubric, affected Workers with applied state, evidence, integrity). **Steps (stop):** Sentinel › Workers → select Worker → Stop Worker → type name + reason → stop each ECS runtime → decision recorded per runtime. **Preconditions:** viewer permission checked server-side. **Failure:** partial stop shown as partial; unconfirmed → Check again; failed → Retry.

## WF-23 Certify a harness
- **Actors:** harness team, maintainer. **Steps:** Build (SDK) → Check (run conformance suite against the image) → Review (read the report; fix & re-run) → Request certification (send report to maintainer; **the person who ran the suite cannot certify their own**) → Certify (maintainer runs the certify script, which re-runs the suite and records who/when). The console **displays** all of it and **sends nothing**.

## WF-24 Archive a draft
- **Actor:** administrator. **Preconditions:** draft ACTIVE and has no Package. **Steps:** Saved drafts › Archive → in-place confirm → `DELETE /compositions/{id}` with `If-Match` record version → archived (leaves the list, cannot be continued). **Failure:** 412 changed elsewhere; 409 package being prepared; 403 not admin.

## WF-25 Follow background work
- **Goal:** not lose track of long operations. **Steps:** while any package/deploy operation runs, the shell's **Active work** menu lists it (15 s poll) with Resume → returns to the journey station; when it ends a **notice** appears wherever the person is, stays until dismissed, and links to the Worker (deployment succeeded) or the journey station (otherwise). Operate lists all package operations and delivery activity.
