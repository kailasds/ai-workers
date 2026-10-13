# design.md — "eduva" learning-admin dashboard (Peterdraw), three pasted screenshots

Extracted from three pasted screenshots: Student Details (desktop, compact rail, phone), Courses (list,
grid, detail drawer) and Instructors (card grid, instructor detail). Colours were sampled from pixels with
Pillow (the median, darkest and most-saturated pixel per region). The screenshots are mockups shown at
mixed zoom, so **every size and radius here is converted to real CSS px and marked `~approx`; colours are
measured.**

Light theme, **framed**: a white app frame holds the rail, and the content sits in a pale blue-grey panel
inset from it. White cards sit on that panel with no border and no shadow. One **navy** mass per screen
(the profile panel, the active rail item, the primary button) carries the brand; cyan carries data. The
mood is calm and orderly; density is medium-airy.

## 1. Corrections to the source
- **Bright cyan `#009FF4` with white text is 2.89:1.** The reference sets "Contract" chips this way, and it
  fails AA. As a fill holding text, cyan becomes `--brand-strong #0A74B8` (white 5.0:1). Pure cyan stays for
  data only: progress fills, chart series and the logo, which carry no text.
- **Status text is a hair short of AA on its own tint.** Fixes:
  - **Green:** `#2F884A` measured, 4.0:1 on `#E6F8EB`. The token is `#25713D` (5.4:1).
  - **Red:** sampled `#AB565C`/`#E48D93` (antialiased). The token is `#A2333C` (5.6:1 on `#F8E4E5`).
  - **Amber:** the "Draft" text was sampled at `#A98047`. The token is `#8A5A12` (5.1:1 on `#FCEBD3`).
- **Muted text is neutral, not blue.** Labels sample at `#575757`–`#616365` and IDs at `#747474`. The tokens
  are `#5E6266` (5.8:1 on the canvas) and `#6E7276` (4.5:1 on the canvas). All are measured hues.
- No swatch sheet was supplied, so there was nothing else to verify.

## 2. shadcn/ui theme variables
```css
:root {
  --background: #F4F8FB;            /* content panel, measured on all three screens */
  --foreground: #111315;            /* headings and values, darkest antialias sample #0F1112 */
  --card: #FFFFFF;  --card-foreground: #111315;
  --popover: #FFFFFF; --popover-foreground: #111315;

  --primary: #284A77;               /* navy, measured: active rail item, primary button, profile panel, pager */
  --primary-hover: #213F67;         /* ~derived */
  --primary-foreground: #FFFFFF;    /* 9.0:1 */
  --primary-soft: #E2ECF6;          /* pale blue, measured: icon buttons, segmented active, Filter, pager idle */
  --primary-strong: #284A77;        /* navy text on the pale tint, 7.5:1 */

  --brand: #009FF4;                 /* cyan, measured: logo, progress fill, 2nd data series. Never under text */
  --brand-strong: #0A74B8;          /* cyan when it must hold white text, 5.0:1 (§1) */
  --brand-foreground: #FFFFFF;

  --secondary: #E2ECF6;  --secondary-foreground: #284A77;
  --muted: #F4F8FB;      --muted-foreground: #5E6266;       /* nested rows and info blocks inside cards */
  --subtle-foreground: #6E7276;                              /* IDs, captions, axis labels */
  --accent: #E2ECF6;     --accent-foreground: #284A77;       /* menu and row hover */

  --identity: #284A77;  --identity-foreground: #FFFFFF;     /* the navy profile panel */

  --success: #25713D;  --success-soft: #E6F8EB;              /* measured tint; text AA-adjusted */
  --warning: #8A5A12;  --warning-soft: #FCEBD3;
  --destructive: #A2333C; --destructive-soft: #F8E4E5;
  --info: #284A77;
  --rating: #E4891A;                                         /* star only, measured */

  --track: #E0ECF8;                                          /* progress and gauge remainder, measured */
  --chip-neutral: #D4D8E4;                                   /* neutral chip and 5th series, measured */
  --icon-circle: #E9ECF6;                                    /* contact-row icon discs, measured */

  --border: #E9EDF0;                /* in-card dividers, measured */
  --input: #E3E8EE;                 /* field and white-button edge, ~approx */
  --ring: #284A77;

  --chart-1: #284A77; --chart-2: #009FF4; --chart-3: #BCD8F1; --chart-4: #E0ECF8; --chart-5: #D4D8E4;

  --radius: 0.625rem;   /* control tier 10px ~approx */

  --sidebar: #FFFFFF; --sidebar-foreground: #5B5E61; --sidebar-muted: #6E7276;
  --sidebar-primary: #284A77; --sidebar-primary-foreground: #FFFFFF;
  --sidebar-accent: #F4F8FB; --sidebar-accent-foreground: #111315;
  --sidebar-border: #E9EDF0; --sidebar-ring: #284A77;
}
```
Part hues, used only to tell the kinds of knowledge apart:
- `--part-skill: #284A77`
- `--part-language: #0A74B8`
- `--part-eval: #8A5A12`

## 3. Color roles
| Colour | Job (one each) |
| --- | --- |
| `#284A77` navy | **The brand and the one action.** The active rail item (filled), the primary button ("Add Instructor"), the active pager page, filled count chips, the profile/identity panel, the first data series and the gauge. Navy text on pale blue. |
| `#009FF4` cyan | **Data in motion.** Progress-bar fills, the second chart series, the logo. Never behind text. |
| `#0A74B8` cyan-strong | **A cyan chip that holds text** (the corrected "Contract"). |
| `#E2ECF6` pale blue | **Soft controls and "chosen".** Header icon buttons (bell, settings), the selected segment, the Filter button, idle pager pages, the "Above Average" pill, category tags. |
| `#BCD8F1` light blue | **Third data series**, and a secondary chip ("Part-Time"). |
| `#E0ECF8` track | **The unfilled part** of progress bars and gauges. |
| `#D4D8E4` grey-blue | **A neutral chip** ("Design", "Marketing" type) and the last chart series. |
| `#F4F8FB` canvas | **Surfaces.** The content panel, and nested rows and info blocks inside white cards. |
| `#FFFFFF` | **The app frame** (rail and header strip), cards, white icon buttons. |
| `#E9ECF6` | **Icon discs** beside contact rows. |
| green / amber / red tints | **Status only:** Active or Ongoing, Draft, Archived. Also the delta pill (green). |
| `#E4891A` | **Rating stars only.** |
| `#111315` / `#5E6266` / `#6E7276` | **Text:** values and headings, labels, IDs and captions. |

The logic: **navy means brand and act, cyan means data, pale blue means soft or chosen.** Colour never marks
heading levels.

## 4. Hierarchy mechanism
Hierarchy comes from **one navy mass, then white cards on the pale panel, then size.**
- Each screen has at most one large navy object in the content: the profile panel, which holds white inset
  cards. When it is present, it is the first read.
- Otherwise the first read is the page title plus the single navy button.
- Cards never use borders or shadows; they separate from the canvas by being white.
- Inside a card, nested rows use the canvas tint. A chosen item takes the pale-blue fill with navy text.
- Weight barely changes (400/500). Size does the stepping.

## 5. Typography
- **Sans: Instrument Sans** (`@fontsource-variable/instrument-sans`, 400–700). It is the closest free match
  to the reference's slightly condensed neo-grotesk: double-storey `a`, flat-topped `t`, medium headings,
  no bold. It has a real `tnum` feature, so `tabular-nums` works (verified in the font file).
  - Weights in use: 400 body, 500 titles, labels, buttons and figures. 600 is used only for the one stat
    numeral per card. Never 700.
- **Mono:** the reference has none; IDs such as "STD-2030-004" are set in the sans with tabular figures.
  The product keeps **JetBrains Mono** for long machine identifiers only (SPIFFE IDs, digests). See §9.
- **Scale (~approx real px):**

| Token | Size / line | Weight | Used for |
| --- | --- | --- | --- |
| `text-stat` | 30 / 36 | 500 | One figure per card ("321", "35h", "88") |
| `text-page` | 28 / 34, −0.01em | 500 | The page title ("Courses", "Instructors") |
| `text-section` | 17 / 24 | 500 | Card titles ("Enrolled Courses", "Performance") |
| `text-item` | 15 / 22 | 500 | List and row titles, names, nav labels |
| `text-body` | 14 / 22 | 400 | Prose, values |
| `text-meta` | 13 / 18 | 400 | Field labels ("Email"), captions, breadcrumbs, row meta |
| `text-overline` | 12 / 16 | 500 | Small labels ("Total Hours", "Sub Content"). Sentence case, never uppercase. |

## 6. Radius & spacing
- **Shell: framed.**
  - The app frame (rail and top strip) is white.
  - Content sits in a `#F4F8FB` panel inset from it, with a ~24px corner radius.
  - The rail is 232px wide with icons and labels; collapsed it is a 72px icon rail.
  - The page header sits inside the panel, at the top.
- **Radius tiers (~approx):**
  - **24px:** the content panel and the navy profile panel.
  - **16px** (`--radius-xl`): cards.
  - **12px:** nested blocks inside cards (course rows, info blocks, white cards inside the navy panel), header
    icon buttons, avatars.
  - **10px** (`--radius`): buttons, inputs, selects, segmented controls and their items, the Filter button,
    rail items, pager buttons.
  - **6px:** category tags ("Marketing", "Beginner").
  - **Full:** status pills, chips ("Full-Time"), count chips, the delta pill, progress bars, dots.
  - **Nested:** inner radius = outer radius − inset (polish.md §1). For example, a 16px card with a 12px
    inset takes 4–6px inner rows, rounded up to the 12px block tier only when the inset is small.
- **Spacing scale (~approx real px):**
  - 4: label to value.
  - 8: icon to label, chip to chip.
  - 12: nested-row padding, gaps between nested rows.
  - 16: inner card gaps.
  - 20: card padding, gaps between cards.
  - 24: page gutter inside the panel, gaps between major blocks.
  - 32: the panel's top padding.
- **Density:** medium-airy. Every card has 20px of air, and rows breathe at 12px.

## 7. Signature components
1. **Navy identity panel.**
   - A `#284A77` panel (24px radius) holding:
     - a top-left "Active" status pill (green tint, `CircleCheck`);
     - a 64px avatar on a cyan tile (12px radius);
     - a white 500 name;
     - a white-at-80% line: ID • date.
   - Beneath sit **white inset cards** (12px radius, 8px gutter from the navy edge) for contact rows and
     links. The navy shows as a frame around them.
   - In this product, this is the Worker panel in Compose and the Registry's KPI band.
2. **Segmented gauge.**
   - A 180° arc of ~24 rounded navy ticks; the unfilled ticks are `track`.
   - The number inside is `text-stat`, with "/100" in muted text below and a pale-blue verdict pill
     ("Above Average").
   - Companion **dot meters:** 10 small navy capsules per row, track-coloured for the remainder, with the
     percentage right-aligned.
3. **Progress row.**
   - A nested `#F4F8FB` row (12px radius) holding:
     - a thumbnail;
     - a title in `text-item`;
     - meta tags (a category tag, a level with a signal icon, a duration with a clock, lessons);
     - a cyan progress bar on a `track` with a white-ringed end dot and a % at the right;
     - a score ("89 /100") and a status (dot and word).

## 8. Recurring micro-patterns
- **Status indicator:** a **tinted pill** (the status soft colour) with a **leading dot or `CircleCheck`**
  and the word in the status colour ("• Active", "• Draft", "• Archived"). In dense rows the dot and word may
  drop the pill ("• Ongoing"), but they always keep the colour and the word. One shared `StatusBadge`.
- **Delta / trend:** a **green-tint pill** with `ArrowUp` and the value ("↑ +9.3%"); red with `ArrowDown`
  when negative. Always a pill, never bare text.
- **Chips (classification):**
  - **Filled navy pill:** the primary type ("Full-Time").
  - **Light-blue pill:** a secondary type ("Part-Time").
  - **Cyan-strong pill:** a tertiary type ("Contract").
  - **Grey-blue pill:** the domain ("Design").
  - **Category tags:** pale-blue, 6px radius.
- **Count chip:** a small pill, navy with white figures for the lead row, grey-blue otherwise ("90",
  "58").
- **Segmented control:** a canvas-tint track. The selected item is pale blue with navy text; the others
  are muted text. 10px radius.
- **Buttons:**
  - **Primary:** navy, white 500 label, 10px radius, 40px tall (32px small).
  - **Soft:** pale blue with a navy label ("Filter", header icon buttons).
  - **Outline:** white with a 1px `input` edge (the back button, search icon button).
  - **Ghost:** transparent, with a canvas-tint hover.
  - **States:** hover is instant; disabled is 50%.
- **Icon containers:**
  - **Header:** 40px square icon buttons (12px radius), pale blue (bell with a navy dot) or white.
  - **Contact rows:** 40px `icon-circle` discs.
  - **Page header icon:** a pale-blue 48px tile (12px radius) with a navy 22px icon.
  - **Avatars:** 12px-radius squares on cyan.
- **List termination:**
  - **Long lists:** "Show [8 ▾] of 320 results" on the left, and a numbered pager on the right. The pager
    has 32px buttons at 8px radius: navy active, pale idle, `ChevronLeft`/`ChevronRight` and an ellipsis.
  - **Grouped lists:** "Show n more".
- **Rail:**
  - **Frame:** white, with the logo at the top and one flat list. "Sign out" sits at the bottom, under an
    illustrated upgrade card. This product has no upgrade card; User management sits at the bottom instead.
  - **Item:** an 18px icon and a 14–15px label in `sidebar-foreground`.
  - **Active item:** a **filled navy** row with a white icon and label, plus a 3px navy bar on the rail edge.
  - **Collapsed:** a navy 48px rounded-square tile marks the active item.
- **Icon set (lucide-react, stroke 1.75, rounded caps):**

  | Reference icon | lucide-react |
  | --- | --- |
  | Dashboard | `LayoutGrid` |
  | Calendar | `CalendarDays` |
  | Enrollments | `SquareUserRound` |
  | Courses | `BookOpen` |
  | Instructors | `Presentation` |
  | Students | `GraduationCap` |
  | Financials | `CircleDollarSign` |
  | Sign out | `LogOut` |
  | Back | `ChevronLeft` |
  | Breadcrumb separator | `ChevronRight` |
  | Search | `Search` |
  | Notifications | `Bell` |
  | Settings | `Settings` |
  | More | `Ellipsis` |
  | Menu (phone) | `Menu` |
  | Close drawer | `X` |
  | Email | `Mail` |
  | Phone | `Phone` |
  | Address | `MapPin` |
  | Social | `Linkedin`, `Twitter`, `Instagram`, `Facebook` |
  | Participation | `ListChecks` |
  | Quiz | `ClipboardList` |
  | Exam | `FileText` |
  | Level | `ChartNoAxesColumnIncreasing` |
  | Duration | `Clock` |
  | Rating | `Star` |
  | Filter | `Funnel` |
  | Add | `Plus` |
  | Dropdown | `ChevronDown` |
  | Active status | `CircleCheck` |
  | Delta | `ArrowUp` / `ArrowDown` |
  | Share | `Share2` |
  | Play | `Play` |

  The product's own concepts keep their lucide icons (Registry `Store`, Knowledge `Brain`, Learning
  `BrainCircuit`, Sentinel `ShieldCheck`, Harnesses `Boxes`, User management `KeyRound`), at the stroke
  width above.

## 9. What the reference doesn't cover
- **States.** The reference shows no empty, error or loading states. The product keeps `EmptyState` (white
  card, 40px padding, a pale-blue icon tile), `ErrorState` with a retry, and skeletons in `track`.
- **Long machine identifiers** (SPIFFE IDs, digests) never appear in the reference. They use JetBrains
  Mono, at `text-meta`.
- **Scale.** Grids show 8 cards per page. Longer lists use the pager as specified.
- **Dark mode** is not shown and not built.
- **Accessibility:**
  - corrections are in §1;
  - status is never colour alone (a dot or icon plus a word);
  - focus rings are a 3px navy halo at 40%;
  - the cyan logo and chart fills carry no text.
- **Charts:** the reference's stacked bars use navy, cyan, light and pale. Where a series has to be told
  apart without colour, add a legend with words, which is what the reference does.
- **Product honesty rules** (unknown is never zero; coverage sits beside averages; mock writes say that
  nothing was sent) are the product's, and still apply.

## Composition Fidelity
The product's approved arrangement is kept:
- **Registry:** header, then the navy KPI band, then the stage tabs, then the tab body.
- **Compose:** header, then the stepper, then the task card beside the sticky Worker panel.

From the reference, adopt the **framed shell**: a white rail and frame, with content in the inset pale panel.
Headers sit inside that panel. The page title is on the left; utilities and the single navy action are on
the right.
