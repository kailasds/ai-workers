# Screen: Saved drafts — `/compose/drafts`

Source: `routes/compose/SavedDraftsPage.tsx`; `lib/durableApi.ts` (`listCompositions`, `archiveComposition`, `getPackageableCompositions`).

## 1. Purpose
Lists every Worker draft (a "composition") so a person can **continue editing** one, or **archive** one that was never packaged. Page copy: "Continue a Worker preset from its generated identity and bounded context." (CONFIRMED)

## 2. Primary user
Whoever composes Workers. Archiving is for administrators only (role `aiworker-admin`). (CONFIRMED)

## 3. User jobs
Find a draft by name; continue it; start a new Worker; archive an abandoned draft; see whether a draft already has a reserved identity (continuing one creates a **new revision under the same identity**, which is a different act from starting a new Worker — CONFIRMED comment).

## 4. Information available
| Information | Meaning | Source | Example | Importance |
|---|---|---|---|---|
| Worker identity (name) | Draft name; falls back to "New Integration Modernisation Worker" when blank | `CompositionRecord.name` | "QE worker 0610" | High |
| Bounded context / scope | What the identity is bound to: `bounded_scope`; or "Identity reservation pending" (no identity yet) or "No scope recorded" | `identity.bounded_scope` | "Test automation from written test cases" | High |
| Out-of-scope count + identity status | "N out of scope" and "Identity {status}" — shown only when excludes exist or status is not ACTIVE | `identity.scope_excludes`, `identity.status` | "4 out of scope · Identity provisioned" | Medium |
| Revision | `current_revision` | record | 11 | Medium |
| Status | Active / Archived — column appears **only when at least one draft is not active** | `status` | — | Low |
| Updated | When it last changed | `updated_at` | — | Medium |

## 5. User actions
| Action | Trigger | Preconditions | Result | Failure |
|---|---|---|---|---|
| Continue | Row link | — | `/compose/guided/{id}` | — |
| New Worker | Header | — | `/compose` | — |
| Search | Search box "Search saved drafts" (placeholder "Search identity or bounded context") | — | Filters by **name** (substring, case-insensitive); resets to page 1 | "No drafts match this search." / "Clear the search to see every draft." |
| Archive | Row button | Viewer is admin **and** draft is ACTIVE **and** has no Package | Confirm-in-place: "It leaves Saved drafts and can no longer be continued. It has no Package, so no runtime is affected." → `archiveComposition(id, record_version)` → "{name} archived." | 412 "This draft changed in another session. Refresh the list, then archive it again." · 409 "A Package is being prepared from this draft. Wait for it to finish, then archive it." · 403 "Only an administrator can archive a draft." · other "The draft could not be archived. Try again." |
| Refresh | Header | After first load | Re-reads, keeps the list while updating; a failed refresh keeps the list and says so | First-load failure: "Saved drafts unavailable — Saved drafts could not be loaded. Check the console API, then try again." + Try again |

## 6. Filters / search / sorting
Search by name only (despite the placeholder). No sort controls. Paged 20 per page, page in URL `?page=` (1-based). Order is the API's.

## 7. Navigation
In: breadcrumb "Compose"; Compose header "Saved drafts"; "Save and close". Out: Continue → guided Compose; New Worker → Compose.

## 8. State model
Loading ("Loading saved drafts…") · Loaded · Empty ("No saved drafts yet." / "Start a new Worker and save it to see it here.") · Error (first load) · Refreshing/failed refresh · Archive confirm open (one row) · Archive busy/error · Archived confirmation line.

## 9. Data dependencies
`GET /compositions` (list), `GET /auth/me` (admin check by role `aiworker-admin`), `GET /compositions/packageable?limit=100` (to know which drafts have `package === null`), `DELETE`/archive via `archiveComposition` with `If-Match` record version.

## 10. Business rules
RULE-050 (archive only unpackaged drafts, admins only, because "a packaged draft may be a deployed Worker, and an archived composition leaves the Registry"). RULE-051 (an identity is **not** evidence a draft was built: one is reserved when the draft is created).

## 11. Responsive requirements (inferred)
The table collapses into labelled cards on a phone (`data-label` / `data-span` attributes on cells). CONFIRMED.

## 12. Current UI structure — LEGACY UI — NOT A DESIGN REQUIREMENT
Header with breadcrumb and one primary action → one panel "Worker drafts" with search → table → pager.
