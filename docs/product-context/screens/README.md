# Screens index

Each file documents one or more production routes with the 12-section structure (Purpose · Primary user · User jobs · Information · Actions · Filters · Navigation · State model · Data · Business rules · Responsive · Current UI structure marked **LEGACY UI — NOT A DESIGN REQUIREMENT**). Routes that share one component, one data model and one workflow are documented together; **every route is named in the first lines of its file and in `../application-map.md`** (which gives its own row).

| File | Routes covered |
|---|---|
| dashboard.md | `/dashboard`, `/govern/*` (redirect) |
| compose.md | `/compose`, `/compose/guided/:compositionId`, `/compose/:compositionId`, `/compose/expert` (redirect) |
| saved-drafts.md | `/compose/drafts` |
| packaging.md | `/packaging` |
| customer-delivery.md | `/customer-delivery` |
| delivery-wizard.md | `/customer-delivery/prepare/:packageId` |
| registry.md | `/workers` |
| worker-detail.md | `/workers/:compositionId`, `/workers/:compositionId/okf` (redirect) |
| worker-configuration.md | `/workers/:compositionId/runtimes/:workerId/configuration` |
| operate.md | `/operate`, `/fleet/*`, `/observe/*` (redirects) |
| learning-fleet.md | `/learning`, `/learning/workers`, `/learning/shared`, `/learning/*`, `/knowledge/brains` (redirect) |
| worker-learning.md | `/learning/workers/:id` and its 14 sub-routes (brain, brain item, effect, skills, skill change, facts, sharing, records, record, sync, routing, sentinel log) |
| okf-browser.md | `/learning/workers/:id/okf` |
| sentinel.md | `/sentinel`, `/sentinel/workers`, `/sentinel/decisions`, `/sentinel/decisions/:decisionId`, `/sentinel/policy`, `/sentinel/:dimension`, `/learning/workers/:id/sentinel/:decisionId` |
| knowledge-library.md | `/knowledge` (redirect), `/knowledge/skills|languages|evals|dod|models|capture` |
| knowledge-governance.md | `/knowledge/coverage|inbox|packs` (`/knowledge/*`) |
| harnesses.md | `/harnesses`, `/harnesses/:key`, `/harnesses/certify`, `/harnesses/conformance`, `/harnesses/conformance/:reportId`, `/harnesses/sdk[/:page]`, `/harnesses/reference[/:page]` |
| admin-people-groups.md | `/admin`, `/admin/people`, `/admin/people/:personId`, `/admin/groups` |
| auth-and-shell.md | `/login`, `/auth/forgot`, `/auth/set-password`, `/auth/reset`, `/`, `/home`, `*` (and the AppShell) |
