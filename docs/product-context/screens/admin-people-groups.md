# Screens: User management — `/admin` → `/admin/people`, `/admin/people/:personId`, `/admin/groups`

Source: `routes/admin/PeoplePage.tsx`, `PersonPage.tsx`, `GroupsPage.tsx`, `AdminTabs.tsx`; `lib/portal.ts`. Fixture examples from `tests/e2e/access.spec.ts` and `src/routes/admin/Admin.test.tsx` (real shapes of `app/portal/api.py`; the offline capture returns `session_expired` for `/api/admin/users` and `/api/admin/catalog`, so **no real people data exists in the capture — UNKNOWN**).

**Entry:** not in the main rail — a quiet entry "User management" ("People and groups") at the foot of the sidebar **only for accounts holding feature `users.manage`**. A refusal-leading menu item "teaches people to distrust the menu", so an entry whose feature the account lacks is not rendered; while the permission call has not answered, gated entries stay hidden. `/admin` redirects to `/admin/people`. A tab pair **People · Groups** (`AdminTabs`).

## 1. Purpose
Onboard people, set what each may do, and group them. Administration is "something an administrator does occasionally, to the platform rather than with it." (CONFIRMED)

## 2. Primary user
Platform administrator (`users.manage`).

## 3. User jobs
Invite a person by email; set their role, groups, internet-sign-in permission and individual feature exceptions; resend an invite; disable/enable an account; create/edit/delete groups; see who is active / awaiting setup / disabled / office-network-only.

## 4. Information available

### People — `/admin/people`
Page "People". Warnings: "Nobody can be onboarded yet" (danger — email/provisioning not configured: `email` and `provisioning` delivery statuses with `configured` + `reason`), "Invites will not be delivered" (warning), "The people list did not load" (danger).
Summary counts (each a `dt`): **Active** ("Have set a password") · **Awaiting setup** ("Invited, no password yet") · **Disabled** · **Office network only** ("Cannot sign in over the internet").
List "Everyone with access" — search "Name, address, role or group"; filter "Every state / Active / Awaiting setup / Disabled". Columns: **Person** (display name or username, email) · **Access** (role label, groups, extra grants) · **Sign-in** (Active / Awaiting setup / Invite not delivered / Disabled — disabled is deliberately *not* an error tone) · **Network** ("Internet sign-in" / "Office network only") · **Last active** ("Never" is a fact about the person, not a missing value) · actions. Row actions: open person; **Resend invite** ("Send it again, or share the link directly"; toast "Invite sent again."); disable/enable. Empty: "Nobody has been invited yet — Invite someone to give them access." / "No match — Change the search or the sign-in filter."

### Person — `/admin/people/:personId` (and new)
Heading = name, or "Invite someone". Notes: new → "They receive a link to set a password. No password is created for them."; existing → "Changing anything here signs this person out of every open session."
Form (fieldsets): **Who** (work email — required "Enter a work email address."; sign-in identifier "cannot be changed" once created; display name "Shown in the console and in the invite."); **Role** (one of the catalog roles — e.g. Administrator, Composer, Operator, Viewer, Auditor with descriptions); **Groups** (checklist; "No access beyond the role" for a group that grants nothing); **Where they can sign in from** ("Allow sign-in over the internet" — otherwise office network only; defaults can come from a group); **What they can do** (feature checklist grouped by feature group; each tick shows "From role or group" when inherited; the form sends only the **exceptions**: `grants` = effective − inherited, `denies` = inherited − effective); **Account** (read-only: Invited by/at, Password set, Last active, last invite outcome `sent | failed | skipped`).
Real feature keys (fixture): `compose.view`, `compose.author`, `workers.view`, `workers.build`, `workers.deploy`, `workers.operate`, `workers.retire`, `evidence.view`, `evidence.export`, `environment.manage`, `users.manage`; groups Compose · Workers · Evidence · Environment · Administration. Fixture roles → features: administrator = all; composer = compose.view/author, workers.view, evidence.view ("Composes and edits Workers. Cannot deploy or run them."); operator = compose.view, workers.view/build/deploy/operate, evidence.view, environment.manage ("Builds, deploys and runs Workers. Cannot change what a Worker is."); viewer = compose.view, workers.view; auditor = + evidence.view/export.

### Groups — `/admin/groups`
"Groups" — create form (name, slug auto-derived — "Give the group a name." / "The name needs at least one letter or digit."; description; default role; default internet access; "What this group grants" feature checklist) and table "Every group": **Group** · **Grants** ("No access beyond the role") · **Members** · actions (edit, delete). Empty: "Create one to give a team the same access in a single step." Fixture: `bfsi-reviewers` "BFSI reviewers" — "Reads evidence for the quarterly review." default role viewer, grants evidence.view + evidence.export, 2 members.

## 5. User actions
| Action | Trigger | Preconditions | Result | Failure |
|---|---|---|---|---|
| Invite | Person form (new) | email valid | `POST /admin/users` → invite email with a set-password link; response `invite: sent|failed|skipped` | PortalError message ("That did not save") |
| Update | Person form (existing) | — | `PATCH /admin/users/{id}`; **signs the person out of all sessions** | same |
| Disable / Enable | row / person | — | `POST /admin/users/{id}/disable|enable` | "That did not work." |
| Resend invite | row | status invited | `POST /admin/users/{id}/resend-invite` | message |
| Create/Update group | Groups form | name | `POST/PATCH /admin/groups` | "That did not save" |
| Delete group | row | — | `DELETE /admin/groups/{id}` | "That group was not removed." |

## 6. Filters: search + state filter (People). No sort controls.
## 7. Navigation: tabs People/Groups; breadcrumb back from a person.
## 8. State model: loading · loaded · empty · errors above · saving · field problems ("Enter a work email address.").
## 9. Data: `GET /admin/catalog` (roles, features, featureGroups, groups, email/provisioning delivery), `GET/POST/PATCH /admin/users…`, `GET/POST/PATCH/DELETE /admin/groups…`, `GET /admin/activity` (events: actorEmail, subjectEmail, kind, detail, at — API exists; no screen found, UNKNOWN), `GET /auth/permissions`.
## 10. Business rules
RULE-200 A person's effective features = role features ∪ group features, then individual grants/denies. RULE-201 The UI shows the inherited baseline so a tick reads "on top of the role", not as the whole answer (the commonest way a permissions screen misleads). RULE-202 No password is created for an invitee; they set it from an emailed link. RULE-203 Editing signs the person out everywhere. RULE-204 Authority is resolved **server-side on every request**; the console only hides entries ("fails towards showing too little"). Only `users.manage` is checked in the console.
## 11. Responsive: tables with labelled cells (`data-label`). 
## 12. Current UI structure — LEGACY UI — NOT A DESIGN REQUIREMENT: tab pair + summary strip + table / long form with fieldsets.
