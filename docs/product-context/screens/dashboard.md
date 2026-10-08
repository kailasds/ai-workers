# Screen: Dashboard — `/dashboard`

Source: `apps/console-ui/src/routes/dashboard/DashboardPage.tsx`, `src/lib/durableApi.ts` (`getExecutiveDashboard`, `ExecutiveDashboard` = `dashboard-executive-v4`), offline example `offline-mock/routes.json` → `/api/dashboard/executive` (captured 2026-10-06).

Rail label: **Dashboard** — rail description "What Workers deliver". (CONFIRMED, `shell/nav.ts`)

---

## 1. Purpose

Answers one question for the selected period: **what did the Workers deliver, did they meet their Definition of Done, and what did it cost?** The rail comment calls it the counterpart to Learning: Learning shows what Workers *learned*, Dashboard shows what they *delivered*. (CONFIRMED, nav.ts comment)

It is a read-only outcome view. It is **not** a to-do list. The rail comment says an earlier label, "Priorities", was removed because it promised a list of things to act on and the page never had one. (CONFIRMED)

## 2. Primary user

- Delivery leads and executives who want outcomes, Definition of Done performance and run cost across the estate. (INFERRED from the `executive` endpoint name and the copy "Outcomes across Workers for the selected period.")
- Engineers who follow a single run from the ledger to its Worker. (CONFIRMED: every ledger row links to the run.)

## 3. User jobs

1. See how many Workers are active right now and how many runs completed in the period.
2. See how completed runs split into Met, Not met and Awaiting evidence.
3. See which Definition of Done criteria pass and which fail.
4. See the model cost or token spend: in total, per run, per period, per Worker identity and per bounded context.
5. Open the individual runs behind every average.
6. See how Workers are spread across identities, bounded contexts and autonomy levels.
7. Change the period (7 days, 30 days, 90 days, All time) and share it as a link.

## 4. Information available

### 4.1 Headline figures (four KPI cards plus a registry snapshot line)

| Information | Meaning | Source | Example (offline capture) | Importance |
|---|---|---|---|---|
| Active Workers | Workers that are running and answering right now. Caption: "Running and answering · current snapshot". This is a snapshot, not a figure for the period. | `headlines.active_workers` (ExecutiveCountMetric) | `1` | High |
| Completed runs | Every run a Worker reported as finished in the period, whatever the verdict. Caption: "Any verdict · last 30 days". Shows a ↑/↓ % change when a prior period exists. | `headlines.completed_runs` (+ `.comparison`) | `46` (previous 0; comparison OBSERVED, percent null) | High |
| Average duration | The mean run duration over runs that measured it. Caption: "{samples} measured runs · {period}". | `headlines.average_run_duration` | Format: "1 min 24 sec" | Medium |
| Reported model cost | The total model cost the runs reported. Caption: "{measured}/{completed} runs reported · {period}". | `run_economics.total_cost`, `run_economics.cost_coverage` | 43/46 runs reported | High |
| Registry snapshot | "Registry snapshot: {n} Workers · {n} packaged". Each figure is a link. | `headlines.registered_workers`, `headlines.packaged_workers` | `50 Workers · 38 packaged` | Medium |
| DoD met (count) | How many runs met their Definition of Done. Carried in the data, but the current UI has no card for it. | `headlines.dod_met` | `20` | Medium (available, not displayed) |

**Measurement states (CONFIRMED):**
- Every metric carries `state` = `OBSERVED` | `NOT_MEASURED` | `UNAVAILABLE`.
- When a metric is not `OBSERVED`, the UI shows **"Not measured"** (or **"Not reported"** for count metrics) in a muted style. It never shows 0.
- `comparison.state` = `OBSERVED` | `NO_PRIOR_WINDOW` | `UNAVAILABLE`. A delta appears only when the comparison is OBSERVED and `percent` is non-null and non-zero.

### 4.2 Freshness

| Information | Meaning | Source | Example | Importance |
|---|---|---|---|---|
| Updated | When the data was last read successfully. | `generated_at` | 2026-10-06T08:45:18Z | High |
| Freshness state per source | Whether each source is CURRENT, DELAYED, STALE or UNAVAILABLE. | `freshness.state`, `freshness.sources[]` | runs "Worker outcomes" = STALE (observed 2026-09-30); runtime "Serving runtime" = CURRENT | Medium. **The current UI does not render it.** The data is there to use. |
| Time-zone fallback | Whether the server could not use the reader's time zone and cut the buckets in UTC. | `window.tz`, `window.tz_fallback` | tz "UTC", fallback false | Low. Shown as " · Times in UTC" in chart notes. |

### 4.3 Metrics and their definitions

| Metric | Definition (as implemented) |
|---|---|
| Completed run | A run a Worker reported finished. Any verdict counts. (CONFIRMED, page comment) |
| Verdict | `MET` / `NOT_MET` / `NOT_ADJUDICABLE`. The UI words are "Met", "Not met" and "Awaiting evidence". |
| DoD rate | `definition_of_done.rate` = met ÷ completed. Example: 20/46 = 0.4348. |
| Criterion pass | Per criterion: `passed_runs / measured_runs`. Each criterion is shown on its own and **never averaged into one score**. (CONFIRMED, comment "never averaged into one score") |
| Model cost per run | Average over the **measured** runs only, never over all completed runs. The UI must say so: "average over the 43 measured runs, not over all 46". (CONFIRMED) |
| Reported model cost | "Reported model cost is what the runs reported, not a bill." (CONFIRMED copy) |
| Tokens | Above 1 million, shown as "M" or "B" with one or two decimals. Below that, the exact figure. |
| Coverage | `{measured_runs} of {completed_runs} runs reported`. Every average must sit next to its coverage. |
| Autonomy level | Levels 1–4. Example: all 46 runs at Level 3. |
| Data quality (governance) | Checks such as "Terminal runs missing completion time" (CLEAR, 0) and "Runs without complete usage evidence" (ATTENTION, 3). **Present in the data, not rendered.** |
| Model routing | `OBSERVED` or `SELECTIONS_ONLY`. Example: Claude-5.0-Sonnet chosen 99 times across ANALYZER, CODE_REMEDIATOR, EVALUATOR, MODERNIZER, SPEC_GENERATOR. **Present in the data, not rendered.** |

### 4.4 Comparisons

- Period over period: `headlines.*.comparison` against `window.previous_start_at`–`previous_end_at`. Shown only as a delta on Completed runs (↑/↓ with %).
- Identity vs identity and bounded context vs bounded context: ranked by cost or tokens per run.
- An identity or context with nothing measured **stays in the list** and says "Not measured". It sorts below the measured ones. (CONFIRMED: "a reader comparing Worker types needs to know the difference between cheap and unmeasured")

## 5. Charts

| Chart | Purpose | Data | X-axis | Y-axis | Series | Interaction |
|---|---|---|---|---|---|---|
| Runs over time | Shape of completed runs across the period | `outcome_series[]` (every bucket in the window, including empty ones) | Bucket label (hour/day/week, or month for All time), on the reader's time zone | Completed run count (scale 0, ½, max) | One column per bucket (met + not_met + not_adjudicable) | Click or press Enter/Space on a column (or the matching list button) to select it. The selected bucket's exact count is announced above the chart ("N completed runs · 07 Sep"). Opens on the newest bucket that has runs. |
| Run outcomes (ring) | Split of the same runs by verdict | Sums over `outcome_series` | — | — | Met / Not met / Awaiting evidence, with the total in the centre | None. The legend lists every segment with its count (colour is never the only cue). |
| Model cost / Tokens per period | Spend over the period | Built from `run_ledger.rows`, so it cannot disagree with the table | Same buckets as Runs over time | Spend in the chosen measure (zero-based) | One bar per bucket. A bucket where runs finished but none reported spend has **no bar** (not zero). | The Cost/Tokens toggle changes the unit. "View data" opens the table. On a phone the table replaces the chart. |
| By Worker identity | Rank identities by cost or tokens per run | `identities[]` (ExecutiveCut) | — | Horizontal rail, share of the maximum | One row per identity | None (read-only). |
| By bounded context | The same, one level down | `bounded_contexts[]` | — | Rail | One row per context | None. |
| Worker distribution (collapsed by default) | Registered Workers by identity and by context, plus runs by autonomy | `identities`, `bounded_contexts` (registered > 0 or runs > 0), `autonomy` (completed_runs > 0) | — | Rail | 3 panels | Expand or collapse. |
| Definition of Done criteria | Which criteria are met | `definition_of_done.criteria[]` | — | Rail = passed ÷ measured | One row per criterion | "View all N criteria" / "Show the first five" (5 shown by default; measured criteria sort first). |

## 6. Tables

### 6.1 Runs (the run ledger)

| Column | Meaning | Data | Sortable? | Link? | Action? |
|---|---|---|---|---|---|
| Run | The run, named by when it ran (never by its raw id). The raw id is in a tooltip. | `run_ref`, `completed_at` via `runNames()` | No (always newest first) | Yes: "View run" → `/workers/{worker_id}?view=runs&run={run_ref}`, with back-state to the Dashboard | Open run |
| Worker | The Worker's name, with its bounded context underneath | `worker_name`, `context_label` | No | No | — |
| Outcome | Verdict pill | `verdict` → Met (success) / Not met (danger) / Awaiting evidence (neutral) | No | No | — |
| Duration | How long the run took | `duration_seconds` | No | No | — |
| Model cost / Tokens | Spend in the chosen measure, or "Not measured" | `model_cost_usd` / `total_tokens` (MeasuredValue) | No | No | — |

- Paging: 20 rows per page. The page number is in the URL (`?page=N`). Controls read Newer/Older (`TIME_ORDER` labels).
- Footer: "Most recent {rows} of {completed_runs} completed runs. Newest first." when truncated, otherwise "{n} runs. Newest first."
- The server returns up to the 200 most recent runs, newest first (`run_ledger.truncated`). (CONFIRMED, comment)
- Example row: run `r-20260930t115950-23cc74d6`, Worker "Test Script Generation and Execution · Insurance", context "Test Automation Script Generation + Test Suite Execution + Reporting", verdict MET, 84.24 s, 106,273 tokens, $0.261650.

### 6.2 Spend by period (View data)

| Column | Meaning | Data | Sortable? | Link? | Action? |
|---|---|---|---|---|---|
| Period | Bucket label | slot label | No | No | — |
| Model cost / Tokens | Bucket total, or "Not measured" | derived | No | No | — |
| Runs | "{measured} reported · {unmeasured} not measured" | derived | No | No | — |

## 7. Filters, search, sorting

| Control | Values | Default | Persistence |
|---|---|---|---|
| Period | 7 days (`7d`), 30 days (`30d`), 90 days (`90d`), All time (`all`) | `30d` | URL `?period=`. The default removes the param. Changing the period resets `?page`. |
| Measure | Cost, Tokens | Cost | Component state only. **One control drives every spend panel** (CONFIRMED: "three toggles would let the page answer it three ways at once"). |
| Ledger page | 1…n | 1 | URL `?page=` |

- Bucket size comes from the server (`window.bucket`): hour, day, week or all. Example: 30d → day.
- No search. No column sorting. Ranked lists are sorted by the server's data (per-run spend, then completed runs).

## 8. Navigation

- In: rail "Dashboard"; legacy redirect `/govern/*` → `/dashboard`.
- Out:
  - Active Workers card → `/workers`
  - Completed runs and Average duration cards → `#ledger-heading`
  - Reported model cost card → `#spend-heading`
  - "{n} Workers" → `/workers`; "{n} packaged" → `/packaging`
  - Ledger "View run" → `/workers/{worker_id}?view=runs&run={run_ref}`. A link back from that run restores the period and page.
- Empty "Runs over time" offers "Choose a longer period" (sets All time) unless the period is already All time.

## 9. State model (supported states only)

| State | Trigger | What is shown |
|---|---|---|
| Loading (first) | No data yet | Skeleton "Loading Dashboard…" (4 rows) |
| Loaded | Valid `dashboard-executive-v4` | Full page |
| Refreshing | Reload or 30 s poll with data already shown | Header state "updating". `aria-busy` on the content. |
| Switching period | New period requested, old data still shown | "Showing last 30 days · loading last 7 days…" |
| Error, no data | Request failed or the reply was the wrong shape | Alert "Could not load Dashboard." + message + **Retry** |
| Error with stale data | Refresh failed | Alert "Could not refresh Dashboard. Showing data from {time}." + Retry. The old data stays visible. |
| Error while switching | New period failed | "Could not load last 7 days. Still showing last 30 days, from {time}." + Retry |
| Empty period | No completed runs | "No completed runs in this period." (+ "Choose a longer period"); ledger "No runs completed in this period."; criteria "No criterion measurements recorded."; spend "No run in this period reported what it spent." |
| No Workers | Empty identities or contexts | "No Workers are composed yet." |
| Unmeasured value | `state != OBSERVED` | "Not measured" / "Not reported", muted |
| Malformed reply | 200 response without `freshness` or `run_economics` | Treated as an error: "The executive dashboard could not be read from this platform." Never rendered. |

Refresh: the page polls every **30 s** while the tab is visible. The page header also has a manual Refresh. (CONFIRMED)

## 10. Data dependencies

- `GET /api/dashboard/executive?window={7d|30d|90d|all}&tz={IANA}`. If the server answers 422 `TZ_INVALID`, the client retries without `tz`. (CONFIRMED, durableApi)
- No mutations.

## 11. Business rules

- Unmeasured is never shown as zero. (RULE-010)
- Every average states its sample ("N of M runs reported"). (RULE-011)
- Reported model cost is not a bill. (RULE-012)
- Criteria are listed one by one and never averaged. Gating criteria say "stops a release". A criterion with no threshold says "No required threshold". (RULE-013)
- Period captions name the period that is **actually shown** (the one in the server reply), not the one just clicked. (CONFIRMED, review-07 D07-1)
- A run is named by when it ran, never by its raw id. (CONFIRMED, rules §6)
- Spend charts and the ledger use the same rows, so they cannot disagree. (CONFIRMED)
- A bucket where runs ran but none reported spend is "no bar", not a zero bar. (CONFIRMED)

## 12. Responsive requirements (inferred from real behaviour)

- On a phone the spend table replaces the spend chart. On desktop the table sits behind "View data". (CONFIRMED)
- The ledger sits in a horizontally scrollable region labelled "Runs". (CONFIRMED)
- The period select is in the header at every width. (CONFIRMED, comment "rules §2")
- Chart axis labels thin out to about 8 when there are 8 or more buckets.

## 13. Current UI structure — LEGACY UI — NOT A DESIGN REQUIREMENT

Page header (title, scope, Updated, Refresh, Period select) → 4 KPI cards + registry snapshot line → row: Runs over time (wide) + Run outcomes ring → row: Model cost/Tokens chart with Cost/Tokens toggle + Definition of Done criteria → row: By Worker identity + By bounded context → Runs ledger with pager → collapsed "Worker distribution" (3 panels).
