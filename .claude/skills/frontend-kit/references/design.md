# design.md — Adnex ad-campaign analytics dashboard

Extracted from the pasted Adnex dashboard reference. No image file was reachable on disk for pixel
sampling this session, so **every value below is visually estimated and marked `~approx`** —
verify with a real sampler (ImageMagick/Pillow) against the source file before treating hexes as final.
Light theme with a dark "shell" sidebar framing a light content area; density feels compact/data-dense
(small type, tight card padding) but with generous gaps between major sections.

## 1. Corrections to the source
No supplied swatch/token sheet was present in the reference — nothing to verify against. N/A.

## 2. shadcn/ui theme variables
```css
:root {
  --background: 0 0% 100%;            /* #FFFFFF ~approx — main content area */
  --foreground: 180 14% 12%;          /* #1A2422 ~approx — near-black, faint teal tint */

  --card: 0 0% 100%;                  /* #FFFFFF ~approx */
  --card-foreground: 180 14% 12%;     /* #1A2422 ~approx */

  --primary: 16 92% 58%;              /* #F2662A ~approx — Adnex orange, the single accent/CTA color */
  --primary-foreground: 0 0% 100%;    /* #FFFFFF */

  --secondary: 183 45% 14%;           /* #0F2A2E ~approx — dark teal, sidebar/shell + secondary icon fill */
  --secondary-foreground: 0 0% 100%;  /* #FFFFFF */

  --muted: 210 20% 96%;               /* #F4F5F6 ~approx — subtle card/section fill on light bg */
  --muted-foreground: 210 9% 46%;     /* #6B7280 ~approx — secondary/caption text */

  --accent: 183 45% 14%;              /* #0F2A2E ~approx — reuses sidebar teal as the icon-container accent */
  --accent-foreground: 0 0% 100%;

  --success: 142 71% 35%;             /* #17A34A ~approx — positive delta */
  --success-foreground: 0 0% 100%;

  --destructive: 0 72% 51%;           /* #DC2626 ~approx — negative delta */
  --destructive-foreground: 0 0% 100%;

  --border: 210 16% 90%;              /* #E5E7EA ~approx — card hairlines */
  --input: 210 16% 90%;
  --ring: 16 92% 58%;                 /* matches primary */

  --radius: 0.75rem;                  /* 12px base — see §6 for per-element tiers */

  /* extra tokens this design needs */
  --sidebar: 183 48% 11%;             /* #0C2426 ~approx — slightly darker than --secondary, the shell itself */
  --sidebar-foreground: 180 10% 82%;  /* #C9D2D0 ~approx — sidebar label text */
  --sidebar-active: 183 30% 22%;      /* #29524F ~approx — active nav item fill */
  --chart-teal: 183 45% 14%;          /* #0F2A2E ~approx — series 1 (Banner Ads) */
  --chart-orange: 16 92% 58%;         /* #F2662A ~approx — series 2 (Login Ads) */
  --chart-mint: 174 40% 55%;          /* #55B3A6 ~approx — series 3 (Swipe Ads) */
}
/* No dark-mode variant shown in the reference — see §9. */
```

## 3. Color roles
| Color | Role |
|---|---|
| Dark teal `#0F2A2E` ~approx | Brand/shell color — sidebar background, and the fill for one of the two icon-container tints. Never used for text or as a page background outside the sidebar. |
| Orange `#F2662A` ~approx | The single accent/CTA color — logo mark, primary buttons ("Export Report" is actually rendered dark, see below), "Upgrade Now" button, and the second icon-container tint. Alternates with dark teal across the 4 stat-card icons and the 3 channel-card icons so no two adjacent cards share a tint. |
| White/near-white `#FFFFFF` | Page and card surface. |
| Light gray `#F4F5F6` ~approx | Rare recessed/muted fill (chart axis area, hover states) — not a primary surface. |
| Green `#17A34A` ~approx | Status/role: positive delta only. Never decorative. |
| Red `#DC2626` ~approx | Status/role: negative delta only. |
| Near-black `#1A2422` ~approx | Primary text — has a faint cool/teal tint rather than true neutral gray, echoing the brand teal. |
| Mid gray `#6B7280` ~approx | Secondary text, captions, axis labels, comparison-period text ("vs May 5 – May 11"). |
| Mint teal `#55B3A6` ~approx | Third categorical color, used only in the multi-series line chart and donut (Swipe Ads) — not used anywhere else in the UI. |

Logic: this is a **two-tone brand system** (teal + orange) plus a strictly categorical third mint tone confined to charts, plus semantic green/red for deltas. Teal and orange never mix inside one component (a stat card's icon square is one or the other, never both), and green/red are reserved exclusively for trend direction — they never appear as decorative accents elsewhere.

## 4. Hierarchy mechanism
Primary hierarchy is **size**: each stat card and channel card leads with one large bold numeral (impressions/clicks/spend), dwarfing its label above and its delta below. Secondary hierarchy is **color-as-punctuation on icon containers**: every icon sits in a small solid-color (teal or orange) square, which is the only saturated color block at the card level — it draws the eye to "what kind of metric is this" before the numeral is read. The sidebar's active nav item is marked by a filled lighter-teal pill against the otherwise flat-dark sidebar, the same "one filled block among flat ground" logic repeated at nav scale.

## 5. Typography
Family: a clean geometric/humanist sans with tabular-looking numerals — closest free equivalent is **Inter** (use `Inter` for all UI text and numerals; it is not distinguishable from a paid alternative like Söhne at this size in the reference). No second/mono family is used anywhere in the reference — dates, IDs-like values ("May 12 – May 18, 2024") all render in the same sans, not monospace.

Weights in use: Regular (400) for body/labels, Medium (500) for card titles and nav labels, Semibold/Bold (600–700) for the large stat numerals and the "Welcome back, John!" heading.

Type scale (approx, px):
- Display numeral (stat cards, e.g. "24.68M"): ~28–30px, bold
- Section/page heading ("Welcome back, John! 👋"): ~22px, semibold
- Card title (e.g. "Banner Ads", "Impressions Over Time"): ~15px, medium
- Body/value rows (Clicks, CTR, Spend rows): ~14px, regular
- Label/caption (stat card labels, chart axis ticks, comparison text): ~12px, regular, often muted-gray
- Sidebar nav label: ~14px, medium

## 6. Radius & spacing
**Shell: framed**, not edge-to-edge — a persistent dark sidebar (fixed width, ~260px ~approx) forms a shell around the light content area, which itself sits with its own outer gutter.

Radius tiers (px, ~approx):
- Shell/outer: sidebar itself is square-cornered against the viewport edge (0px) — it's a full-bleed panel, not a floating card
- Card tier (stat cards, channel cards, chart panels, the sidebar's "Unlock more" promo card): **16px**
- Control tier (buttons — "Export Report", "Upgrade Now"; inputs; the date-range dropdown; sidebar active-nav pill): **10px**
- Icon-container tier (the small colored squares holding stat/channel icons): **10px** (rounded-square, same as control tier, not fully round)
- Pill/chip tier (fully round): used only for the small avatar circle and the colored legend dots — **full/9999px**

Spacing scale (px, ~approx):
- Outer page gutter (content area padding against the shell edge): **32px**
- Section gap (between header row → stat-card row → channel-card row → chart row): **24px**
- Card internal padding: **20px**
- Inline gap (icon-to-label, legend dot-to-text, delta arrow-to-percentage): **8px**
- Grid gap between cards in a row (stat cards, channel cards): **16–20px**

Density feel: compact data density inside cards (tight line-height on stacked value rows) balanced by generous 24px+ gaps between major sections, so the page reads as organized rather than cramped.

## 7. Signature components
1. **Stat card with tinted icon square**: white rounded-16px card, top-left a 40×40px rounded-10px square filled solid teal or orange holding a white lucide icon, to its right a two-line label/value stack, and a small delta line below (colored text + directional arrow, no pill). This exact pattern repeats at both the top-level 4-stat row and inside each of the 3 channel cards.
2. **Channel card with embedded sparkline + metric list**: a taller card that stacks an icon+title+"View Details →" header, a small area/line sparkline with a soft color-matched gradient fill beneath the line, then a 4-row metric list (Impressions/Clicks/CTR/Spend) each with its own inline delta, ending in a "Top Campaign" row with a plain-text (not linked-styled) campaign name.
3. **Donut chart with centered total**: a ring chart with 3 segments (teal/orange/mint), a large bold total numeral + "Total" caption centered inside the ring, and a stacked legend below listing each series' color dot, name, value, and percentage.

## 8. Recurring micro-patterns
- **Status/state indicator**: N/A — no explicit status badges/pills appear in this reference (no "active/paused" campaign states shown). If added later, default to a **filled, low-opacity tint pill** (e.g. `bg-success/10 text-success`) to match the card's already-soft, non-outline aesthetic — do not default to a bare colored dot.
- **Delta/trend indicator**: **plain colored text with a small arrow glyph**, never a pill/chip (e.g. "↑ 18.6%" in green, "↓ 4.8%" in red, directly beside the muted-gray comparison text). Use lucide `ArrowUp`/`ArrowDown` at a small size (~12px) inline before the percentage.
- **Icon containers**: solid-fill **rounded-square (10px radius), 40×40px**, alternating teal/orange fill, white icon at ~20px, stroke width ~2. No circular icon containers appear anywhere in the reference.
- **List termination**: not shown — no long list/table appears in the reference (see §9).
- **Icon set**: rounded-cap, ~2px stroke outline icons (not filled) — consistent with lucide-react defaults. Named mappings for every icon visible:
  - Sidebar Overview → `LayoutGrid`
  - Sidebar Campaigns → `Megaphone`
  - Sidebar Ad Channels → `Radio`
  - Sidebar Analytics → `BarChart3`
  - Sidebar Reports → `FileText`
  - Sidebar Audience → `Users`
  - Sidebar Billing → `CreditCard`
  - Sidebar Settings → `Settings`
  - Sidebar Integrations → `Puzzle`
  - Sidebar promo rocket → `Rocket`
  - "Export Report" button → `Download`
  - Date-range control → `Calendar`
  - Dropdown chevrons (date range, user menu) → `ChevronDown`
  - Total Impressions stat → `Eye`
  - Total Clicks stat → `MousePointerClick`
  - Avg. CTR stat → `TrendingUp`
  - Total Spend stat → `DollarSign`
  - Banner Ads card icon → `Image`
  - Login Ads card icon → `LogIn`
  - Swipe Ads card icon → `Smartphone`
  - "View Details →" / "View Full Breakdown →" links → `ArrowRight`
  - Positive delta arrow → `ArrowUp`
  - Negative delta arrow → `ArrowDown`

  App-wide stroke width: **2px** (lucide default `strokeWidth={2}`), at 16–20px for stat/nav icons and 12px for inline delta arrows.

## 9. What the reference doesn't cover
- **Empty/error/loading states**: none shown — every card has full data. Loading skeletons, zero-campaign empty states, and API-error states need fresh design (suggest skeleton cards matching the 16px-radius card shape, and a centered icon+message empty state reusing the muted-gray caption style).
- **Scale behavior**: only 3 channels and a handful of chart points are shown. A campaigns/channels list with dozens of rows, or a chart with hundreds of data points, isn't addressed — needs pagination/virtualization and chart-decimation decisions.
- **List/table termination**: no data table appears at all (e.g. a full campaigns list) — pagination vs. "Load more" vs. infinite scroll must be decided fresh when that view is built.
- **Status badges**: no active/paused/ended campaign state is shown anywhere, despite this being an ad-campaign product — this will need a new component, not just a reused pattern (see §8 recommendation).
- **Accessibility gaps**: the muted-gray caption text (`#6B7280` ~approx on white) and especially white text on the mint-teal chart segment likely sit close to or below WCAG AA for small text — verify contrast ratios before shipping. Delta indicators rely on color (green/red) plus an arrow glyph, which is good, but confirm the arrow renders distinctly enough at small sizes for color-blind users. Sidebar text (light gray on very dark teal) should also be checked for AA contrast at its actual rendered size.
- **Dark mode**: the reference is light-mode only (aside from the sidebar shell); no dark-mode content-area palette is implied and would need to be designed, not derived.

## 10. Addendum — decisions made while building the AI Worker Platform console
Deliberate deviations and extensions to the extraction above, so the next screen does not re-decide them.
- **Contrast.** White on `--primary` orange measures ~3.1:1 and fails AA, so `--primary-foreground` is dark teal (4.9:1). `--muted-foreground` is darkened to `210 9% 40%`, `--success` to `142 72% 28%` (text-safe green). All other text/tint pairs were measured ≥ 4.5:1.
- **`--accent` vs `--brand`.** shadcn uses `--accent` for hover/selected rows in menus; a dark-teal accent made those heavy, so `--accent` is the light hover surface and brand teal lives in `--brand` (icon squares, rails, single-series charts).
- **Added semantic tokens:** `--warning` (stale / attention), `--info` (in-flight / note), `--sidebar-muted`. Tone rules are the product's, not the design's: green only for a *verified* result (Met, Healthy); neutral for waiting/unknown; warning for stale/attention; danger for failed / not met.
- **Status pill** (§8 default applied): `StatusBadge` = filled 10%-tint pill, icon **and** word. **Delta** = coloured text + 12px arrow (`Delta`), shown only when a comparison was observed.
- **Spacing tiers applied:** page gutter 32px (16px phone, 24px tablet); section gap 24px; panel padding 20px; inline gap 8px; grid gap 16–24px.
- **Radius tiers applied:** card 16px (`--radius-xl`), control 10px (`--radius`), pills `rounded-full`.
- **Not extracted, built fresh:** hatched fill for "Awaiting evidence" (pattern + word, never colour alone), hairline-divided sections instead of boxed cards below the focal panel.
- No dark theme: §9 still applies.
- **Type scale (tokens in `index.css`):** `text-page` 24/32 semibold (one per page) → `text-section` 17/24 semibold (card and section titles) → `text-item` 14/20 medium (list-item titles, labels that lead) → `text-body` 14/22 (prose, values) → `text-meta` 12/18 muted (captions, coverage, timestamps) → `text-overline` 11/16 medium uppercase (sparingly, group labels). Display numerals (`text-5xl` hero, `text-xl` figures) only for a single focal number. Each block uses at most two of these levels besides its numeral.
- **Composition rules learned on the Dashboard and Registry:** one focal card per page; secondary information as quiet figures without icon tiles; long lists show a few and reveal the rest; deep detail opens in a right-hand sheet whose state is in the URL; status uses the dot+word treatment in dense lists and the tinted pill elsewhere.
