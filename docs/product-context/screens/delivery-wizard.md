# Screen: Prepare delivery (wizard) — `/customer-delivery/prepare/:packageId`

Source: `routes/delivery/DeliveryWizard.tsx`, `WhatItHolds.tsx`; `lib/durableApi.ts` (`getMaturedDelivery`, `narrowPackage`, `startCustomerDelivery`, `waitForWorkflow`, `resumeWorkflow`).

## 1. Purpose
Prepare **one sealed Package for one named customer**. Four decisions (Contents · Learning · Customer · Review) and **one commit** that starts a durable background operation. Every entry point comes here; none bypasses a step. (CONFIRMED)

## 2. Primary user
Delivery manager.

## 3. User jobs
Confirm what the customer will receive; optionally remove Skills; decide whether to send what the Worker learned beside the Package; name the customer; choose how container images travel; review and start; follow the preparation; resume or retry it.

## 4. Information available / fields

| Step | Field | Type | Meaning | Default | Required | Validation / conditional |
|---|---|---|---|---|---|---|
| 1 Contents | Sealed Package summary | read-only | "Sealed Package · r11 · packaged {date}" | — | — | — |
| 1 | What the Package holds | read-only lists with names | Skills (checkbox "Carry {name}" each, all ticked by default), Domain Specific Languages (+ why bound), EVALs, Definition of Done (title + threshold). Each name opens a detail drawer. | all Skills carried | — | **Only Skills are selectable.** DSLs, EVALs and DoD "travel as sealed" — dropping one is composing a different Worker. |
| 1 | Skill selection | checkboxes | Unticking Skills | — | — | IF any Skill is unticked → "Apply Skill selection seals a new Package without N Skill(s): a new revision and a new digest. The sealed Package is not changed." Continuing seals a **new Package** (narrowPackage; Idempotency-Key) and moves the wizard to that new package id. IF a newer draft exists or the holdings could not be read → selection unavailable ("Skill selection is unavailable until a new Package is built in Packaging."). |
| 2 Learning | Sections | checkboxes | `memory` (records, by kind episodic/semantic/procedural), `brain` (claims; "Review the N learned Skills"), `skills` (proposed Skill changes per Skill, each addition separately selectable with its section and "N runs agreed") | none included | No | A section with 0 items is disabled ("None recorded"). IF the Worker has no runs → "This Worker has no runs here, so it has no recorded learning to send." Copy: "Including learning sends it beside the Package. It is not approval or adoption." IF the offer cannot be read → Retry, or tick "Continue without learning. The Package travels on its own." |
| 2 | Individual Skill additions | checkboxes | Omitted = every addition; list = exactly those. Sending `[]` where none chosen would ship all, so the client omits the key. | all | — | — |
| 3 Customer | Customer | text, max 120 | Recorded on the delivery | empty | **Yes** | "Enter the Customer." / "Use at most 120 characters." |
| 3 | Container images | radio | `SEPARATE` ("A second link beside the package. The package stays small.") or `BUNDLED` ("One file to send. The images are most of its size.") | SEPARATE | — | "The run folder always travels: compose file, README and settings." |
| 4 Review | Summary | read-only with Edit buttons | Worker + Package revision, Customer, Selected learning ("None. The Package travels without learning." if none), Container images, Proposed Skill changes "N of M" | — | — | — |

**Gating (CONFIRMED):** a step is reachable only when every step before it can be passed: learning offer must be read (or explicitly excluded after a failed read); Customer non-empty for Review; no un-applied Skill drop; not mid-narrowing. "Prepare delivery" enabled only when all hold.

## 5. User actions
| Action | Trigger | Preconditions | Result | Failure |
|---|---|---|---|---|
| Next / Back / step list / phone Section select | Footer | See gating | Changes step; heading takes focus | Customer errors focus the field |
| Apply Skill selection | Continue on step 1 with dropped Skills | — | Seals a new Package; the wizard continues on it | "A narrower Package could not be sealed." (or the server message) |
| Prepare delivery (commit) | Review step | `commitReady` | Starts the durable operation (`POST /package-drafts/{id}/customer-deliveries` with `destination_label`, `include`, `images`, optional `skill_additions`, with an `Idempotency-Key`). The operation id goes in the URL so reload / a second tab **reattaches** instead of starting another. | "The preparation was refused." / "The preparation did not reach the server. Your choices are kept; Prepare delivery sends the same request again." / "Whether the preparation started could not be checked. Retry checks again; it does not start a second one." |
| Follow the operation | Automatic | — | Shows recorded phases and progress; on success shows the receipt: the delivery the operation names (never a guess by Worker) with link back to `/customer-delivery?view=delivered` | "Lost contact with the preparation. It may still be running." · "This preparation was cancelled. Nothing was prepared." · "This preparation is paused." · "The preparation stopped before it finished. Nothing was prepared." |
| Retry / Resume preparation | Buttons on interrupted/failed/paused | — | Reconciles against the server's operation list first; Resume calls `POST /workflows/{id}/resume` | "The preparation could not be resumed." |

## 6. Filters / search / sorting — none.

## 7. Navigation
In: Customer delivery "Prepare delivery"; Packaging rows; Worker Delivery tab. Out: "Back to Customer delivery" (also the receipt's link to Prepared packages).

## 8. State model
Wizard step 0–3. Operation: `idle | starting | running | succeeded | failed | interrupted` (+ reattached from URL → "Not reported" for choices the page no longer holds). Load errors: "This Package was not found among Workers with a built Package." / "This Worker could not be read." Choices are **restored from this browser tab** (session scope) with the note "Choices restored from this browser tab. They are not saved anywhere else." Terminal workflow states: SUCCEEDED, FAILED, CANCELLED, PAUSED.

## 9. Data dependencies
`GET /compositions/packageable`, `GET /compositions/{id}`, `GET /customer-packages/{id}`, `GET /package-drafts/{id}/holdings`, `GET /package-drafts/{id}/matured` (`matured-delivery-offer-v1`), `POST /package-drafts/{id}/narrow` (`package-narrowed-v1`: composition_id, revision, dropped_skills, package, workflow), `POST /package-drafts/{id}/customer-deliveries`, `GET /workflows/{id}` (+ SSE events), `POST /workflows/{id}/resume`, `GET /source-publication`.

## 10. Business rules
RULE-080 A sealed Package is immutable; narrowing creates a new revision and digest, never edits the old one (the delivery attaches learning *beside* the package so its own `SHA256SUMS` keeps verifying). RULE-081 Only Skills may be dropped. RULE-082 Learning is optional, per-section, per-Skill-addition, and is "not approval or adoption". RULE-083 Duplicate submission is impossible: identical preparations join the in-flight one (`started: false`). RULE-084 Customer required, ≤ 120 chars.

## 11. Responsive requirements (inferred)
Phone shows a "Section" select instead of the step list (one prerequisite rule governs both).

## 12. Current UI structure — LEGACY UI — NOT A DESIGN REQUIREMENT
Step list (ordered, "Preparation steps") → single step panel → footer with Back / forward label ("Review learning", "Set customer", "Review delivery") / "Prepare delivery".
