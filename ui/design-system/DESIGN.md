---
name: Industrial Precision
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
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#07006c'
  on-tertiary-container: '#7073ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#e1e0ff'
  tertiary-fixed-dim: '#c0c1ff'
  on-tertiary-fixed: '#07006c'
  on-tertiary-fixed-variant: '#2f2ebe'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-base:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-caps:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  numeric-data:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin: 24px
  container-max: 1440px
---

## Brand & Style

The design system is engineered for the high-stakes environment of Indian construction management. It balances the utilitarian clarity of **Notion**, the technical precision of **Linear**, and the polished professionalism of **Stripe**. 

The brand personality is **authoritative, transparent, and efficient**. It is designed to instill confidence in project managers and accountants by presenting complex ERP data with breathable layouts and surgical precision. 

The aesthetic is **Modern Minimalist**: 
- **High-contrast typography** ensures legibility in various office lighting conditions.
- **Hairline borders** replace heavy shadows to define structure.
- **Intentional white space** reduces cognitive load when managing large-scale work orders.
- **Action-oriented accents** guide the user toward primary tasks without visual noise.

## Colors

The palette is anchored by **Deep Slate (#0F172A)**, providing a grounding, corporate foundation for the brand. This is contrasted by **Slate-50 (#F8FAFC)** backgrounds to keep the interface feeling airy and lightweight.

- **Primary Action**: Use **Action Blue (#3B82F6)** for buttons, active states, and primary links.
- **Status Indicators**: A "Traffic Light" system is used for project health. **Emerald** for "Completed," **Amber** for "On Hold," and **Indigo** for "In Progress."
- **Feedback**: **Red (#EF4444)** is reserved strictly for alerts, over-budget notifications, and destructive actions.
- **Borders**: Use the hairline **#E2E8F0** for all structural divisions, table rows, and card outlines.

## Typography

The typography strategy leverages **Geist** for its clean, geometric humanist qualities that perform exceptionally well at small sizes. 

**Crucial Implementation Rule**: All financial figures, currency symbols (₹), and quantities must use **tabular-numeric** styling. While the system uses Geist for text, use a monospaced alternative like **JetBrains Mono** or Geist's tabular-numeral feature for table columns containing currency or measurements to ensure vertical decimal alignment.

- **Headlines**: Semi-bold weight with tighter letter spacing for a modern, "Linear" inspired look.
- **Labels**: Use uppercase with slight tracking for table headers and section titles to distinguish them from interactive content.

## Layout & Spacing

This design system uses a strict **8px grid system** (with a 4px half-step for micro-adjustments). 

### Grid Model
- **Desktop**: 12-column fluid grid. Content is centered in a 1440px max-width container.
- **Tablet**: 8-column fluid grid with 16px margins.
- **Mobile**: 4-column fluid grid with 16px margins.

### Philosophy
Layouts are **vertically stacked** and modular. Sidebars should be 240px when expanded and 64px when collapsed. Navigation and headers remain sticky to provide constant access to global search and project selection. Spacing between cards and widgets should consistently be `md` (16px).

## Elevation & Depth

To maintain the "Notion/Linear" aesthetic, depth is created primarily through **Tonal Layers** rather than shadows. 

- **Level 0 (Background)**: Slate-50 (#F8FAFC). Used for the base workspace.
- **Level 1 (Surface)**: White (#FFFFFF). Used for cards, tables, and form inputs.
- **Level 2 (Floating/Overlay)**: Used for tooltips and dropdown menus. Apply a very subtle, diffused shadow: `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`.

Use **Hairline Outlines** (1px, #E2E8F0) for all cards and containers. Do not use shadows on standard dashboard widgets or table rows.

## Shapes

The design system utilizes **Rounded (0.5rem / 8px)** geometry. This provides a professional but modern feel that softens the high-density data typical of a construction ERP.

- **Buttons & Inputs**: 6px (sm) for a tighter, more technical appearance.
- **Cards & Dashboard Widgets**: 8px (base).
- **Status Chips**: Fully pill-shaped (999px) to clearly distinguish them from buttons.

## Components

### Navigation
- **Left Rail**: Deep Slate (#0F172A) background with White icons. Active state uses a left-accent border in Action Blue.
- **Top Header**: White background, 1px bottom border. Contains breadcrumbs and the "Project Selector" dropdown.

### Tables (Construction Grids)
- **Styling**: Zebra striping is avoided; use 1px bottom borders. 
- **Alignment**: Text and labels are left-aligned. All currency values (₹), GST percentages, and quantities are **right-aligned** using tabular-monospaced fonts.
- **Density**: Use "Compact" vertical padding (8px) for high-item lists.

### Chips (Status)
- **Style**: Light background (10% opacity of the status color) with a solid colored dot (4px) to the left of the text. 
- **Example**: "In Progress" has an Indigo dot and light Indigo background.

### Financial Cards
- **Hierarchy**: Use a 3-tier layout for financial summaries.
- **Top**: "Work Portion" (Body-base, Neutral).
- **Middle**: "GST (18%)" (Body-sm, Neutral-50).
- **Bottom**: "Total Payable" (Headline-md, Deep Slate, with a subtle top hairline divider).

### Forms
- **Structure**: Multi-column (2 or 3) for wide screens. Use a **Sticky Footer** for "Save/Cancel" actions on long work-order forms.
- **Input Fields**: 1px Slate-200 border. Focus state: 1px Action Blue border with a 2px soft blue outer ring.