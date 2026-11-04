# CLAUDE.md

This repository is a reusable React frontend starter template, not an application. It provides a neutral component foundation for future projects.

## Stack

- React + Vite + TypeScript
- Tailwind CSS for styling
- shadcn/ui components, already installed as source code (not an npm package)
- Lucide as the icon library

## Conventions

- shadcn/ui components live in `src/components/ui` — reuse them instead of installing another UI component library.
- Shared utilities live in `src/lib`.
- The `@/*` import alias resolves to `src/*` (configured in `tsconfig.json`, `tsconfig.app.json`, and `vite.config.ts`).
- Do not modify or replace the shadcn architecture (`components.json`, the `src/components/ui` structure, the alias setup) unnecessarily.

## Commands

- `npm run dev` — start the local dev server
- `npm run build` — type-check and build for production
- `npm run lint` — lint with oxlint




## UI work (frontend-kit)

This project's UI follows `.claude/skills/frontend-kit`. Read `.claude/skills/frontend-kit/SKILL.md` before building or editing any UI.

- **How it's built** (React + shadcn/ui, file layout, component conventions, the token bridge) is fixed and lives in `.claude/skills/frontend-kit/references/engineering.md`. Before scaffolding anything, check whether a compatible engineering foundation already exists in this project — see engineering.md's detection section. If one exists, don't scaffold, reinstall, or restructure it.
- **What it looks like** (colors, type, radius, spacing, component styling) is specific to this project and lives in `.claude/skills/frontend-kit/references/design.md`, generated from a reference image via `/extract-design`.

If `design.md` still says NOT YET EXTRACTED, run `/extract-design` before building any styled UI.

## UI rules (apply to every screen)

These hold whatever design system is extracted.

- **Alignment.** Align icons, text and controls in a row on their centre line (`items-center`), including a close button beside a title that wraps. Cards that sit side by side carry the same rows in the same order, so they match in height and their content lines up.
- **Spacing.** Repeated elements use identical padding and gaps. Pick one inner padding per card type and keep it.
- **Icons.** Every section heading, list row, stage and status gets a lucide icon, in the same place each time. A row without an icon looks unfinished.
- **Minimal text.** No intro sentences or explanations a heading or icon already gives. Put the detail in a tooltip or the detail view.
- **No needless disclosure.** Don't hide an item's main action behind an accordion. Put the action button in the row.
- **Lists.** Show 5 items, then pagination. Lift the limit only where there is real blank space to fill.
- **Attention first.** Put whatever needs the user's review or decision at the top of the page.
- **Tabs look like tabs.** Use the shared `TabBar` (`src/components/platform/tab-bar.tsx`): icon, label, count, an underline on the selected tab. It sits at the top of the card whose content it switches. Never use stat cards or a strip of numbers as a tab control.
- **Rows carry only the main data.** Usually that is an icon, the name and an action or chevron. Descriptions, dates and secondary facts go in the detail panel or a tooltip. Trim long Worker names. Leave out a status tag when the section or tab heading already says it.
