# design.md — AI Worker Platform, "Ink & Ember" (2026-10 restyle of the v2 redesign)

The layout, components and Compose arrangement still follow the v2 Compose screenshots (§7, Composition
Fidelity). The **visual skin was deliberately redrawn** on 2026-10-13, at the product owner's request, to
move away from a plain white-and-blue SaaS look. The colours are chosen, not sampled, and every pair used
for text was checked for AA contrast.

Light theme. A dark **ink** rail frames every page. The page is warm stone paper with white sheets on it.
**Viridian** is the single action colour. **Ember** marks "you are here" and nothing else. Page titles and
headline figures are set in a soft serif (Fraunces); everything else is in Geist. The result is calm and
editorial: few borders and generous air, with one dark mass (the rail) and one saturated panel (the
Worker) per screen.

## 1. Corrections to the source
- The v2 measurements (blue `#1A70E2`, navy `#164EA6`, Roboto) are retired. The geometry, spacing and
  component anatomy measured from the screenshots still apply.
- **Contrast checks:**
  - White on viridian `#0E6B5E` is 6.9:1.
  - `#5C5F63` on stone `#F5F3EE` is 5.9:1.
  - The rail's `#9A9EA5` on ink `#16191D` is 6.6:1.
  - Ember `#E4572E` is only 3.4:1 on white, so it never carries text. It is used for marks, ticks and
    dots only.

## 2. shadcn/ui theme variables
```css
:root {
  --background: #F5F3EE;            /* warm stone paper */
  --foreground: #1A1C1F;            /* ink */
  --card: #FFFFFF;  --card-foreground: #1A1C1F;
  --popover: #FFFFFF; --popover-foreground: #1A1C1F;

  --primary: #0E6B5E;               /* viridian: the one action colour */
  --primary-foreground: #FFFFFF;
  --primary-soft: #E2F0EB;          /* chosen / you are here surfaces, count chips */
  --primary-strong: #0A4F45;        /* viridian text on the soft tint */

  --secondary: #EFECE5;  --secondary-foreground: #1A1C1F;
  --muted: #EFECE5;      --muted-foreground: #5C5F63;
  --subtle-foreground: #75787C;
  --accent: #EFECE5;     --accent-foreground: #1A1C1F;

  --ember: #E4572E;  --ember-soft: #FCE9E2;   /* "you are here" marks only, never text */

  --identity: #123B35;              /* the Worker panel: deep viridian */
  --identity-foreground: #FFFFFF;
  --brand: #0E6B5E;  --brand-foreground: #FFFFFF;

  --success: #1D7A45;  --warning: #9A5B0C;  --info: #2F5D8A;  --destructive: #B42318;   /* all with white foregrounds */

  --border: #E3DFD6;  --input: #DCD8CE;  --ring: #0E6B5E;  --canvas-line: #E7E3DA;

  --chart-1: #0E6B5E; --chart-2: #E4572E; --chart-3: #6E559F; --chart-4: #8C8A84; --chart-5: #CFCBC1;

  --radius: 0.5rem;   /* control tier, 8px; cards are --radius-xl 12px */

  --sidebar: #16191D; --sidebar-foreground: #ECE9E2; --sidebar-muted: #9A9EA5;
  --sidebar-primary: #0E6B5E; --sidebar-primary-foreground: #FFFFFF;
  --sidebar-accent: #24282E; --sidebar-accent-foreground: #F6F4EF;
  --sidebar-border: #262A30; --sidebar-ring: #5FB7A6;
}
```
Elevation tokens (`@theme`):
- `--shadow-raised`: the one lifted sheet, such as the current pipeline stage.
- `--shadow-lift`: the rail's active slab.

Cards otherwise sit flat on stone with a hairline border.
Brain-part hues, used only to tell the kinds of knowledge apart, never as status:
`--part-skill: #2F5D8A`, `--part-language: #6E559F` (tint `#EEEAF7`), `--part-eval: #9A5B0C`.

## 3. Color roles
| Colour | Job (one each) |
| --- | --- |
| `#0E6B5E` primary (viridian) | **Actions and chosen states.** Primary buttons, checked boxes and selected radios, progress fills and focus rings. Also the serving share of the Workers bar. Never decorative. |
| `#E2F0EB` primary-soft | **"This one is chosen."** The active stepper cell, a selected option and the current stage's count chip. |
| `#0A4F45` primary-strong | **Viridian text on the soft tint.** |
| `#E4572E` ember | **"You are here" marks.** The active rail tick, the current pipeline stage's top rule and number, the wordmark glyph and the phone bar's dot. Never a fill behind text, never a status. |
| `#123B35` identity | **The Worker being composed.** One deep viridian panel per screen. |
| `#16191D` ink (sidebar) | **The navigation rail and the phone top bar.** Its active item is a lifted `#24282E` slab. |
| `#F5F3EE` stone / `#FFFFFF` | **Surfaces.** The page is stone; content sheets are white. |
| `#1D7A45` success | **Confirmed or met.** |
| `#9A5B0C` warning | **Needs a person, or stale.** Also the EVAL part hue. |
| `#B42318` destructive | **Not met, or failed.** |
| `#1A1C1F` / `#5C5F63` / `#75787C` | **Text:** headings, secondary text, upcoming or disabled text. |
| `#E3DFD6` | **Every hairline.** Card edges, list dividers and the KPI band's 1px gutters. |

The logic: **viridian means "act / chosen", ember means "you are here", deep viridian means "the Worker",
green means "confirmed".** Ember on anything clickable that is not the current location is a bug.

## 4. Hierarchy mechanism
Hierarchy comes from **position, then the ink rail, then one deep-viridian object, then the soft tint**. The task runs down a wide
left column. The single deep-viridian Worker panel sits beside it and is the only saturated mass. Within the
column, the chosen thing is marked by the soft blue fill, never by size. Headings step down by size and
weight. Colour is never used for heading levels: every heading is near-black, and only the tiny STEP
overline is blue.

## 5. Typography
- **Display: Fraunces** (variable, `@fontsource-variable/fraunces`, SOFT 50).
  - Used only for the page H1 (all `h1` elements get it from the base layer), headline figures (KPI
    numerals and the Outcomes "20 of 46"), and the wordmark.
  - Weight 400–500, never bold. Use the `font-display` class.
- **Sans: Geist** (variable, `@fontsource-variable/geist`).
  - Everything else: 400 body, 500 labels and nav, 600 emphasis and buttons.
  - `--font-heading` is Geist too, so card, sheet and dialog titles stay sans.
- **Mono: Geist Mono**, reserved for:
  - identifiers (SPIFFE IDs, digests, run references);
  - the pipeline stage numbers ("01 02 03").
- **Scale** (tokens in `index.css`, all ~approx):

| Token | Size / line | Weight | Used for |
| --- | --- | --- | --- |
| `text-page` | 32 / 40, −0.02em | 500, Fraunces | The one H1 ("Registry", "Compose an AI Worker") |
| `text-section` | 20 / 28, −0.01em | 600 | Card titles ("Define the Worker…", "Worker Brain") |
| `text-item` | 15 / 22 | 500 | Question headings (add `font-semibold`), list titles, nav labels |
| `text-body` | 15 / 24 | 400 | Prose and explanations |
| `text-meta` | 13 / 20 | 400 | Sub-labels, captions, nav questions, row summaries |
| `text-overline` | 12 / 16, +0.08em, uppercase | 500 | "STEP 1 OF 6", "IDENTITY", "PACKAGE PROGRESS" |

The Worker-panel title is 22px semibold on deep viridian. Counts in a row of figures are 22px semibold and
coloured by part hue.

## 6. Radius & spacing
- **Shell:** edge-to-edge. A fixed ink rail of 312px (64px when collapsed, icons only), then the page
  on stone. There is no outer frame. On phones, a 56px ink top bar holds the menu button.
- **Radius tiers:**
  - **12px** (`--radius-xl`): cards, panels, the KPI band, the stepper frame and option cards.
  - **8px** (`--radius`): buttons, inputs, selects, segmented controls, stage tabs and rail items.
  - **Full:** pills, step discs and status discs.
- **Spacing scale (CSS px):**
  - 4: the gap between a label and its sub-label.
  - 8: icon to label; pill internal padding.
  - 12: list-row vertical padding; the gap between option cards.
  - 16: the stepper cell's horizontal padding.
  - 20: the column gap between the task card and the Worker panel; panel row padding.
  - 24: card padding and the gap between questions inside a card.
  - 32: the page gutter and the gap from header to stepper to body.
  - 48: the page's top padding.
- **Density:** airy. One task card at a time, with about 24px of air around every group.

## 7. Signature components
1. **Horizontal stepper (top of Compose).** One white 8px-radius frame with a hairline border, split into
   equal cells.
   - Each cell holds a 28px disc and a two-line label: the name is 14px semibold, the sub-label 13px
     (e.g. "Identity · domain · scope"), truncated with an ellipsis.
   - **Done:** a green disc with a white `Check`, and normal text.
   - **Current:** a `primary-soft` cell fill, a 2px primary underline across the cell, a primary disc
     with a white number, and the label in `primary-strong`.
   - **Upcoming:** a light grey disc with a grey number, and `subtle-foreground` text.
   - Done and current cells are buttons; upcoming cells are inert.
2. **The Worker panel (right column, sticky).** A card whose header is deep viridian `identity`:
   - A 48px circle in white at 20% holding `Fingerprint`, and a top-right pill in white at 20%
     ("Assigning", "Ready to issue", "Revision 5"). A pill may carry a 6px status dot.
   - The overline "WORKER IDENTITY" in white at 75%, then the 22px title.
   - During declaration the deep viridian continues down as label/value rows, separated by white-at-15% hairlines,
     with the identifier in mono.
   - Once composing, the body turns white:
     - a collapsible "Identity detail";
     - "PACKAGE PROGRESS · n of N confirmed" with a 6px bar;
     - one row per part, each with a 40px muted icon tile, a title, a one-line summary, and a trailing
       status: a green check disc, a spinner while assembling, a grey ring when not started, or a
       warning triangle.
3. **Option card.** A full-width bordered row (8px radius, 16–20px padding) with a radio or checkbox, an
   optional 16px icon, a 15px semibold title and a 14px muted detail. When selected, it takes a
   `primary-soft` fill and a 1.5px primary border.

## 8. Recurring micro-patterns
- **Status indicator:**
  - **A part's state is a disc, not a pill:** a green filled disc with a check, a primary spinner, a grey
    outline ring, or an amber `TriangleAlert`.
  - **Panel pills** (the identity state) are white at 20% on deep viridian, with an optional coloured dot.
  - **Elsewhere in the product,** the tinted 10% pill with icon and word (`StatusBadge`) remains the
    treatment, plus a dot-and-word form in dense lists.
- **Delta / trend:** not shown in the reference. The product keeps coloured text with a 12px arrow
  (`Delta`), shown only when a comparison was observed.
- **Icon containers:**
  - **Page header:** a 48px `primary-soft` rounded-square (12px) with a viridian 22px icon.
  - **List rows in the panel:** a 40px `muted` rounded-square with a foreground 18px icon.
  - **Inline knowledge rows:** a 20px tinted rounded-square in the part's hue.
  - **On deep viridian:** a circle in white at 20%.
- **List termination:** the lists are short and end with a count line ("9 items selected"). Long product
  lists keep the existing "Show more" / pager.
- **Buttons:**
  - **Primary:** filled viridian, 8px radius, 15px semibold, 44px tall in step footers.
  - **Disabled primary:** the same viridian at 40% opacity.
  - **Secondary:** a white outline with a hairline border ("Back", "Start over").
  - **Footer layout:** Back is on the left and the primary action on the right.
- **Navigation rail:**
  - **Rail:** ink. At the top sit the wordmark (a two-slab ember-and-teal glyph, "AI Worker" in Fraunces
    and "PLATFORM · TCS" tracked caps) and the collapse button. Below is one flat list without section
    labels. Only User management sits at the bottom.
  - **Order:** Registry, Knowledge, Learning, Sentinel, Harnesses.
    - Registry owns `/workers`, `/packaging`, `/customer-delivery`, `/compose` and `/dashboard`, so it
      stays active on all of them.
  - **Each item:** an 18px icon, then a 15px medium label over a 13px `sidebar-muted` question that may
    wrap.
  - **Active item:** a lifted `sidebar-accent` slab (`shadow-lift`), a 3px ember tick just outside its
    left edge, and a light icon. **Hover:** the slab at 60%.
  - **Collapsed:** icons only, with tooltips. On phones the rail is an off-canvas sheet.
  - **Icons:** Registry `Store`, Knowledge `Brain`, Learning `BrainCircuit`, Sentinel `ShieldCheck`,
    Harnesses `Boxes`, User management `KeyRound`. Outcomes uses `Gauge` in the command menu.
- **Registry (the Worker marketplace):**
  - **Header:** a "WORKER MARKETPLACE" overline, the Fraunces H1 and one sentence of description, with
    "Compose a Worker" (primary, large) on the right.
  - **KPI band:** one 12px card split into four cells by 1px `border`-coloured gutters (two by two on
    phones, four across from `xl`). Each cell has:
    - an overline;
    - a Fraunces numeral (40px, 32px on phones) with an optional unit;
    - an optional 6px bar (the Workers serving/attention split, or the DoD `VerdictBar`);
    - a one-line caption.
    Every cell links to its tab, or to Outcomes. Unknown values read "Not available", never 0.
  - **Stage tabs:** the pipeline as three route links ("01 Workers → 02 Packaging → 03 Customer
    delivery") joined by dashed rules. Each tab has a mono number, a label, a hint and a count chip.
    - **Current stage:** a white sheet with `shadow-raised`, a 2px ember top rule, an ember number and a
      `primary-soft` count chip.
    - **Other stages:** transparent until hovered.
  - **A tab's own sections** (To package / Packaged / Deployed) use `SectionNav variant="pills"`: a
    muted segmented control, visibly one level below the stages.
- **Worker panel detail level:** one line per part. Show only the counts that define it ("5 Skills · 4 DSLs · 9 EVALs", "5 criteria, all gating", "Level 3 · Bounded"); everything else stays in the step itself.
- **Icon set:** lucide-react, 1.75 stroke, rounded caps.

  | Reference icon | lucide-react |
  | --- | --- |
  | Header compose | `Wrench` |
  | Nav: Registry | `Store` |
  | Nav: Knowledge | `LibraryBig` |
  | Nav: Learning | `BrainCog` |
  | Nav: Sentinel | `ShieldCheck` |
  | Nav: User management | `UserCog` |
  | Collapse | `PanelLeftClose` / `PanelLeftOpen` |
  | Identity | `Fingerprint` |
  | Select chevron | `ChevronDown` |
  | Collapsible chevron | `ChevronRight` |
  | Context options | `FileCode2`, `PencilLine`, `Workflow` |
  | Worker intent | `FileText` |
  | Brain | `Brain` |
  | Knowledge & growth | `TrendingUp` |
  | Definition of Done | `ClipboardCheck` |
  | Autonomy | `ShieldCheck` |
  | Skill row | `FileCode2` |
  | DSL row | `Braces` |
  | EVAL row | `ClipboardCheck` |
  | Folder (narrowed) | `FolderOpen` |
  | Done | `Check` inside a disc |
  | Assembling | `Loader2` / `Spinner` |
  | Evolution path | `ArrowDown` between states |

## 9. What the reference doesn't cover
- **States:** empty, error and loading. The product keeps its existing `EmptyState`, `ErrorState` and
  skeletons, and the Worker panel shows a skeleton while the draft loads.
- **Phone layout:** not shown. On narrow screens:
  - the stepper becomes a horizontally scrolling strip with the current cell scrolled into view;
  - the Worker panel moves below the task card;
  - footer buttons stack full-width.
- **Dark mode:** not shown and not built.
- **Scale:** the panel lists five or six parts. Longer lists inside a part (111 Skills) are capped, with
  "Show more".
- **Accessibility:**
  - the faint step text and the 4.46:1 blue were corrected (§1);
  - the label text on deep viridian uses white at 75%, not 60%, which keeps 4.7:1;
  - status is never colour alone, since every disc has an icon and a screen-reader word;
  - the stepper exposes `aria-current="step"`.
- **Product honesty rules are the product's, not the design's,** and still apply: unknown is never zero;
  every average sits beside its coverage; proposals are labelled "Proposed" until confirmed; mock writes
  say that nothing was sent.

## Composition Fidelity
For Compose, preserve the reference's arrangement: the page header with an icon tile and a right-aligned
"Start over" (here "Saved drafts"); a full-width stepper; then a two-column body, with the task card at
roughly 2/3 width beside the sticky Worker panel at roughly 1/3 width (about 360px), top-aligned with a
20px gap. The task card holds one step: the blue overline, the title and the description, then the
questions, then the footer actions (Back on the left, the primary action on the right).
