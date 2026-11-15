---
name: astryx
description: >-
  Astryx (@astryxdesign) — Meta's open-source, agent-ready design system.
  Covers layout-first patterns, semantic design tokens (colors, spacing, radii, typography),
  accessible components, split CRM views, mobile bottom-sheet gestures, and AI-fluent conventions.
  Use when designing or polishing UI/UX, layouts, tables, drawers, buttons, forms, and admin portals.
---

# Astryx Design System & Guidelines (Meta)

Astryx is Meta's production design system, built on React, StyleX, and semantic tokens.

## 1. Frame-First Layouts
- Design pages by budgeting regions before writing content: Header, Navigation, Master List, and Split Detail Panel.
- Use clean layout hierarchies (HStack / VStack / Grid) with consistent spacing scale:
  - Micro: 4px (`gap-1`), 6px (`gap-1.5`), 8px (`gap-2`)
  - Component: 12px (`gap-3`), 16px (`gap-4`)
  - Section: 20px (`gap-5`), 24px (`gap-6`), 32px (`gap-8`)

## 2. Semantic Tokens Over Hardcoded Values
- **Surfaces**:
  - Base canvas: `#f8fafc` / `#f1f3f7`
  - Cards & Panels: `#ffffff` with subtle borders (`border-slate-200/80` or `border-[#eceef2]`)
  - Elevated surfaces: `shadow-[0_1px_3px_rgba(0,0,0,0.04)]` or `shadow-2xs`
  - Hover states: `hover:bg-slate-50/80`
  - Active selection: `bg-blue-50/30 border-l-4 border-l-blue-600` or `bg-amber-50/30 border-l-4 border-l-amber-500`
- **Text & Content**:
  - Primary text: `text-slate-900` / `#0f172a` (high contrast, crisp)
  - Secondary text: `text-slate-600` / `#475569`
  - Tertiary / Muted: `text-slate-400` / `#94a3b8`
  - Section labels: `text-[11px] font-bold uppercase tracking-wider text-slate-400`

## 3. High-End Master-Detail CRM UX
- **Desktop**:
  - Full table with search, status filters, sorting, and row highlight on click.
  - Sticky side-by-side attached detail panel on the right (`w-[380px] lg:w-[410px]`).
  - Smooth animation (`animate-in fade-in-50 slide-in-from-right-4`).
- **Mobile**:
  - Swipe-up bottom sheet modal (`rounded-t-[28px]`, `slide-in-from-bottom duration-300`).
  - Top grab handle pill (`w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4`).
  - Backdrop blur and easy dismiss on swipe / tap outside.

## 4. Tactile Controls & Action Buttons
- Interactive controls must provide instant visual feedback (`active:scale-[0.98]`, subtle ring focus).
- Primary actions: Solid contrast (e.g. Royal Blue `#2563eb` or Dark Charcoal `#18181b`), uppercase tracking-wider text, 42-44px touch targets.
- Secondary actions: Subtle border + soft hover background.
- Status Pills: Soft colored backgrounds with matching text (`bg-emerald-50 text-emerald-700 border-emerald-200`, `bg-sky-50 text-sky-700`, etc.).
