# design.md — AI Worker Platform, "Compose an AI Worker" (v2 UI redesign screenshots)

Extracted from six pasted screenshots of the Compose flow (Steps 1, 1 filled, 3, 4, 4 scrolled, 6) of
the v2 UI redesign. Colours were sampled from pixels with Pillow (region mode, darkest and most-saturated
pixel per region). The screenshots are browser captures at roughly 1.25 device px per CSS px (inferred
from glyph heights and sidebar width). **All CSS sizes are converted at that ratio and are `~approx`;
the colours are measured.**
Light theme. White navigation rail on a near-white page; white cards with hairline borders. One saturated
navy panel per screen. Calm and airy: generous padding, few borders, the content column carries a single
task at a time.

## 1. Corrections to the source
No swatch or token sheet was supplied. Measurement-driven adjustments, made for accessibility:
- **Primary blue.** Measured `#1A74E8`, which gives white text 4.46:1 and just fails AA for 15px button
  labels. The token is `#1A70E2` (4.7:1), visually identical.
- **Upcoming-step text.** Measured `#A2A2A2` (labels) and `#BEBEBE` (sub-labels), at 2.6:1 and 1.9:1 on
  white. These carry information, so the token is `#74777A` (4.6:1). Dimming comes from the grey number
  disc and the absence of the tint, not from illegible text.
- **Success green.** Measured `#218D40` (4.2:1 on white). It is fine for icons; text uses `#1C7F3A` (5.0:1).

## 2. shadcn/ui theme variables
```css
:root {
  --background: #F8FAFB;            /* page, measured */
  --foreground: #17191A;            /* headings, measured */
  --card: #FFFFFF;  --card-foreground: #17191A;
  --popover: #FFFFFF; --popover-foreground: #17191A;

  --primary: #1A70E2;               /* measured #1A74E8, AA-adjusted (§1) */
  --primary-foreground: #FFFFFF;
  --primary-soft: #E9F0FE;          /* selected surface: active step, chosen option, icon tile — measured */
  --primary-strong: #1E56A3;        /* blue text on the soft tint (active step label, STEP overline) — measured */

  --secondary: #F2F4F5;  --secondary-foreground: #17191A;   /* measured: nav active, tracks, quiet tiles */
  --muted: #F2F4F5;      --muted-foreground: #5D5F60;       /* measured */
  --subtle-foreground: #74777A;     /* upcoming / disabled text (§1) */
  --accent: #F2F4F5;     --accent-foreground: #17191A;      /* menu hover, nav active (grey, not blue) */

  --identity: #164EA6;              /* the Worker panel, measured */
  --identity-foreground: #FFFFFF;
  --brand: #1A70E2;  --brand-foreground: #FFFFFF;           /* progress fills, step discs, logo */

  --success: #1C7F3A;  --success-foreground: #FFFFFF;       /* icon fill measured #218D40 */
  --warning: #A2600D;  --warning-foreground: #FFFFFF;       /* measured on the EVALs count */
  --info: #1E56A3;     --info-foreground: #FFFFFF;
  --destructive: #C62828; --destructive-foreground: #FFFFFF; /* ~approx, not in reference */

  --border: #E5E7E8;   /* card edge, measured #E1E3E5–#E5E7E7 */
  --input: #E5E5E5;    /* field border, measured */
  --ring: #1A70E2;

  --chart-1: #164EA6; --chart-2: #1A70E2; --chart-3: #775EAD; --chart-4: #8A8D8F; --chart-5: #C9CBCC;

  --radius: 0.375rem;  /* control tier, 6px */

  --sidebar: #FFFFFF; --sidebar-foreground: #1A1A1A; --sidebar-muted: #5F6163;
  --sidebar-primary: #1A70E2; --sidebar-primary-foreground: #FFFFFF;
  --sidebar-accent: #F2F4F5; --sidebar-accent-foreground: #17191A;
  --sidebar-border: #E5E5E5; --sidebar-ring: #1A70E2;
}
```
Brain-part hues, used only to tell the kinds of knowledge apart, never as status:
`--part-skill: #1B6DCC`, `--part-language: #775EAD` (tint `#EFEAFC`), `--part-eval: #A2600D`. All three are measured.

## 3. Color roles
| Colour | Job (one each) |
| --- | --- |
| `#1A70E2` primary | The single action blue: primary buttons, the active step disc, checked boxes, selected radios, progress fills, the nav count badge, focus rings. Never decorative. |
| `#E9F0FE` primary-soft | "This one is chosen / you are here": the active stepper cell, a selected option card or level row, a selected segmented button, the page-header icon tile. |
| `#1E56A3` primary-strong | Blue text sitting on a tint, or the small blue "STEP n OF 6" overline. |
| `#164EA6` identity | The Worker being composed: the one navy panel per screen. Nothing else is navy. |
| `#1C7F3A` / `#218D40` success | A confirmed part only: a filled green disc with a white check (stepper, panel rows). |
| `#A2600D` warning | Needs a person, or stale. Also the EVAL part hue. |
| `#775EAD` purple | The DSL part hue only. |
| `#F2F4F5` muted | Quiet surfaces: nav active row, progress track, icon tiles in lists, summary blocks, inactive level discs. |
| `#F8F8F8` | Nested "live work" sub-card inside a card (the assembly panel). Use `bg-muted/50`. |
| `#17191A` / `#5D5F60` / `#74777A` | Headings · secondary text · upcoming or disabled text. |
| `#E5E7E8` | Every hairline: card edge, list dividers, stepper frame. |

The logic: **blue means "act / chosen", navy means "the Worker", green means "confirmed".** A blue that is
not one of those is a bug.

## 4. Hierarchy mechanism
Hierarchy comes from **position, then one navy object, then the blue tint**. The task runs down a wide
left column. The single navy Worker panel sits beside it and is the only saturated mass. Within the
column, the chosen thing is marked by the soft blue fill, never by size. Headings step down by size and
weight. Colour is never used for heading levels: every heading is near-black, and only the tiny STEP
overline is blue.

## 5. Typography
- **Sans:** Roboto (variable, `@fontsource-variable/roboto`); the screenshots match Roboto's glyphs.
  Weights in use: 400 body, 500 labels and nav, 600 headings and buttons.
- **Mono:** Roboto Mono (`@fontsource-variable/roboto-mono`), reserved for identifiers (SPIFFE IDs,
  digests, run refs) and event streams. Never for numbers in prose.
- **Scale** (tokens in `index.css`, all ~approx):

| Token | Size / line | Weight | Used for |
| --- | --- | --- | --- |
| `text-page` | 30 / 36, −0.02em | 600 | The one H1 ("Compose an AI Worker") |
| `text-section` | 20 / 28, −0.01em | 600 | Card titles ("Define the Worker…", "Worker Brain") |
| `text-item` | 15 / 22 | 500 | Question headings (add `font-semibold`), list titles, nav labels |
| `text-body` | 15 / 24 | 400 | Prose and explanations |
| `text-meta` | 13 / 20 | 400 | Sub-labels, captions, nav questions, row summaries |
| `text-overline` | 12 / 16, +0.08em, uppercase | 500 | "STEP 1 OF 6", "IDENTITY", "PACKAGE PROGRESS" |

The Worker-panel title is 22px semibold on navy. Counts in a row of figures are 22px semibold and
coloured by part hue.

## 6. Radius & spacing
- **Shell:** edge-to-edge. A white fixed rail of 272px (70px when collapsed, icons only) with a hairline
  right border, then the page on `#F8FAFB`. There is no outer frame.
- **Radius tiers:** cards, panels, the stepper frame and the option cards are **8px** (`--radius-xl`).
  Buttons, inputs, selects, checkboxes, segmented buttons and the inner list blocks are **6px**
  (`--radius`). Pills, step discs, status discs and the panel's icon circle are **full**.
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
2. **The Worker panel (right column, sticky).** A card whose header is navy `identity`:
   - A 48px circle in white at 20% holding `Fingerprint`, and a top-right pill in white at 20%
     ("Assigning", "Ready to issue", "Revision 5"). A pill may carry a 6px status dot.
   - The overline "WORKER IDENTITY" in white at 75%, then the 22px title.
   - During declaration the navy continues down as label/value rows, separated by white-at-15% hairlines,
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
  - **Panel pills** (the identity state) are white at 20% on navy, with an optional coloured dot.
  - **Elsewhere in the product,** the tinted 10% pill with icon and word (`StatusBadge`) remains the
    treatment, plus a dot-and-word form in dense lists.
- **Delta / trend:** not shown in the reference. The product keeps coloured text with a 12px arrow
  (`Delta`), shown only when a comparison was observed.
- **Icon containers:**
  - **Page header:** a 48px `primary-soft` rounded-square (8px) with a primary 22px icon.
  - **List rows in the panel:** a 40px `muted` rounded-square with a foreground 18px icon.
  - **Inline knowledge rows:** a 20px tinted rounded-square in the part's hue.
  - **On navy:** a circle in white at 20%.
- **List termination:** the lists are short and end with a count line ("9 items selected"). Long product
  lists keep the existing "Show more" / pager.
- **Buttons:**
  - **Primary:** filled blue, 6px radius, 15px semibold, 44px tall in step footers.
  - **Disabled primary:** the same blue at 40% opacity.
  - **Secondary:** a white outline with a hairline border ("Back", "Start over").
  - **Footer layout:** Back is on the left and the primary action on the right.
- **Navigation rail:**
  - A white rail with the "AI WORKER / PLATFORM" wordmark and a collapse button at the top, one flat list without section labels, and only User management at the bottom. There is no search box and no activity tracker.
  - **Order:** Dashboard, Compose, Packaging, Customer delivery, Registry, Knowledge, Learning, Sentinel, Harnesses.
  - **Each item:** a 20px icon, then a 15px semibold label over a 13px muted question ("What Worker do I want to create?").
  - **Active item:** a grey `sidebar-accent` fill, a 3px primary bar on the left edge and a blue icon. **Hover:** a lighter grey fill.
  - **Collapsed:** a 64px icon rail with tooltips (the button or ⌘B); on phones it is an off-canvas sheet.
  - **Icons:** Dashboard `Gauge`, Registry `Users`, Compose `Hammer`, Packaging `Package`, Customer delivery `Send`, Knowledge `Brain`, Learning `BrainCircuit`, Sentinel `ShieldCheck`, Harnesses `Boxes`, User management `KeyRound`.
- **Worker panel detail level:** one line per part. Show only the counts that define it ("5 Skills · 4 DSLs · 9 EVALs", "5 criteria, all gating", "Level 3 · Bounded"); everything else stays in the step itself.
- **Icon set:** lucide-react, 1.75 stroke, rounded caps.

  | Reference icon | lucide-react |
  | --- | --- |
  | Header compose | `Wrench` |
  | Nav: Dashboard | `Gauge` |
  | Nav: Compose | `Wrench` |
  | Nav: Registry | `Users` |
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
  - the label text on navy uses white at 75%, not 60%, which keeps 4.7:1;
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
