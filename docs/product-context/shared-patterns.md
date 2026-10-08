# Shared patterns

Interaction and information patterns that recur across the product. For each: **Pattern · Purpose · Behaviour · Data · States · Actions · Accessibility requirements · Can be redesigned?** "Can be redesigned? YES" means the *visual and structural presentation* may change completely; "NO" means the **behaviour/semantics** must be kept (the pattern may still look entirely different). Sources: `src/components/*`, `src/routes/shared/*`, comments citing the product's own rules (`rules-2026-10-03`, `design-v2`, `DESIGN_SYSTEM.md`) — cited here only for the behaviour they pin.

> Baseline accessibility the product already holds itself to (CONFIRMED): colour is never the only carrier of meaning (shape + word); every control has an accessible name that names what it acts on ("More actions for Claims QE Worker"); focus moves deliberately after navigation, confirmation and paging and returns to the trigger on cancel/Escape; async changes are announced with `aria-live="polite"` and never steal focus; tables have captions or labels and collapse to labelled records on phones; all motion respects `prefers-reduced-motion`; one H1 per page; skip-to-content link; keyboard-operable tree/tablist/menu semantics.

---

### P-01 Page header with utilities
- **Purpose:** answer "where am I, what is this, what can I do". 
- **Behaviour:** breadcrumb **on sub-pages only** (the current page is never a link to itself); one title; at most one scope sentence; a **utility group** — *Updated {time}* (latest **successful** fetch), a labelled **Refresh**, and a **Period** select — then a **task group** (one secondary, then the single primary action). Omit utilities on static reference pages. Refresh states: `idle | updating (keeps content, says so) | failed (keeps last data and says when)`.
- **Data:** last-fetched timestamp, period options, caller's state. **Actions:** Refresh, period change, primary/secondary task.
- **Accessibility:** heading hierarchy; refresh state announced politely. **Can be redesigned? YES** (placement, form). **Must keep:** last-updated time, refresh with a visible updating/failed state, one primary action, breadcrumb back-context ("Back to {where you came from}").

### P-02 Section navigation (tabs ↔ select)
- **Purpose:** a page's local sections (e.g. Packaging queues, Worker views, Knowledge tabs, Sentinel views).
- **Behaviour:** tabs on wide screens; **below 768 px one native select labelled "Section"**, same order, counts in options. Route sections navigate; others hold state in the URL. A `disabled` mode holds the section while an action is being sent. Counts beside labels ("Packaged (20)").
- **Accessibility:** one control hidden from display *and* accessibility tree at a time; selected state exposed. **Can be redesigned? YES** — **must keep:** deep-linkable section, counts, hold-while-sending.

### P-03 URL-held view state & "came-from" memory
- **Purpose:** Back, reload and shared links restore the same view.
- **Behaviour:** search text, filters, sort, period, page, open record, section and selected item live in the **query string**; filter changes reset the page; opening a record from page N then Back returns to page N; pages carry router state `from` so the Back link names its origin ("Back to Dashboard"). History: deliberate view changes push entries; filter typing replaces.
- **Can be redesigned? NO (behaviour)** — the new UI must keep URL-addressable state and origin-aware Back.

### P-04 Search, filter, sort bar
- **Behaviour:** free-text search (substring, case-insensitive; fields differ per list — see screens), selects/chips for filters, a Sort select where ordering is a choice, a removable chip for an active filter, "Clear filters", and a result count ("N Workers match"). Coverage caveats are stated where the count is ("Search covers N loaded records, the newest of M"). A filtered-empty list offers "Clear filters" (distinct from a never-populated empty state).
- **Can be redesigned? YES.** Must keep: coverage honesty (a loaded count is never an estate total).

### P-05 Pager
- **Behaviour:** 20 records per page everywhere; page in URL (1-based; invalid → first page; clamped past the end); "Previous/Next" for ranked lists, **"Newer/Older"** for newest-first lists; shows range "x–y of N"; renders only when there is somewhere to go; focus moves to the list heading on page change. Server-cursor lists use "Show older …"/"Read more" and say when the list is partial.
- **Can be redesigned? YES** (infinite scroll is acceptable only if URL position, partial-read disclosure and focus are preserved).

### P-06 State label (shape + word)
- **Purpose:** show a recorded state without relying on colour.
- **Vocabulary (CONFIRMED):** run verdict `MET → "Met"`, `NOT_MET → "Not met"`, `NOT_ADJUDICABLE → "Awaiting evidence"`, `NOT_MEASURED → "Not measured"`, null → "Not reported"; runtime lifecycle & health words; delivery states; identity states; severity ladder (0 Observe · 1 Warn · 2 Restrict · 3 Stop · Grant); criterion states PASS / FAIL / NOT_MEASURED / OBSERVED / UNAVAILABLE ("A failed check that is not a release gate: attention, not failure"). **Tone rules:** green only for a **verified result** (Met, Healthy, Acknowledged); "Active", "configured", "published", waiting and unknown are neutral; danger for failed/revoked/not met; warning for stale/expired/attention; info for in-flight/shared.
- **A measured 0 is a number, not a state.** **Can be redesigned? YES (appearance); NO (vocabulary & tone rules).**

### P-07 Measured value, unknown and coverage
- **Behaviour:** every metric is `{state, value}`; non-OBSERVED renders **"Not measured"/"Not reported"** (muted), never 0 or blank. Averages carry their sample ("43/46 runs reported"). Comparisons carry state (no prior window / unavailable). Fleet sums say who reported ("4 of 5 Workers reported"; "incl. 2 stopped"). A partially-read list says it is partial.
- **Can be redesigned? NO** — core honesty rule (RULE-010, 011).

### P-08 Freshness, provenance and "platform copy"
- **Behaviour:** documents show when they were read; sources carry `CURRENT | DELAYED | STALE | UNAVAILABLE`; learning figures say whether they came from the **Worker's Runtime now** or the **platform's retained copy** ("Platform copy · synced {time}", never "Current"); a failed refresh **keeps the last good data and says when it is from**; a stopped Worker opens its retained copy immediately.
- **Can be redesigned? YES (presentation); NO (the disclosure).**

### P-09 Evidence tile
- **Behaviour:** one fact, one scope, one destination: label (measure), single value, one caption (over what, from where). The whole tile is the control — a filter toggle (pressed state), a link or an action. Value-as-state ("Not reported") uses body type, not metric type.
- **Can be redesigned? YES.**

### P-10 Confirm in place
- **Purpose:** destructive or consequential action with a named target.
- **Behaviour:** expands under the trigger with the **named target**, the **consequence in plain words**, and **"Verb + object"** action (never "OK"), plus Cancel; focus moves to its heading; Escape/Cancel closes and returns focus to the trigger; one open confirmation per list scope (others' commits wait); the commit is disabled until required fields are complete; an error keeps it open and keeps the inputs. Tone `danger` for destructive.
- **Used for:** archive draft, stop/terminate runtime, resume, record acknowledgement, publish source, restore a version.
- **Can be redesigned? YES (e.g. dialog or popover)** — must keep named target + consequence + disabled-until-complete + focus return.

### P-11 Required reason
- **Behaviour:** a free-text reason (non-blank, ≤ 500 chars) is required to **stop**, **resume**, or **deploy a held Worker**; it is **recorded with the Platform Sentinel decision/lift** so other operators read why. The commit stays disabled until valid. **Can be redesigned? YES; NO for the requirement.**

### P-12 Typed-name confirmation
- **Behaviour:** the person must type the Worker's exact name to enable **Revoke identity** and **Sentinel › Stop Worker**; it "only guards against the wrong Worker" (permission is checked server-side). **Can be redesigned? YES; keep the guard.**

### P-13 Callout / error with recovery
- **Behaviour:** tone (info/success/warning/danger); a **title that names the problem** and a body/action that **names the recovery** ("a callout without one is an unfinished error message"); `live` for anything that must be announced when it appears; may be the page itself (error state replaced the page: its title is the heading and receives focus). Errors name causes in the product's words; edge/WAF refusals use one fixed sentence; never advise altering input to bypass a rule.
- **Can be redesigned? YES.**

### P-14 Loading skeleton
- **Behaviour:** shape-of-content placeholder with a **label naming what is awaited** ("Loading Dashboard…", "Reading the Worker portfolio"); no percentages or timers (the console doesn't know progress); `aria-busy`/status for assistive tech. Variants: row (strip of tiles), stack, page. **Can be redesigned? YES.**

### P-15 Empty states
- **Behaviour:** distinguish *never populated* ("No Workers have been composed yet. A Worker appears here once it is composed. → Compose") from *filtered to nothing* ("No Workers match these filters. → Clear filters") from *unreadable* ("Draft list unavailable") from *not applicable* ("No runtime is serving, so there is nothing to stop"). Each says what to do next. **Can be redesigned? YES; keep the four-way distinction.**

### P-16 Unknown ≠ none (reachability)
- **Behaviour:** when a Worker/Runtime cannot be asked, the UI says it could not be asked ("This Worker could not be reached.", "Did not report", "Not observed: no serving runtime") and never shows an empty list as proof of none. **Can be redesigned? NO (semantics).**

### P-17 Time display
- **Behaviour:** the **reader's local time**, zone omitted from the text but present in the tooltip and a machine-readable attribute; forms `moment` ("Oct 3, 2026, 9:05 AM"), `day`, `list` (time alone if today), `relative`; never wraps; absent = "Not reported" unless a stage name is given ("Not judged"). Charts bucket on the reader's zone (server told the IANA zone; fallback to UTC is disclosed). A run is named by *when it ran*, not its raw id (id in tooltip/detail).
- **Can be redesigned? YES (format); keep local-time & zone disclosure.**

### P-18 Digest / identifier display
- **Behaviour:** short form with copy (`sha256:abcd…wxyz`); full on request; ids shown short (8 chars) **only when ambiguous**; names beat keys wherever a catalogue name exists (key shown only if no name resolves). **Can be redesigned? YES.**

### P-19 More actions menu
- **Behaviour:** each row/header has at most one visible secondary action; everything else in "More actions" with an accessible name naming the target; ordinary actions, separator, **destructive last in danger text**; disabled items explain why; opens at a fixed position so a scrolling table cannot clip it; arrow keys, Escape returns focus. **Can be redesigned? YES.**

### P-20 Searchable select with disabled reasons
- **Behaviour:** options have label, one-line detail (never a restatement), right-aligned meta (e.g. "3 scopes", "8 compliance checks"), optional search synonyms; unavailable options are shown **disabled with a stated reason** (e.g. "In build · Available later"); persistent hint explains what leaving it empty means. **Can be redesigned? YES.**

### P-21 Spending-limit field
- **Behaviour:** one field wherever a Worker is deployed (first deploy, package step, Operate, Deploy again, Resume); prefilled from the offer (in force / inherited / worker-type default) with its source sentence; shows bounds, this month's spend and the next reset moment (local time); an **inherited** amount must be explicitly confirmed; **blank never means unlimited**; deploy is blocked if this month's spend can't be read; invalid input shows the bounds sentence. **Can be redesigned? YES; NO for these rules (RULE-031…033).**

### P-22 Background work tracker and completion notice
- See `screens/auth-and-shell.md` §5. **Behaviour:** active operations visible from anywhere with a way back; completion produces a **persistent, dismissible notice** (not a toast) linking to where the work left something to look at. **Can be redesigned? YES; keep persistence, linkability and "how it ended" (don't assume success).**

### P-23 Durable operation with reattach
- **Behaviour:** long work (build, deploy, customer preparation) is a server workflow; the page shows phase + progress; closing the tab doesn't stop it ("You can close this page. Deployment continues…"); the operation id is in the URL so reload/second tab **reattaches** instead of starting another; an interrupted submit is **reconciled against the server before any retry**; dropped responses are re-read. States QUEUED/RUNNING/WAITING_RETRY/PAUSED/CANCELLING/CANCELLED/SUCCEEDED/FAILED with Resume/Cancel where allowed. **Can be redesigned? YES; NO for reattach/reconcile semantics.**

### P-24 Optimistic concurrency & stale-edit recovery
- **Behaviour:** writes carry the version read; a stale version (412/409) says "This draft changed… Reload before saving" and **keeps the person's edits visible** where possible; no silent overwrite. **NO.**

### P-25 Unsaved-edits guard
- **Behaviour:** panels with unsaved changes disable the checkpoint confirm ("Save or cancel the changes to X first.") and block leaving the station with a named message. **Can be redesigned? YES; keep the guard.**

### P-26 Detail drawer / viewer for catalogue items
- **Behaviour:** names in lists are the control; opening shows the full item: Skill (`SKILL.md` + companion files, version, provenance, licence), EVAL (threshold, gate vs measured, how executed, rubric/code), DoD criterion (bar, how the number is produced, evidence path/scale), DSL (concepts/rules graph, statistics), documents (`worker-intent.md` — in a modal because it is long, read once and dismissed). **Can be redesigned? YES.**

### P-27 "Declared — not enforced yet" marker
- **Behaviour:** beside a composed setting that no running service reads, say what is true instead ("◌ Declared — not enforced yet"); same words on Compose and Learning pages. Also: sharing "declared, not active"; Sentinel "recorded, not applied"; shadow "Would …". **NO (honesty rule).**

### P-28 Severity ladder
- Observe · Warn · Restrict · Stop (+ Grant). Shape + word; "Nothing open" is never "safe". A grant reads *applied* only when it was. **Can be redesigned? YES (shape); keep words and the never-safe rule.**

### P-29 Worker diagram (anatomy)
- A diagram of a Worker's parts (bounded context → Worker intent → Brain (Skills, DSL, EVALs, GBrain, Sentinel) → Definition of Done → Autonomy → Runtime/Package) used as navigation in Compose and Worker detail, and as a thumbnail in the Registry (only what the snapshot carries; the rest labelled, not filled). **Can be redesigned? YES.** Must keep: the six-part decomposition (CONFIRMED naming) and that it is clickable to the relevant detail/edit.

### P-30 Permission-gated visibility
- Entries the account cannot use are **not rendered** (not disabled) — a menu item that leads to a refusal teaches distrust; while permissions are unread, gated entries stay hidden. The server is the authority on every request. **Can be redesigned? YES; keep hide-not-disable and server authority.**

### P-31 Two-person approval flow
- Knowledge edits: author proposes → automated gates → **a different person** approves → live next run. UI states every step and who. **NO.**

### P-32 Hash-chained decision records
- Sentinel decisions show hash, previous hash, policy/input digests and chain status (verified / not verified at / not checked); the full digest on demand. **Can be redesigned? YES; keep integrity disclosure.**

### P-33 Confidential-data redaction receipts
- Counts per detector and filter version only — **never a redacted value**; typed placeholders in documents; "Withheld by the platform / by the confidential-data filter". **NO.**
