# Screen: OKF browser — `/learning/workers/:compositionId/okf` (alias `/workers/:compositionId/okf`)

Source: `routes/workers/okf/OkfBrowser.tsx`, `lib/okfBundle.ts`, `lib/okfEditApi.ts`. OKF = the **Open Knowledge Format** bundle a Worker runs with (format `okf-0.2`): *concepts* (kinds: knowledge "Technique", landscape "Fact about the estate", experience "Experience", routing "Model routing") and *Skills*, plus an `index.md`.

## 1. Purpose
Read the exact knowledge a Worker's Runtime serves; **propose a person's edit**; follow the edit through the Sentinel's gates and a second person's approval until it is live; see each item's version history and restore an earlier version or return to the Package's own.

## 2. Primary user
Operators and admins. Role gating (CONFIRMED copy): "Your role can read knowledge. Operators and admins propose and approve edits."

## 3. User jobs
Browse the bundle tree; search concepts and Skills; read an item; edit it (with a reason); preview; track a proposal; approve/decline another person's proposal; withdraw your own; see history; restore a version; use the Package's version.

## 4. Information available
- **Query:** `path` (default `index.md`), `mode` = `read | edit | history`, `proposal`, `worker` (runtime), `rev` (bundle revision).
- **Bundle tree** (ARIA tree "Knowledge and Skills in this bundle"), grouped; "Proposed edits (N)" group on top.
- **Item reader:** title, kind label, author — "Composed in the Package" / "The Sentinel" / person; "Generated from the routing in force" for generated routing concepts; the file text (digest-checked against the manifest — a mismatch is an error, never rendered).
- **Item stats** (counters per item: served/helpful etc.) from the bundle.
- **Proposal view:** state words — *Being checked · Waiting for the Runtime · Waiting for approval · Being scanned · Held · Rejected · Live · Declined · Withdrawn · Out of date*; "What the Sentinel's gates found" (gate, result pass/fail/pending/not applicable, detail); `held_because`: `checks_disagree | gates_unratified | runtime_behind | runtime_overlay_off`; scan findings (publishable?); `approved_by`, `decided_by`, `decline_reason`, `composed_version`, `overlay_version`, `live_at`; a line diff (lines added/removed).
- **History:** table Change (Edit / Restored v{n} / Back to the Package's) · Written by · Approved by · When; the Package row "Composed in the Package"; the version in force.
- **Overlay status:** `configured`, `problem`, `gates.ratified`+reason, overlay `version`/`digest`, entries, per-Worker `verified_version`/`behind`/`refused`.

## 5. User actions
| Action | Trigger | Preconditions | Result | Failure |
|---|---|---|---|---|
| Open item / search | Tree / search box "Search concepts and Skills" | A bundle exists | Shows the file | "No run has received knowledge yet." / "This Worker's Runtime no longer holds bundle {rev}." / "Sign in again to read the bundle." / "This Worker could not be read. It may have been removed." |
| Propose an edit | Edit mode → send | Role can write; **a reason is required** | `POST …/knowledge/proposals` with `subject{kind,id,base_version}`, `frontmatter{title, applies_to[], stale_after, kind}`, `body`, `reason`. Info: "Goes live on the next run once the gates pass and another person approves it." | 422 "Say why, in a sentence. It is kept with the version." · 413 "The body is over 256 KiB. Shorten it and send again." · no network "Not sent: the console could not reach the platform. Your text is kept here. Send again." · version conflict (current_version) |
| Approve | Proposal view | Viewer is **not the author**: "Another person must approve your edit." | Goes live from the next run | per EditApiError |
| Decline | Proposal view | — | Requires `reason` | — |
| Withdraw | Own proposal | — | State → withdrawn | — |
| Restore version | History | — | Confirm "Serve v{n} again from the next run?" → new overlay version, never reuses an item version | — |
| Use the Package's version | History | — | Confirm "Serve the Package's version from the next run?" | — |
| Preview | Edit pane switch "Edit or preview" | — | Renders the markdown | — |

## 6. Filters / search / sorting
Free-text search over concepts and Skills. History newest first.

## 7. Navigation
In: Learning › Worker "Browse and edit OKF"; Skills/Facts "Open in the OKF browser"; Worker detail alias. Out: back to Learning › Worker.

## 8. State model
Item modes read/edit/history; proposal states (above); manifest read status `ok | not-found | forbidden | error`; history read `reading | failed | ok`. Skeletons: "Reading the bundle", "Reading the file", "Reading the history", "Reading the version in force".

## 9. Data dependencies
Bundle manifest/files through the Worker's Runtime (`getBundleManifest`, `getBundleFile`, `getItemStats`); edit API under `/compositions/{id}/knowledge/{proposals|history|use-package|overlay}`.

## 10. Business rules
RULE-150 An edit goes live only when **gates pass AND a second person approves** (authors cannot approve their own). RULE-151 Every edit carries a reason, kept with the version. RULE-152 Body ≤ 256 KiB. RULE-153 Served text must match its manifest digest or it is not shown. RULE-154 Restoring creates a new overlay version; item versions are never reused. RULE-155 A shadow Sentinel does not serve; held reasons are named.

## 11. Responsive — UNKNOWN beyond data-label table collapse.

## 12. Current UI structure — LEGACY UI — NOT A DESIGN REQUIREMENT
Tree + search on the left, reader/editor/history on the right.
