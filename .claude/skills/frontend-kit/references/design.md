---
version: "alpha"
name: "Estilo de IA Ética"
description: "Clean and trustworthy landing page for a safe conversational AI. Ideal for landing pages, modern websites. AI-ready template."
colors:
  primary: "#1A73E8"
  secondary: "#FFFFFF"
  tertiary: "#F8F9FA"
  neutral: "#3C4043"
  surface: "#34A853"
  accent: "#FBBC05"
typography:
  h1:
    fontFamily: Roboto
    fontSize: 2.5rem
    fontWeight: 700
  body-md:
    fontFamily: Roboto
    fontSize: 1rem
    fontWeight: 400
rounded:
  sm: 8px
  md: 16px
  lg: 24px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.sm}"
    padding: 12px
---

## Overview

Clean and trustworthy landing page for a safe conversational AI. Ideal for landing pages, modern websites. AI-ready template. The first wave of AI ethics organizations faced an impossible design brief: look trustworthy without looking like you're trying to look trustworthy. Early attempts leaned hard into blue gradients and shield iconography — borrowed credibility from fintech and cybersecurity. It felt hollow. The visual language of 'responsible AI' was indistinguishable from the companies it claimed to hold accountable.

What emerged next was more interesting. Organizations like the Partnership on AI and Montreal AI Ethics Institute started developing identities that prioritized legibility over mystique. Open typography. Generous whitespace. Diagrams that actually explained something instead of decorating a hero section. The shift was philosophical: if your mission is transparency, your design language can't hide behind abstraction.

The real tension persists today. How do you communicate futurism — because AI is genuinely novel — without the techno-utopian aesthetic that erodes trust? The best work in this space threads that needle by grounding speculative technology in human-scale design decisions. Readable type. Honest color. Structure that invites scrutiny rather than deflecting it.

- Density: 3/10 — Airy
- Variance: 3/10 — Restrained
- Motion: 4/10 — Subtle

- **Style:** Clean, Trustworthy, Thoughtful
- **Keywords:** AI, ethical AI, safe AI, conversational AI, trustworthy, thoughtful, clean, minimalist, responsible, secure
- **Era:** 2026+ Responsible AI
- **Light/Dark:** ✓ Full / ✗ No

## Colors

- **Azul Ético** (#1A73E8) — Accent highlight, links and focus states
- **Branco** (#FFFFFF) — Light surface, card backgrounds
- **Cinza Claro** (#F8F9FA) — Secondary text, borders, muted elements
- **Cinza Escuro** (#3C4043) — Dark surface, primary background
- **Verde** (#34A853) — Success states, positive indicators
- **Amarelo** (#FBBC05) — Warning states, attention indicators
- **Vermelho** (#EA4335) — Error states, destructive actions
- **Ciano** (#00BCD4) — Extended palette, decorative use


## Typography

- **Display / Hero:** Roboto — Weight 700, tight tracking, used for headline impact
- **Body:** Roboto — Weight 400, 16px/1.6 line-height, max 72ch per line
- **UI Labels / Captions:** Roboto — 0.875rem, weight 500, slight letter-spacing
- **Monospace:** JetBrains Mono — Used for code, metadata, and technical values

Scale:
- Hero: clamp(2.5rem, 5vw, 4rem)
- H1: 2.25rem
- H2: 1.5rem
- Body: 1rem / 1.6
- Small: 0.875rem


## Layout

- **Grid:** CSS Grid primary. Max-width containment: 1280px centered with 1.5rem side padding.
- **Spacing rhythm:** Balanced. Base unit: 0.5rem (8px).
- **Section vertical gaps:** clamp(4rem, 8vw, 8rem).
- **Hero layout:** Split-screen (text left, visual right).
- **Feature sections:** Zig-zag alternating text+image rows. No 3-equal-columns.
- **Mobile collapse:** All multi-column layouts collapse below 768px. No horizontal overflow.
- **z-index contract:** base (0) / sticky-nav (100) / overlay (200) / modal (300) / toast (500).


## Elevation & Depth

Visualizações de fluxo de conversação, diagramas de segurança de IA, brilhos sutis em elementos de confiança, tipografia limpa e legível (sans-serif), micro-interações de feedback de segurança, elementos modulares, animações de progresso de pesquisa ética.

- **Physics:** Ease-out curves, 200-300ms duration. Smooth and predictable.
- **Entry animations:** Fade + translate-Y (16px → 0) over 420ms ease-out. Staggered cascades for lists: 80ms between items.
- **Hover states:** Subtle color shift + shadow adjustment over 200ms.
- **Page transitions:** Fade only (200ms).
- **Performance:** Only transform and opacity animated. No layout-triggering properties.


## Shapes

Base corner radius: 8px. See rounded tokens in front matter for the full scale.


## Components

- **Primary Button:** Rounded (8px) shape. Accent color fill. Hover: 8% darken + subtle lift shadow. Active: -1px translate tactile press. Font weight 600. No outer glows.
- **Secondary / Ghost Button:** Outline variant. 1.5px border in muted color. Text in primary color. Hover: subtle background fill.
- **Cards:** Rounded (8px) corners. Surface background. Subtle shadow (0 2px 12px rgba(0,0,0,0.06)). 1px border stroke.
- **Inputs:** Label above input. 1px border stroke. Focus ring: 2px accent color offset 2px. Error text below in semantic red. No floating labels.
- **Navigation:** Primary surface background. Active item: accent color indicator. Font weight 500 when active.
- **Skeletons:** Shimmer animation matching component dimensions. No circular spinners.
- **Empty States:** Icon-based composition with descriptive text and action button.


## Do's and Don'ts

- No emojis in UI — use icon system only (Lucide, Heroicons)
- No decorative gradients — flat color only
- No shadows heavier than 0 2px 8px rgba(0,0,0,0.08)
- No pure black (#000000) — use off-black or charcoal variants
- No oversaturated accent colors (saturation cap: 80%)
- No 3-column equal-width feature layouts — use zig-zag or asymmetric grid
- No `h-screen` — use `min-h-[100dvh]`
- No AI copywriting clichés: "Elevate", "Seamless", "Unleash", "Next-Gen"
- No broken external image links — use picsum.photos or inline SVG
- No generic lorem ipsum in demos
