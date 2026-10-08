# Screen: Worker configuration and maintenance — `/workers/:compositionId/runtimes/:workerId/configuration`

Source: `routes/workers/WorkerConfigurationPage.tsx`; `lib/maintenanceSections.ts`; `lib/durableApi.ts` (`WorkerMaintenanceSchema`, `getWorkerMaintenanceSchema/Configuration`, `patchWorkerMaintenanceConfiguration`).

## 1. Purpose
After a Worker is deployed, change **only the settings its owner was allowed to change** — nothing else. The page shows the packaged settings in 7 sections, marks each as editable or locked, and says whether a change applies live or needs a restart. (CONFIRMED)

## 2. Primary user
The Worker's owner / operator (including a customer's operator for a delivered Worker — "what may I change is half the question someone receiving a Worker asks").

## 3. User jobs
See current values; change an allowed value; know whether it needs a restart or an approval; see why a setting is locked and how to change it (new revision); see what the Worker carries (Skills etc.).

## 4. Information available
Breadcrumb: Registry › {Worker} › Runtimes › Configuration. Header "Configuration and maintenance" with a "Running" badge. State bar: "Configuration state · N unsaved change(s) · Restart required / Applies live".

**Sections (rail on wide screens, select on phone; URL `?section=`):** Overview · Harness · Brain · Sentinel · Model routing · Interaction · Tools and Agents. A rail badge counts editable fields per section. Field path prefixes decide the section: `harness.*`/`pipeline_overrides.*`→Harness; `memory.*`/`learning.*`→Brain; `sentinel.*`→Sentinel; `models.*`→Model routing; `interaction.*`→Interaction; else Tools and Agents.

**Per field (`WorkerMaintenanceField`):** path, label, description/source, `kind` (boolean / list / integer / number / text / choice), `mode` (exposure), `editable`, `bounds` {minimum, maximum, allowed_values}, `apply` (`LIVE` | `RESTART_REQUIRED` | `REDEPLOY_REQUIRED`), `rule` (the policy sentence), `approval_ref`.
- Locked field: value shown with a lock icon ("Package locked") and a link **Prepare new revision** → Compose with `?restart=<stage>`.
- Editable: control by kind. Numeric fields honour min/max; choice fields offer `allowed_values`; lists only allow removing items (checkboxes).
- Under **Sentinel** the fields are grouped: Mode, then the five dimensions; Enforce is grouped by chips.
- Under **Model routing**, a Routing card (what serves, recommendation, adopt/revert) precedes the fields; **model settings are "Managed by the Runtime"** and read-only whenever routing is tiered (link → Learning › Routing). They become editable only once the Runtime says it serves a fixed model or that the Package defines routing; while unknown they stay read-only.
- **Overview:** Package digest + "What this Worker carries" (WorkerCarrying: skills asked-for vs present/missing, harness-only, diffs, reported).

**Worker status extras:** memory counts (types) when the harness has memory; absent for a harness without memory (must not break the page).

## 5. User actions
| Action | Trigger | Preconditions | Result | Failure |
|---|---|---|---|---|
| Change a value | Field control | Field editable | Held locally as an unsaved change | — |
| Save | Save button | ≥ 1 change | `PATCH /workers/{id}/configuration` with **If-Match: etag** and, if any changed field has `mode = APPROVAL_REQUIRED`, an **approval reference** | 412 "This Worker changed after you opened it. Your edits are still shown." / server message / "Changes could not be saved." |
| Result message | After save | — | "Saved and applied live." or "Saved. Restart the Worker to apply these changes." | — |
| Prepare new revision | Locked field | — | Goes to Compose to restart at the owning stage | — |

## 6. Filters / search / sorting — none (sections only).

## 7. Navigation
In: Worker detail › Runtimes; Learning routing card "settings" link. Out: Worker detail; Compose; Learning › Routing.

## 8. State model
Loading ("Reading packaged configuration…") · Loaded · Error ("Worker configuration is unavailable." / "This Worker does not expose packaged maintenance." / "This runtime does not belong to the selected Worker.") · Saving · Saved (live / restart required).

## 9. Data dependencies
`GET /workers/{runtime}/maintenance-schema`, `GET /workers/{runtime}/configuration` (value + ETag), `GET /workers/{runtime}/status`, routing read (`useWorkerRouting`), `PATCH …/configuration`.

## 10. Business rules
RULE-110 Only fields the Package exposed as editable can be changed; each carries its bounds and rule. RULE-111 Exposure modes: LOCKED, LOWER_ONLY, EDITABLE_WITHIN_BOUNDS, APPROVAL_REQUIRED, PLATFORM_MANAGED (set at Compose). RULE-112 APPROVAL_REQUIRED fields need an approval reference on save. RULE-113 Optimistic concurrency via ETag/If-Match. RULE-114 Where routing is tiered, the Runtime — not the operator — grants each run its model.

## 11. Responsive requirements (inferred)
Rail ↔ "Section" select on a phone.

## 12. Current UI structure — LEGACY UI — NOT A DESIGN REQUIREMENT
Page header + state bar + two-column (rail | section body).
