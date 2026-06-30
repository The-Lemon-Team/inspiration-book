---
name: Professional Content Orchestrator
colors:
  surface: '#fcf8ff'
  surface-dim: '#dbd8e4'
  surface-bright: '#fcf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f2fe'
  surface-container: '#efecf8'
  surface-container-high: '#e9e6f3'
  surface-container-highest: '#e4e1ed'
  on-surface: '#1b1b23'
  on-surface-variant: '#464554'
  inverse-surface: '#303038'
  inverse-on-surface: '#f2effb'
  outline: '#767586'
  outline-variant: '#c7c4d7'
  surface-tint: '#494bd6'
  primary: '#4648d4'
  on-primary: '#ffffff'
  primary-container: '#6063ee'
  on-primary-container: '#fffbff'
  inverse-primary: '#c0c1ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#904900'
  on-tertiary: '#ffffff'
  tertiary-container: '#b55d00'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#ffdcc5'
  tertiary-fixed-dim: '#ffb783'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#703700'
  background: '#fcf8ff'
  on-background: '#1b1b23'
  surface-variant: '#e4e1ed'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  display-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  title-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 28px
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1440px
  sidebar-width: 240px
  grid-gutter: 16px
  section-padding: 24px
  stack-xs: 4px
  stack-sm: 8px
  stack-md: 12px
  stack-lg: 16px
---

## Brand & Style
The design system is built for high-performance marketing teams. It balances the expansive, organized feel of a workspace tool (Notion) with the technical precision and density of a professional issue tracker (Linear). The aesthetic is rooted in **Minimalism** and **Corporate Modernism**, prioritizing speed of information retrieval over decorative elements.

The tone is authoritative, focused, and dependable. It uses generous white space to separate complex data sets while maintaining a high information density through tight typography and condensed component scaling. The user should feel in total control of their workflow, with the UI receding into the background to highlight the content itself.

## Colors
The palette is dominated by a clean, professional neutral scale based on **Slate**.
- **Primary (Indigo):** Used for primary actions, active states, and focus indicators.
- **Surface & Background:** A subtle distinction between `#F8FAFC` for the global canvas and `#FFFFFF` for interactive cards and panels creates a natural hierarchy without heavy shadows.
- **Semantic/Brand Colors:** Specific tokens are reserved for platform-specific identifiers (YouTube, Telegram) to allow users to categorize content at a glance.
- **Text:** Headings utilize `Slate-900` for maximum contrast, while body text uses `Slate-600` to reduce eye strain during long-form planning.

## Typography
This design system uses **Inter** exclusively to ensure maximum legibility at small sizes and a clean, "system-ui" feel. 

For the Russian locale:
- **Headlines:** Use `title-lg` for dashboard sections (e.g., "Календарь публикаций").
- **Body:** `body-md` is the workhorse for table data and descriptions.
- **Labels:** `label-sm` is used for status chips and metadata (e.g., "ЧЕРНОВИК", "ЗАПЛАНИРОВАНО").
- **High Density:** Tighten line-heights on labels and small body text to allow more rows of data to be visible on screen simultaneously.

## Layout & Spacing
The layout follows a **Fixed-Fluid** hybrid model:
- **Sidebar:** A fixed 240px navigation area on the left for folders and workspaces.
- **Main Canvas:** A fluid area that accommodates the Calendar Grid or Content List.
- **Density:** Use a 4px base unit. Component internal padding should be tight (8px or 12px) to mimic the "Linear" efficiency.
- **Grid:** Calendar cells should maintain a minimum height but expand horizontally to fill the viewport.
- **Mobile:** On screens <768px, the sidebar collapses into a bottom navigation bar or a hamburger drawer, and calendar cells stack into a vertical "Agenda" view.

## Elevation & Depth
Depth is conveyed primarily through **Tonal Layering** and **Low-Contrast Outlines** rather than heavy shadows.
- **Level 0 (Background):** `#F8FAFC` - The foundation.
- **Level 1 (Cards/Sidebar):** `#FFFFFF` with a 1px border in `Slate-200`.
- **Level 2 (Popovers/Modals):** `#FFFFFF` with a subtle ambient shadow (0px 4px 12px rgba(15, 23, 42, 0.08)) and a Slate-200 border.
- **Interactive States:** On hover, cards should transition to a slightly darker border (`Slate-300`) rather than increasing shadow depth, maintaining a flat, professional feel.

## Shapes
The shape language is "Rounded-xl" as the primary container style.
- **Standard Radius:** 8px (0.5rem) for small components like buttons and inputs.
- **Large Radius (rounded-xl):** 12px (0.75rem) for primary cards, calendar cells, and modals to give the app a modern, approachable feel.
- **Pill:** Used exclusively for status chips (DRAFT/PUBLISHED) to distinguish them from interactive buttons.

## Components
- **Buttons:** Solid Indigo for primary actions; "Ghost" style (transparent with slate text) for secondary actions. 8px radius.
- **Folder List:** Sidebar items with a 12px colored dot indicator on the left. Active state uses a light indigo background (`#EEF2FF`).
- **Calendar Cells:** 12px radius, white background, `Slate-200` border. High-density: display 2-3 content "pills" per cell before using a "+X more" indicator.
- **Status Chips:**
  - **DRAFT (ЧЕРНОВИК):** Gray background, Slate-600 text.
  - **SCHEDULED (ЗАПЛАНИРОВАНО):** Light Blue background, Indigo-600 text.
  - **PUBLISHED (ОПУБЛИКОВАНО):** Light Green background, Green-700 text.
- **Chat Bubbles:**
  - **User:** Indigo background, white text, 12px radius, aligned right.
  - **System/AI:** White background, Slate-900 text, 1px border, aligned left.
- **Inline Form Inputs:** Minimalist style. No background, only a bottom border that turns Indigo on focus, or a very light gray stroke.
- **Template Chips:** Small, 8px radius, Slate-100 background with a "plus" icon for quick creation.