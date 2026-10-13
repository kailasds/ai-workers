# design.md — AI Worker Platform, after the Mercury design language

Source: the Mercury DESIGN.md in VoltAgent/awesome-design-md (MIT, `design-md/mercury/DESIGN.md`). It is
a reverse-engineered analysis of mercury.com's homepage, pricing page and product page. Colours, the type
scale, the radius scale and the spacing come from that spec. Values marked `~derived` are this project's
extensions for an operations console (status colours, hairlines, tints), and are checked for AA.

Light theme: day pages bracketed by night. Content sits on a near-white canvas, the navigation rail is
Mercury's ink-violet night, and one night band per screen carries the headline figures. The mood is calm,
precise and private-bank: light type weights, one saturated button, everything else quiet. Density is
medium, since this is a console rather than a marketing page.

## 1. Corrections to the source
- **Font substitute.** The spec suggests Inter for the proprietary arcadia. This kit bans Inter as a
  default, so the substitute is **Hanken Grotesk** (variable 100–900), an open grotesk with the same open
  fit. Its digits are tabular by default; this was verified in the font file (one advance width across
  0–9). It has no `tnum` feature, so stable figures come from the font itself, not from `tabular-nums`.
- **Weight 360 body.** This is too faint for a dense console at 15px, so body is 400. UI labels are 440:
  Mercury's 420, nudged for Hanken's lighter colour. Headings are 480. Nothing is heavier than 500.
- **Slate `#70707D` on lavender is 4.18:1.** It fails AA for text there. On lavender, use `ink-secondary`.
- **"No status colours in chrome."** Mercury keeps green and orange out of its interface. This product has
  to show met / not met / stale, so status colours exist but appear **only inside data** (badges, verdict
  bars, run results), never on navigation, buttons or surfaces.

## 2. shadcn/ui theme variables
```css
:root {
  --background: #FBFCFD;  --foreground: #28253B;            /* canvas · ink */
  --card: #FFFFFF;  --card-foreground: #28253B;
  --popover: #FFFFFF; --popover-foreground: #28253B;

  --primary: #5266EB;  --primary-foreground: #FFFFFF;       /* Mercury Indigo, 4.7:1 */
  --primary-hover: #4458DD;                                  /* ~derived */
  --primary-soft: #EEF0FD;                                   /* indigo 10% on white, ~derived */
  --primary-strong: #3D4FD1;                                 /* indigo text on the tint, 5.7:1, ~derived */

  --lavender: #EDECFB;                                       /* Mercury lavender */
  --secondary: #EDECFB;  --secondary-foreground: #28253B;
  --muted: #F3F3F8;      --muted-foreground: #554E7B;        /* ink-secondary, 7.4:1 */
  --subtle-foreground: #70707D;                              /* slate */
  --accent: #EDECFB;     --accent-foreground: #28253B;

  --control: rgb(112 115 147 / 0.10);  --control-border: rgb(112 115 147 / 0.22);   /* outline pill */

  --night: #171721;  --night-raised: #1E1E2A;  --on-dark: #EDEDF3;  --fog: #C3C3CC;  --periwinkle: #9CB4E8;
  --identity: #1E1E2A;  --identity-foreground: #EDEDF3;
  --brand: #5266EB;  --brand-foreground: #FFFFFF;

  --success: #1E7F55;  --warning: #A15C07;  --info: #3D4FD1;  --destructive: #C2364A;   /* ~derived, white fg */

  --border: #E6E6EE;  --input: #DCDCE6;  --ring: #5266EB;    /* fog lifted toward white, ~derived */

  --chart-1: #5266EB; --chart-2: #9CB4E8; --chart-3: #554E7B; --chart-4: #70707D; --chart-5: #C3C3CC;

  --radius: 0.5rem;   /* control tier 8px; cards --radius-xl 12px; panels --radius-panel 16px */

  --sidebar: #171721; --sidebar-foreground: #EDEDF3; --sidebar-muted: #A3A3B2;
  --sidebar-primary: #5266EB; --sidebar-primary-foreground: #FFFFFF;
  --sidebar-accent: rgb(175 178 206 / 0.14); --sidebar-accent-foreground: #FFFFFF;   /* glass pill */
  --sidebar-border: #262635; --sidebar-ring: #9CB4E8;
}
```
Part hues, used only to tell the kinds of knowledge apart:
- `--part-skill: #3D4FD1`
- `--part-language: #6B4FB8` (tint `#EFEAFB`)
- `--part-eval: #A15C07`

## 3. Color roles
| Colour | Job (one each) |
| --- | --- |
| `#5266EB` indigo | **The single most important action on a view.** One solid indigo button per group. Also checked boxes, toggles, progress fills and focus rings. |
| `#EEF0FD` indigo 10% | **Secondary action fill** (Mercury `button-tint-light`). Also "this one is chosen": the current stage, a selected option, an active count chip. |
| `#3D4FD1` primary-strong | **Indigo text on the tint**, and the info tone. |
| `#EDECFB` lavender | **Quiet filled surfaces.** A segmented control's track, hover on rows, summary blocks. |
| grey-violet 10% + 22% border | **Outline buttons.** Mercury `button-outline-light`. Never a hard outline on white. |
| `#171721` night | **Frame.** The rail and the phone top bar. |
| `#1E1E2A` night-raised | **The one dark punctuation in the content per screen.** The Registry's KPI band, the Worker panel in Compose. |
| `#EDEDF3` / `#C3C3CC` | **Text on night:** primary and secondary. |
| `#9CB4E8` periwinkle | **The active mark on night.** The active rail icon and the indicator bar. |
| `#28253B` / `#554E7B` / `#70707D` | **Text on day:** ink (headings and body), ink-secondary (descriptions), slate (meta and placeholders). |
| `#E6E6EE` | **Every hairline on day.** |
| `#1E7F55` / `#A15C07` / `#C2364A` | **Status inside data only:** met or confirmed, stale or attention, not met or failed. |

The logic: **indigo means act, night means frame or headline, lavender means quiet surface.** Colour never
marks heading levels, and status never colours the chrome.

## 4. Hierarchy mechanism
Hierarchy comes from **tone first, then size**, never weight.
- **Tone.** A screen has at most one night-raised object in the content (the Registry's KPI band, or
  the Compose Worker panel), and when present it is the first thing the eye lands on. Other screens lead
  with their H1 and first white sheet. Then there is one solid indigo button. Everything
  else is white or lavender.
- **Size.** Headings step down by size only, at weight 480. The page H1 is 32px.
- **Inside a group,** the chosen item takes the indigo tint. It never gets a heavier weight.

## 5. Typography
- **Sans: Hanken Grotesk** (`@fontsource-variable/hanken-grotesk`), substituting Mercury's arcadia /
  arcadiaDisplay.
  - Weights: 400 body, 440 UI (buttons, nav, labels), 480 headings and stats, 500 eyebrows.
  - Tailwind weight tokens are remapped so that `font-medium` = 440, `font-semibold` = 500, and `bold` and
    above are capped at 500.
- **Mono: JetBrains Mono**, reserved for identifiers only: SPIFFE IDs, digests, run refs and the pipeline
  stage numbers. Never for figures in prose.
- **Scale:**

| Token | Size / line | Weight | Tracking | Used for |
| --- | --- | --- | --- | --- |
| `text-stat` | 40 / 1.1 | 480 | 0 | KPI numerals (Mercury `stat`, scaled for a console) |
| `text-page` | 32 / 38 | 480 | +0.01em | The one H1 |
| `text-section` | 20 / 26 | 480 | +0.01em | Card titles |
| `text-item` | 15 / 22 | 440 | 0 | List titles, nav labels, question headings |
| `text-body` | 15 / 22.4 | 400 | 0 | Prose |
| `text-meta` | 13 / 19 | 400 | 0 | Captions, row summaries, nav questions |
| `text-overline` | 12 / 16, uppercase | 500 | +0.06em | Eyebrows ("WORKER MARKETPLACE", "STEP 1 OF 6") |

Headings get a hair of positive tracking, never negative. Uppercase is for eyebrows only.

## 6. Radius & spacing
- **Shell:** edge-to-edge. There is no outer frame.
  - A fixed night rail, 312px wide (64px when collapsed), with no border: its tone separates it.
  - The page runs on the canvas.
  - On phones, a 56px night top bar holds the menu button.
- **Radius tiers (Mercury `rounded.*`):**
  - **Full (pill):** every button, status badges, count chips, segmented-control items.
  - **16px** (`--radius-panel`): the Worker panel, sheets, the KPI band.
  - **12px** (`--radius-xl`): cards, list cards, option cards, the stepper frame, dialogs, stage tabs.
  - **8px** (`--radius`): inputs, selects, textareas, menus, popovers, rail items.
  - **4px:** checkboxes and small tags.
  - **Nested:** inner radius = outer radius − inset (polish.md §1).
- **Spacing scale (Mercury, 8px base):**
  - 4: label to sub-label.
  - 8: icon to label, chip gaps.
  - 12: row vertical padding, gaps between controls.
  - 16: card internal gaps, the phone page gutter.
  - 20: button side padding, row horizontal padding.
  - 24: card padding, gaps between stacked blocks.
  - 32: page gutter (desktop) and gaps between major sections.
  - 40: empty-state padding.
- **Elevation:** tonal.
  - Sheets are white on the canvas with a 1px `border` hairline and `shadow-soft`, Mercury's hair-thin
    "soft stack".
  - There are no other shadows. Popovers and dialogs use the same soft stack.
- **Density:** medium. Mercury's marketing air is reduced to console rhythm.

## 7. Signature components
1. **Night stat band (Registry KPI row).**
   - One night-raised sheet (16px radius, 24px padding).
   - Four cells, each with:
     - a `fog` eyebrow;
     - an `on-dark` 40px/480 numeral with an optional `fog` unit;
     - an optional 4px bar;
     - a `fog` caption.
   - Cells are divided by 1px `white/8%` rules, and each cell is a link: hover lifts it to `white/4%`
     instantly. The cells sit 4-up from `xl` and 2-up below.
   - This is Mercury's `stat-block` row, the screen's dark punctuation.
2. **The Worker panel (Compose, right column, sticky).** It sits on night-raised with `on-dark` text.
   - **Icon tile:** the round icon tile is white at 10%.
   - **Pills:** the state pill is a glass pill (white 12% fill, 1px white 20% border).
   - **Body:** once composing, the body turns white, keeping the rows as before.
3. **Pipeline stage tabs.** Three route links joined by 1px `border` rules ("01 Workers → 02 Packaging →
   03 Customer delivery"). Each tab has a mono number, a label, a hint and a count chip.
   - **Current tab:** a white 12px sheet with `shadow-soft`, an indigo number and an indigo-tint count chip.
   - **Others:** transparent, turning lavender on hover.
   - A tab's own sections sit below it as a lavender segmented control (`SectionNav variant="pills"`).

## 8. Recurring micro-patterns
- **Buttons (Mercury pills):**
  - **Primary:** solid indigo, white 440 label. Height 40px with 20px side padding, or 32px small with 16px
    padding. At most one solid indigo per group.
  - **Secondary:** indigo 10% fill with an ink label.
  - **Outline:** grey-violet 10% fill, a 1px 22% border and an ink label.
  - **Ghost:** transparent, with the grey-violet 10% fill on hover.
  - **Destructive:** raspberry 10% fill with a raspberry label.
  - **States:** hover is instant (no transition); disabled is 50% opacity.
- **Status indicator:** a filled tint pill (10% of the tone) with a leading 12px icon and a word
  (`StatusBadge`). Never a bare dot.
- **Delta / trend:** coloured text with a 12px arrow (`Delta`), shown only when a comparison was observed.
- **Count chip:** a pill, `primary-soft` / `primary-strong` when active, `muted` / `muted-foreground`
  otherwise.
- **Icon containers:**
  - Page header: a 48px lavender rounded-square (12px) with an indigo 22px icon.
  - List rows: a 40px `muted` 8px square.
  - On night: a white-10% circle.
- **List termination:** "Show n more" inside grouped lists, a numbered pager for long tables.
- **Navigation rail (night):**
  - **Header:** the wordmark (a 32px indigo rounded-square holding a white `Hexagon`, then "AI Worker"
    480 and "Platform" in fog), plus the collapse button.
  - **List:** one flat list, then only User management at the bottom.
  - **Order:** Registry, Knowledge, Learning, Sentinel, Harnesses. Registry owns `/workers`,
    `/packaging`, `/customer-delivery`, `/compose` and `/dashboard`.
  - **Item:** an 18px icon, then a 15px/440 label over a 13px `sidebar-muted` question that may wrap.
  - **Active item:** a glass pill fill, a 3px periwinkle bar on the left edge, and a periwinkle icon.
  - **Hover:** half the glass fill, instant.
- **Icon set:** lucide-react, stroke 2 app-wide.
  - Rail: Registry `Store`, Knowledge `Brain`, Learning `BrainCircuit`, Sentinel `ShieldCheck`,
    Harnesses `Boxes`, User management `KeyRound`, Outcomes `Gauge` (in the command menu).
  - Wordmark `Hexagon`; Compose `Plus` / `Wrench`; collapse `PanelLeftClose` / `PanelLeftOpen`.
  - Identity `Fingerprint`, search `Search`, filters `SlidersHorizontal`, refresh `RefreshCw`, drill-in
    `ArrowUpRight`.
  - Status: `CircleCheck`, `CircleX`, `TriangleAlert`, `Info`, `CircleDashed`.

## 9. What the reference doesn't cover
- **States.** Mercury shows no empty, error or loading states. The product keeps `EmptyState` (40px
  padding on white), `ErrorState` with a retry, and skeletons in `muted`.
- **Data density.** Mercury is a marketing site. Tables, filters and 50-row lists follow this file's
  console spacing, not its 80px section rhythm.
- **Status colours** are this project's extension (§1), checked at 5.0–5.4:1 on white.
- **Dark mode** is not built. Night appears only as frame and punctuation.
- **Accessibility:**
  - every text pair is checked for AA (§1);
  - status is never colour alone (icon and word);
  - the focus ring is a 3px indigo halo at 50%.
- **Product honesty rules still apply:** unknown is never zero, every average sits beside its coverage,
  and mock writes say that nothing was sent.

## Composition Fidelity
The current screens' arrangement is approved and kept:
- **Registry:** header, then the night stat band, then the stage tabs, then the tab body.
- **Compose:** header, then the full-width stepper, then a two-column body (task card about 2/3 width
  beside the sticky Worker panel at about 360px, with a 20px gap).

Restyling changes surfaces, type and controls, never positions or groupings.
