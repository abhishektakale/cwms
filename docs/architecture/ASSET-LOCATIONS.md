# CWMS UI Asset Locations & Duplicate Audit

**Date:** 2026-07-31  
**Canonical Stitch tree:** `ui/stitch-export/`

## Inventory

| Location | Role | Files (approx.) | Action |
|----------|------|-----------------|--------|
| **`ui/stitch-export/`** | **Canonical** Stitch HTML + `industrial_precision/DESIGN.md` | 14 screens, 29 files | **Keep — use for implementation** |
| `docs/design/stitch-cwms-v1-handoff/` | Source archive of the v1 handoff extract (includes zip sibling) | Exact byte-match of `ui/stitch-export` under nested folder | **Keep as archive** — do not edit; prefer `ui/` for day-to-day work |
| `docs/design/stitch-cwms-v1-handoff.zip` | Original zip delivery | — | **Keep** (product design delivery artifact) |
| `stitch-review/` | ~~Older review export~~ | — | **Deleted 2026-07-31** (superseded incomplete set; PO confirmed) |
| `ui/design-system/DESIGN.md` | Convenience copy of Industrial Precision DESIGN.md | Same hash as Stitch DESIGN.md | **Keep** next to `tokens.css` |
| `ui/design-system/tokens.css` | Extracted CSS variables | Implementation artifact | **Keep** |
| `ui/color-palette/color-palette.css` | Semantic aliases | Implementation artifact | **Keep** |

## Hash comparison (2026-07-31)

| Pair | Result |
|------|--------|
| `ui/stitch-export/**` vs `docs/design/stitch-cwms-v1-handoff/stitch_cwms_construction_management_system/**` | **Identical** (0 path diffs, 0 hash diffs, 29 files each) |
| All four `DESIGN.md` copies | **Identical** (SHA256 prefix `16B0A67B31A189C5`) |
| `stitch-review/**` vs `ui/stitch-export/**` | Was not identical (older incomplete set); **`stitch-review/` removed 2026-07-31** |

## Scaffolding duplicates

| Check | Result |
|-------|--------|
| Accidental `apps/` monorepo from architecture doc | Not present |
| Nested `frontend/frontend` or `backend/backend` | Not present |
| Duplicate Nest hello controllers after M0 restructure | Removed `app.controller.ts` / `app.service.ts` (replaced by `modules/health`) |
| Unused Vite starter `frontend/src/index.css` | Removed (tokens live in `styles/global.css`) |

## Cleanup applied

1. **Left** `docs/design/stitch-cwms-v1-handoff/` and `.zip` — design delivery provenance.  
2. **Deleted** `stitch-review/` (2026-07-31) — superseded incomplete set; not required.  
3. Do **not** delete product markdown under `docs/00-…` through `docs/15-…`.

## Implementation rule

Engineers and agents must open Stitch HTML from **`ui/stitch-export/<screen>/code.html`** only. Treat other trees as read-only archives.
