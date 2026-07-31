# CWMS M1 Implementation Analysis — Authentication & Role-aware Shell

**Status:** Implemented (2026-07-31)  
**Date:** 2026-07-31

## Requirements understood

- Login / logout / me / change-password / refresh (OpenAPI `/auth/*`)
- Server session cookie `CWMSSESSION`; Remember Me 14 days (`CWMSREMEMBER`)
- Idle timeout 30 minutes (A-SEC-02); session continues after password change (A-SEC-01)
- Password policy BR-SEC-02; Argon2id
- Demo users BR-SEC-03 / AT-AUTH-007
- RBAC BR-SEC-05: Viewer read-only; Admin-only Masters/Users/Backup nav
- Audit: login success/failure, logout, password changed
- UI: SCR-LOGIN (Stitch), SCR-SHELL (from dashboard chrome), SCR-CHG-PWD (spec-derived)

## Affected modules

- Backend: `identity`, `access`, `audit`, shared session guard
- Frontend: `auth`, `shell`, routing
- DB: M0001 users, M0002 sessions/tokens, M0014 audit (minimal for M1), M0016 demo seed

## Ambiguities

None blocking — Doc 13 defaults apply. Forgot-password link in Stitch is non-functional in v1 (Settings out of scope); UX: “Contact your administrator.”

## Engineering decisions (M1)

| ID | Decision |
|----|----------|
| ED-012 | Remember Me cookie name `CWMSREMEMBER`; duration 14 days |
| ED-013 | Demo `login_id` = role display name (`Data Entry Operator`); `role_code` = OpenAPI enum (`DataEntryOperator`) |
| ED-014 | Dashboard body is placeholder until M5 alerts/KPIs; shell + nav are in scope |
