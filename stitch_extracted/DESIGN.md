---
name: Cognitive Precision
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#464555'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#712ae2'
  on-secondary: '#ffffff'
  secondary-container: '#8a4cfc'
  on-secondary-container: '#fffbff'
  tertiary: '#004c76'
  on-tertiary: '#ffffff'
  tertiary-container: '#00659a'
  on-tertiary-container: '#bedfff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#eaddff'
  secondary-fixed-dim: '#d2bbff'
  on-secondary-fixed: '#25005a'
  on-secondary-fixed-variant: '#5a00c6'
  tertiary-fixed: '#cce5ff'
  tertiary-fixed-dim: '#93ccff'
  on-tertiary-fixed: '#001d31'
  on-tertiary-fixed-variant: '#004b73'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.03em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system embodies an intelligent, introspective, and high-craft SaaS aesthetic tailored for next-generation cognitive architecture. It combines the rigorous structure of developer-focused tools with the refined tactility of premier modern software. The interface is light-first, clean, and intentionally quiet, allowing continuous AI cognition and persistent memory states to command attention.

Drawing from modern minimalism infused with structural precision and subtle glassmorphic depth, the aesthetic balances crisp geometric delineation with delicate spatial layering. The design evokes absolute reliability, quiet technical competence, and high-fidelity intelligence. Every element feels deliberate, calibrated, and latency-free.

## Colors

The palette is engineered around an electric indigo primary (`#4f46e5`), supported by a cognitive violet secondary (`#7c3aed`) and focused deep-sky tertiary (`#0284c7`). Slate neutrals anchor the architecture, creating balanced contrast without stark harshness.

Semantic status colors reflect the internal memory cycle:
- **Retained / Success**: Emerald (`#059669`) signals committed memory, stable states, and verified outcomes.
- **Recalled / Active**: Amber (`#d97706`) indicates live associative retrieval, pipeline lookups, and attention shifts.
- **Reasoning / Introspection**: Violet (`#7c3aed`) denotes active background synthesis and cognitive loops.

Background surfaces rely on crisp, high-luminance canvas tones (`#f8fafc` base, `#ffffff` card surface) framed with low-contrast slate borders (`#e2e8f0` default, `#cbd5e1` interactive) to keep visual noise minimal.

## Typography

The typographic hierarchy pairs three specialized families to clearly distinguish brand identity, dense narrative content, and system introspection:

1. **Plus Jakarta Sans** provides structural elegance and contemporary geometry to headlines and prominent display copy.
2. **Inter** handles narrative output, reasoning transcripts, and standard interface controls with neutral legibility and rigorous vertical metrics.
3. **JetBrains Mono** surfaces cognitive telemetry, memory node IDs, timestamps, embedding hashes, and state tags, reinforcing the technical depth and transparency of the memory architecture.

## Layout & Spacing

The layout is built on a 12-column fluid grid system across desktop environments, transitioning to an 8-column layout for tablets and a single-column stacked layout on mobile viewports.

- **Desktop (1024px+)**: 12 columns with `1.25rem` gutters and `2rem` screen margins. Supports multi-pane inspectability (e.g., chat interaction alongside an active memory-graph inspection sidebar).
- **Tablet (768px – 1023px)**: 8 columns with `1rem` gutters and `1.5rem` margins. Side panels collapse into dismissible drawer overlays.
- **Mobile (< 768px)**: Flexible single column with `0.75rem` gutters and `1rem` margins. High-density cards adapt with vertically stacked status indicators.

Spacing strictly follows a 4px modular rhythm, using tokens to enforce consistent internal padding, component detachment, and conversational thread spacing.

## Elevation & Depth

Visual depth is achieved through low-contrast linear boundaries combined with restrained ambient shadows and selective backdrop filters, avoiding heavy drop shadows.

- **Level 0 (Canvas Base)**: `#f8fafc` solid background. Grounding plane for panels and background layout blocks.
- **Level 1 (Structural Cards & Modules)**: Pure white (`#ffffff`) background with a 1px border of `#e2e8f0` and an ultra-soft tinted shadow (`0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.03)`).
- **Level 2 (Active Memory Traces & Popovers)**: `#ffffff` surface with crisp border `#cbd5e1` and extended diffusion shadow (`0 10px 15px -3px rgba(79, 70, 229, 0.06), 0 4px 6px -4px rgba(15, 23, 42, 0.04)`).
- **Level 3 (Modals & Overlays)**: Semi-transparent frosted surface (`rgba(255, 255, 255, 0.85)` with `backdrop-filter: blur(12px)`) bordered with subtle indigo-tinted slate (`rgba(203, 213, 225, 0.8)`), casting an ambient elevation shadow (`0 20px 25px -5px rgba(15, 23, 42, 0.08)`).

## Shapes

The design system employs a calibrated roundedness scale (`level 2`). Standard controls, text fields, and list rows maintain a balanced `0.5rem` corner radius, while containers, cards, and execution panels utilize `1rem` (`rounded-lg`) to create defined, friendly boundaries. Floating command bars and status indicators scale up to `1.5rem` (`rounded-xl`) or fully circular pill profiles for status badges and tags.

## Components

### Buttons
- **Primary**: Solid indigo fill (`#4f46e5`) with white text, micro-inset top highlight, and crisp transition to hover state (`#4338ca`). Includes a subtle outer glow on focus (`0 0 0 3px rgba(79, 70, 229, 0.2)`).
- **Secondary**: Pure white background with a 1px border of `#cbd5e1` and neutral text (`#334155`). Hover shifts to `#f1f5f9`.
- **Tertiary / Ghost**: Borderless with slate text (`#64748b`); hover reveals `rgba(241, 245, 249, 0.7)`.
- **Introspection Action**: Translucent violet tint (`rgba(124, 58, 237, 0.08)`) with violet text (`#7c3aed`), used for triggering reasoning reviews or memory synthesis.

### Status Chips & Badges
- Built with `label-md` JetBrains Mono typography in full pill geometry (`rounded-full`).
- **Retained**: Light emerald background (`rgba(5, 150, 105, 0.1)`), emerald border (`rgba(5, 150, 105, 0.25)`), and dark emerald text (`#047857`). Includes an optional pulsating live status dot.
- **Recalled**: Light amber background (`rgba(217, 119, 6, 0.1)`), amber border (`rgba(217, 119, 6, 0.25)`), and deep amber text (`#b45309`).
- **Reasoning**: Light violet background (`rgba(124, 58, 237, 0.1)`), violet border (`rgba(124, 58, 237, 0.25)`), and violet text (`#6d28d9`).

### Input Fields
- White surface bounded by a crisp 1px `#cbd5e1` border.
- Interior text defaults to `body-md` Inter with placeholder in `#94a3b8`.
- Focus states apply a crisp indigo edge (`#4f46e5`) accompanied by an ambient halo (`0 0 0 3px rgba(79, 70, 229, 0.15)`).
- Monospaced parameters, memory query overlays, and filter prompts use `label-md` JetBrains Mono.

### Cards & Container Panels
- Base card: White background with a 1px outline of `#e2e8f0`, `0.5rem` internal padding rhythm, and soft baseline elevation.
- Header bars inside cards use a delicate bottom dividing rule (`#f1f5f9`) separating control metadata from the memory payload.

### Selection Controls (Checkboxes & Radios)
- Crisp 1.5px slate borders (`#94a3b8`) on clean white backgrounds.
- Active state transitions smoothly to primary indigo (`#4f46e5`) with a high-contrast white glyph (check or radio bullseye).

### Lists & Activity Feeds
- Connected via a subtle vertical lineage trace (`1px solid #e2e8f0`) to visually anchor chronological hindsight chains.
- List items feature hover states with soft slate highlighting (`#f8fafc`) and interactive memory preview tooltips on right-aligned nodes.

### Memory Node Inspector (Specialized Component)
- Distinctive high-craft card displaying associative hindsight links.
- Employs a glassmorphic background layer, mono-spaced embedding metrics, confidence indicators, and a tripartite status indicator showing the transition from Reasoning to Active Recall to Long-term Retention.