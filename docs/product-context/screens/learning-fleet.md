# Screen: Learning (estate) — `/learning`, `/learning/workers` (any `/learning/*` not matching a Worker route), `/learning/shared`

Source: `routes/learning/LearningPage.tsx`, `routes/learning/Workers.tsx`; `lib/learningRank.ts`, `lib/durableApi.ts`; mock `/api/learning/workers` (`learning-workers-v1`), `/api/sentinel/learning` (`sentinel-learning-fleet-v1`).

Rail: **Learning** — "What Workers add". `/learning/*` is a catch-all: unknown sub-paths (e.g. `/learning/improvement`, `/learning/compounding`, `/learning/brains`) resolve to the Workers view. `/knowledge/brains` redirects here. (CONFIRMED)

## 1. Purpose
"What Workers learned from executing work." Ranks Workers by **what they learned** — running or not — and shows (read-only) which Workers *would* share learning. It is the counterpart of the Dashboard: the Dashboard says what Workers delivered; Learning says what they added. It is **not** a scoreboard of run outcomes: "No run-outcome or DoD-rate figures: those belong to the Dashboard." (CONFIRMED)

**Learning vs Knowledge (CONFIRMED, nav.ts + routes):** *Knowledge* is the **library of what TCS knows** — Skills, domain languages (DSLs), EVALs, Definition-of-Done rubrics, small models — that a Worker can be *given* at compose time. *Learning* is the **record of what the estate has added to it**: which Skills a Worker proposed changing, and what a Worker now remembers/knows that nobody wrote down. They are two destinations because "what do we know" and "what did we learn last month" are asked by different people for different reasons.

## 2. Primary user
Platform owners / delivery leads who want to see whether Workers get better; engineers diagnosing a Worker's learning.

## 3. User jobs
Rank Workers by learning; see fleet totals (experiences, approved OKF items, adopted Skills, token change per met run); filter to Workers that have a kind of learning; open a Worker's learning; see which Workers are grouped by bounded context for sharing.

## 4. Information available
**Views (tabs, URL path): "Workers" (`/learning` default) and "Shared learning" (`/learning/shared`).** Period (header select; Workers only): All time (default) · 90 days · 30 days (`?period=`).

### 4.1 Workers view
**Fleet tiles (each filters the list when pressed, except the last):**
| Tile | Meaning (CONFIRMED) | Caption pattern |
|---|---|---|
| Execution experiences | Certified experiences recorded from runs | "Certified · N of M Workers reported · {period} · incl. N stopped" |
| OKF items approved | Knowledge items the Sentinel approved | "Sentinel decisions · shadow · not served / N applied / N shadow · N applied / mode not reported" |
| Skills adopted | Learned Skills held | "Learned Skills held · N Workers" |
| Tokens per met run | Fleet change in tokens per met run, only over Workers with comparable runs | "−23% · N Workers with comparable runs · {method}"; else "Not comparable" / "No fleet figure" |
A tile with no reporting Worker shows "Not reported" (muted), never 0.

**Worker card:** name (link), short ID only if two Workers share a name, harness label, state ("Running" / "Stopped {date}" / "Terminated {date}"), **Learning score** (or "Not reported"; "partial" when not all four terms are reported), the four terms in one line — `Execution · OKF (+ "shadow") · Skills · Reuse` — "Score details" table (how the score is made), "Learning score = E + 2P + 3S + C" (E execution experiences, P OKF approved, S Skills adopted, C reuse; **computed by the server, never recomputed by the console**), "{period} · N of 4 terms reported", "Top learned item" with evidence class, a provenance chip (live from the Worker's Runtime vs the platform copy, with time), "View learning".
- Grouping: workers with a score are cards; Workers with nothing learned are listed together as "idle"; Workers with no learning record kept at all ("No learning record kept for this Worker.") together as "never"; stopped Workers that report no score are one group "silent" (live: avoided ~10,000 px of repeated "Not reported" cards).

**"Learning effect" panels:** before/after median tokens per met run for a Worker (two columns from zero), captioned with n runs each side.

### 4.2 Shared learning view
Callout: **"Sharing is declared, not active. No knowledge has moved between Workers."** Workers grouped by shared bounded context ("N bounded contexts · M Workers"), each group expandable "View Workers" → per Worker: "Shared with N · May compound on it N · Received from N" and a "Sharing" link. "Sharing requirements": Independent Workers 2 · Definition of Done Required · Shared material "Conversion patterns only" · Customer material Excluded · Availability "Admission path not built". (CONFIRMED — all constants of the current product state)

## 5. User actions
| Action | Trigger | Result |
|---|---|---|
| Change period | Header select | Reloads; resets page |
| Refresh | Header | Reloads ("Updating…") |
| Press a tile | Tile | Toggles `?has=experience|okf|skill` filter chip (removable) |
| Search / Include stopped / Sort | Controls | Filters; `?q`, `?stopped=0`, `?sort` |
| View learning | Card | `/learning/workers/{id}` with `from` state so Back returns to the same page/search/sort/period |
| Open the group | Shared view | Reads each member's sharing summary on open |

## 6. Filters / search / sorting
Search by name or ID prefix; Include stopped (default on); Sort (`SORTS`, default "score": by Learning score, ties by latest learning, then name, then id); "Has" filter from tiles. 20 per page; page in URL. The server may truncate: "first Workers only".

## 7. Navigation
In: rail; Registry; Worker detail "Open Learning page". Out: per-Worker Learning. Back from a Worker restores list state.

## 8. State model
Loading skeleton · Loaded · "Updating…" · "Update failed. Showing data from {time}." (keeps last good data; **only** an availability failure keeps stale data) · Session expired ("Sign in") · Forbidden ("You do not have access. Learning is shown to people with console access.") · Not built ("Learning is not available on this console yet.") · Unavailable with Retry · "N Workers did not report. Showing their last platform copy where one exists."

## 9. Data dependencies
`GET /learning/workers?period=` (`learning-workers-v1`), `GET /worker-portfolio` (grouping), `GET /learning/workers/{id}/sharing` (per group member).

## 10. Business rules
RULE-130 Learning score formula `E + 2P + 3S + C` from the server; unreported terms are "not reported", never 0. RULE-131 Shadow is never "served" and never green. RULE-132 Learning and Dashboard must not be confused: "50 completed runs" (Dashboard) and "46 runs it learned from" (Learning) are different counts. RULE-133 Sharing between Workers is declared only; nothing moves yet.

## 11. Responsive — Worker cards stack; tiles shrink to a phone-width figure with the caption holding the "who reported".

## 12. Current UI structure — LEGACY UI — NOT A DESIGN REQUIREMENT
Header (period, refresh) → tabs → 4 tiles → search/sort row → Worker cards → collapsed groups → pager → "Learning effect" figures.
