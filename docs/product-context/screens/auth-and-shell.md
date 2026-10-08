# Screens: Sign-in and account recovery, Launcher, App shell, Not found

Source: `routes/login/LoginPage.tsx`, `routes/auth/*`, `routes/launcher/LauncherPage.tsx`, `routes/shell/AppShell.tsx`, `NotFoundPage.tsx`, `WorkNotices.tsx`, `nav.ts`; `lib/session.ts`, `lib/portal.ts`. Mock: `/api/auth/me` = {subject "offline-demo-capture", displayName "Offline Demo Capture", roles ["aiworker-admin"]}; `/api/auth/permissions` returns `session_expired` in the capture.

## 1. Sign in — `/login` (public)
**Purpose:** authenticate with the platform identity. The console posts credentials to **its own API**, which exchanges them with the identity provider (Keycloak) and returns an **httpOnly session cookie**; the browser never holds or reads a token. "Compose, operate and govern accountable AI workers." / "Use your platform identity to continue." Shows connection context: "{environment} · {realm}" or "Protected platform access" (if unknown — rendered as unknown, not a default).
**Fields:** username, password (cleared after a failure).
**Failure vocabulary (every case named, each with a specific recovery; a generic error is not acceptable):**
| Case | Title | Detail |
|---|---|---|
| invalid-credentials (400/401, identical for wrong password and unknown account — anti-enumeration) | Username or password is incorrect | Check both fields and try again. |
| account-locked (423) | Account locked | Try again in N seconds, or contact your platform administrator. |
| rate-limited (429) | Too many attempts | Try again in N seconds. / Wait a moment, then try again. |
| identity-provider-unreachable (502/503/504) | Identity service unavailable | Try again in a moment. If this continues, contact the platform team. |
| offline | Console unreachable | Check your connection and try again. |
| not-provisioned (403 `not_provisioned`) | This account has no access to AI Worker | Your password is correct. Ask a platform administrator to add you. |
| account-disabled | This account is not active | Ask a platform administrator to enable it. |
| invite-pending | Finish setting up this account | Use the link in your invite email to set a password. Ask an administrator to send it again if it has expired. |
| network-restricted | This account only works on the office network | (server detail: connect to the VPN) |
| server-error | Sign-in failed (status) | Try once more… |
**Links:** forgot password → `/auth/forgot`. After success: go to the page the user came from (`state.from`) else `/home`.

## 2. Forgot password — `/auth/forgot` (public)
Enter email → `POST /auth/forgot-password`. The confirmation is **identical whether or not the address has an account** ("a way to find out who works at the company" otherwise). Info: "The link expires in one hour." Error: "The request could not be sent." Back to sign in.

## 3. Set password — `/auth/set-password?token=` (invite) and `/auth/reset?token=` (reset) (public)
Reached from an email by someone with no session. Reads the link (`GET /auth/invite|reset?token=`) to address the person by name (email, display name, role label, `minPasswordLength`). Heading "Set up your account" (invite) / "Choose a new password" (reset). Rule text: **"At least 8 characters, with an upper-case letter, a lower-case letter, a digit and a symbol."** (the realm's own rule, shown up front; the authoritative refusal comes from Keycloak and is shown verbatim). Two fields; "The two passwords are not the same."; button "Set password and activate" / "Set new password". Link problems: "This link is incomplete." / "This link could not be checked. Try again shortly." / expired → "Ask your administrator to send the invite again." (invite) / "Ask for a new reset link from the sign-in page." (reset). Success: "You can sign in now."

## 4. Launcher — `/home` (also `/` redirects here)
The root lands on a launcher "rather than on a capability, so somebody arriving chooses a workspace instead of being put inside one." The launcher gets the screen to itself; the sidebar is parked. Wordmark as H1 ("AI Worker Platform"), line "Compose, package and prepare a Worker for delivery.", and **three tiles in the order the work happens**: **Compose a Worker** ("Define its work, permissions and Definition of Done." → Open Compose, `/compose`) · **Package a Worker** ("Build a versioned Package from a composed Worker." → Open Packaging, `/packaging`) · **Deliver to a customer** ("Prepare a Package for the customer's environment." → Open Customer delivery, `/customer-delivery`). **No counts and no stage labels** (asked to go: "a number on a tile is a reason to stop and read rather than to go").

## 5. App shell (every authenticated route)
- **Session check** on every navigation: `GET /auth/me` + `GET /auth/permissions` asked together. No identity → redirect to `/login` with `from`. If the permission read fails, gated entries stay hidden and the profile shows nothing rather than "Checking access" forever. Session service down: "The session service did not respond. Check your connection and try again."
- **Sidebar (rail):** wordmark (home), "Workspace" group with the nine entries (Dashboard, Compose, Packaging, Customer delivery, Registry, Knowledge, Learning, Sentinel, Harnesses — see `application-map.md`), "Administration" (User management, gated), **Active work** menu, the signed-in person (initials avatar, name, role), **Sign out** ("Sign out failed. Check your connection and try again."). Phone: a named **Menu** button opens the whole list; Escape closes it; closes on navigation; first link takes focus.
- **Active work** ("Work in progress", "View all" → `/operate`, "No background work is running."): lists running delivery operations (`getDeliveryOperations(active)` polled every **15 s**, paused when the tab is hidden); labels: `DEPLOY_ECS` "Deploying Worker", `RUN_READINESS` "Assessing readiness", otherwise "Building Package"; each with progress, "Starting", and **Resume** → `/compose/guided/{id}?station=package_deploy&delivery={workflowId}`.
- **Work notices** (what finished while you were elsewhere): when an operation leaves the active list the shell asks how it ended (SUCCEEDED / FAILED / CANCELLED), then shows a persistent, dismissible notice "{label} finished" / "{label} failed|cancelled" with detail ("It finished while you were elsewhere." / "Stopped at {error code}." / "It did not finish.") and an **Open** link: a finished deployment → `/workers/{compositionId}`; everything else → the journey's packaging station. Deliberately **not a toast**: it belongs to no page, stays until dismissed, `aria-live="polite"`, never steals focus.
- A **route error boundary** wraps the shell ("The console could not load. Reload the page.") and each page ("Reload the page, or choose another section.").
- **Skip to content** link; a TCS watermark ends the workspace in flow.

## 6. Not found — `*` (inside the shell)
"Page not found. Nothing in the console is at {path}…" and a suggestion of the nearest owning section: `/workers/<id>/…` → "the Worker"; otherwise the longest matching section the person is allowed to open; else "the Dashboard". A signed-out browser is sent to sign in first.

## Business rules
RULE-210 The browser never holds a token. RULE-211 Sign-in errors never distinguish "wrong password" from "unknown account". RULE-212 Reset/forgot confirmations are account-agnostic. RULE-213 Gated entries are hidden, not disabled. RULE-214 Background work is observable from anywhere and finishes with a notice that links to where it left something to look at. RULE-215 Session is re-verified on every navigation.

## Responsive
Menu button on phones; launcher tiles stack; the mark is width-capped (a bare 88 px clipped silently once). **Current UI:** LEGACY UI — NOT A DESIGN REQUIREMENT (dark-teal sidebar, centred card sign-in).
