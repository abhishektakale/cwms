# CWMS v1.0 — Authentication & Authorization Design

**Type:** Architecture / security design (not implementation)  
**Traceability:** PRD-AUTH, PRD-ADM, PRD-AUD · F-AUTH-* · BR-SEC-* · BR-AUD-* · A-SEC-*  
**Companions:** `../api/openapi.yaml` (`/auth/*`, `/users/*`, `/audit-logs`), `../database/SQL-DATABASE-DESIGN.md` (`users`, `auth_sessions`, `remember_me_tokens`, `audit_logs`)  
**Out of scope:** Source code, framework auth libraries, concrete crypto library choice  

---

## 1. Goals

1. Authenticate every business request (BR-SEC-01).  
2. Enforce interim RBAC: Viewer read-only; four full-access roles; Admin-only gates (BR-SEC-05).  
3. Support Remember Me without weakening password rules (BR-SEC-04).  
4. Audit security-relevant events (BR-AUD-01).  
5. Defend against common web threats at design level (HTTPS, CSRF, XSS, session fixation).  

---

## 2. Login Flow

### 2.1 Happy path — F-AUTH-01

```text
Browser                     API                         Identity store
  |                          |                               |
  |-- POST /auth/login ----->|                               |
  |   {username,password,    |-- validate credentials ------>|
  |    rememberMe}           |<-- user + password_hash ------|
  |                          |-- verify hash                 |
  |                          |-- check is_active             |
  |                          |-- create session (+ optional  |
  |                          |   remember-me token)          |
  |                          |-- audit LoginSuccess          |
  |<- Set-Cookie + User -----|                               |
  |-- navigate to shell -----|                               |
```

**Rules**

| Step | Rule |
|------|------|
| Credentials | Compare against one-way `password_hash` only; never store/log plaintext |
| Inactive user | Reject with distinct `403` / code `ACCOUNT_INACTIVE` (F-AUTH-01F2) — do not reveal whether username exists if product prefers generic message; **design default:** generic `401 Invalid credentials` for unknown user/wrong password; explicit inactive message when user found inactive |
| Success | Issue session; return user profile (role, name, id) |
| Failure | Increment failed-attempt counter (see §8); audit optional LoginFailure |
| Transport | HTTPS only in all non-local environments |

### 2.2 Demo login — F-AUTH-01B, BR-SEC-03

Seeded users (username = role name, password `Password@123`). Same login path as normal users. Production ops SHOULD change/disable demos (A-SEC-05).

### 2.3 Post-login shell

SPA loads `/auth/me` (or uses login payload) to paint role-aware navigation: hide/disable mutate actions for Viewer (PRD-NAV).

---

## 3. Session Management

### 3.1 Model (preferred)

| Concept | Design |
|---------|--------|
| Session type | Server-side session record in `auth_sessions` |
| Client credential | `HttpOnly` + `Secure` + `SameSite=Lax` (or `Strict` if UX allows) cookie, e.g. `CWMSSESSION` |
| Alternate | Opaque Bearer token in `Authorization` for non-browser clients (same server validation) |
| Session id | Cryptographically random; store only **hash** of token server-side |
| Absolute lifetime | Optional max session age (e.g. 12–24 h) even with activity |
| Idle timeout | **30 minutes** inactivity (BR-SEC-06A / A-SEC-02) |
| Sliding renewal | Each authenticated request updates `last_seen_at`; idle clock resets |
| Logout | Revoke session (`revoked_at`); clear cookie (F-AUTH-03) |
| Deactivate user | All sessions for user revoked on deactivate |
| Restore / maintenance | Block writes; may force re-auth after restore (EC-LOCK-004) |

### 3.2 Session timeout — F-AUTH-04

1. Idle > 30 minutes → session invalid.  
2. Next API call → `401` with code `SESSION_EXPIRED`.  
3. SPA redirects to login; preserve return URL optionally.  
4. Release any `work_edit_locks` held by that session/user (BR-CON-01).  

### 3.3 Password change and session — F-AUTH-02, A-SEC-01 / FS-AUTH-01

**Assumption:** Session continues after user changes own password.  
**Hardening option (v1.1):** Revoke other sessions; keep current. Document as optional ADR.

### 3.4 Concurrent sessions

v1 allows multiple browser sessions per user unless PO later restricts. Work edit lock is per Work, not per session count.

---

## 4. Password Policy — BR-SEC-02

| Rule | Requirement |
|------|-------------|
| Length | ≥ 8 characters |
| Complexity | Upper + lower + number + symbol |
| Personal details | Reject if contains name, username, or obvious phone fragments when detectable (A-SEC-03) |
| Storage | Slow hash (e.g. Argon2id or bcrypt) with unique salt; cost factor ops-tuned |
| Transmission | Only over TLS; never in URL/query |
| History | Not required in v1 |
| Expiry rotation | Not required in v1 |

**Applies to:** User create (Admin), Admin password set, Change Password (self).  
**Demo passwords:** Must satisfy rules (`Password@123` does).

### 4.1 Change password API

`POST /auth/change-password` — current + new + confirm; validate BR-SEC-02; audit PasswordChanged.

---

## 5. Remember Me — F-AUTH-01A, BR-SEC-04, A-SEC-06

| Topic | Design |
|-------|--------|
| Opt-in | Checkbox on login only |
| Mechanism | Long-lived `remember_me_tokens` row + separate cookie (or extended session flag) |
| Token | High-entropy random; store hash only; rotatable on use |
| Duration | **Design default:** 14 days (A-SEC-06 until PO fixes) |
| Idle vs absolute | Remember Me survives browser restart; still subject to absolute expiry; optional shorter idle for elevated actions not required in v1 |
| Logout | Revoke remember-me token(s) for that client |
| Password change | Does **not** bypass policy; SHOULD revoke all remember-me tokens for user |
| Theft mitigation | Bind optional user-agent hash loosely; force re-login on mismatch is optional |

`POST /auth/refresh` extends/reissues session when remember-me credential still valid.

---

## 6. RBAC — BR-SEC-05

### 6.1 Roles (fixed enum)

| Role | Capability class |
|------|------------------|
| Administrator | Full-access + Admin-only |
| Data Entry Operator | Full-access |
| Engineer | Full-access |
| Accounts | Full-access |
| Viewer | View-only |

### 6.2 Capability matrix

| Capability | Admin | Operator / Engineer / Accounts | Viewer |
|------------|:-----:|:------------------------------:|:------:|
| Authenticate / change own password | ✓ | ✓ | ✓ |
| Read works, bills, expenses, docs, reports, dashboard | ✓ | ✓ | ✓ |
| Create/update/delete operational data | ✓ | ✓ | — |
| Masters mutate | ✓ | — | — |
| User admin | ✓ | — | — |
| Backup restore | ✓ | — | — |
| Audit log read | ✓ | — | — |
| Export PDF/Excel | ✓ | ✓ | ✓ |

Enforcement: **server-side on every mutating API**; SPA hiding is UX only.

### 6.3 Authorization decision points

1. Authenticated? → else 401  
2. `is_active`? → else 403  
3. Role allows operation? → else 403  
4. Resource ownership rules (e.g. saved filter owner) → else 403  
5. Work lock (edit work) → else 409 `WORK_LOCKED`  
6. Maintenance mode → else 503  

No fine-grained per-field ACLs in v1.

---

## 7. Audit Logging — PRD-AUD, BR-AUD-*

### 7.1 Minimum events (BR-AUD-01)

Login success (and optionally failure), logout, work CUD, bill CUD + payment changes, expense CUD/assign/cancel, document upload/delete, masters CUD, user admin, password changes, restore, backup job results.

### 7.2 Record shape

Aligned with `audit_logs`: timestamp, user (or System), module, action, details, entity type/id, optional IP / request id.

### 7.3 Properties

| Property | Rule |
|----------|------|
| Immutability | No end-user UPDATE/DELETE (BR-AUD-03); DB role revoke |
| Viewer | Viewing data is not audited in v1 |
| Admin UI | `GET /audit-logs` with filters |
| Retention | Indefinite in v1 (see SQL design archival) |

---

## 8. Lockout Policy

**Product assumption A-SEC-04:** No *mandatory* lockout in v1 beyond rejecting bad passwords.

### 8.1 Design recommendation (implement in v1 if cheap; required for 1.0.x hardening)

| Control | Recommendation |
|---------|----------------|
| Per-account soft lock | After **5** failed logins in **15 minutes**, lock account **15 minutes** (or until Admin unlock) |
| Response | Same generic invalid-credentials message during lock to reduce user enumeration; Admin sees lock state in user admin (future field) |
| IP rate limit | Gateway/WAF: e.g. 30 login POSTs / 5 min / IP |
| Audit | Log `LoginLockout` when threshold hit |
| Unlock | Auto on timer; Admin activate/reset path |

If deferred, document residual risk in security review; EC-SEC-004 remains accepted for v1.

---

## 9. Password Reset

### 9.1 Version 1.0 (in scope)

| Path | Actor | Design |
|------|-------|--------|
| Change own password | Any authenticated user | F-AUTH-02 / `POST /auth/change-password` |
| Admin set password | Administrator | `PATCH /users/{id}` with new password; audit; SHOULD revoke target user’s sessions + remember-me tokens |

No public “Forgot password” email/SMS flow in frozen v1 (no email dependency required).

### 9.2 Future (v1.1 / v2) — design stub

1. User requests reset with login id / email.  
2. One-time opaque token (short TTL, single use) emailed.  
3. Set new password under BR-SEC-02.  
4. Revoke all sessions + remember-me tokens.  
5. Audit PasswordReset.  

Do not implement until email/ops prerequisites accepted.

---

## 10. CSRF / XSS Considerations (Design Level)

### 10.1 CSRF

| If using… | Mitigation |
|-----------|------------|
| Cookie session | Synchronizer token (double-submit or header CSRF token) for state-changing requests **or** `SameSite=Lax/Strict` cookie + custom header requirement (`X-Requested-With` / `X-CSRF-Token`) validated server-side |
| Bearer-only (no cookie) | Classic CSRF risk lower; still require CORS lockdown |

**Rules:** No state-changing GET. CORS allowlist exact SPA origins. Reject credentialed cross-origin by default.

### 10.2 XSS

| Layer | Mitigation |
|-------|------------|
| SPA | Framework auto-escaping; never `dangerouslySetInnerHTML` with user content |
| API | JSON only; `Content-Type: application/json`; no reflected HTML error pages with unsanitized input |
| Stored fields | Treat all text as untrusted at render time (work names, remarks, vendor, etc.) |
| Cookies | `HttpOnly` (blocks JS read of session); `Secure` |
| CSP | Deploy Content-Security-Policy: default-src 'self'; restrict script-src; no inline scripts in production if feasible |
| Downloads | Documents served with safe `Content-Disposition` and correct MIME; do not render uploaded HTML |
| Audit/details | Escape when displayed in Admin audit UI |

### 10.3 Related controls

| Threat | Design |
|--------|--------|
| Session fixation | Regenerate session id on login success |
| Clickjacking | `X-Frame-Options: DENY` or CSP `frame-ancestors 'none'` |
| Password in logs | Redact; never log Authorization / Cookie / password fields |
| File upload XSS | PDF/images only; see File Storage Design |

---

## 11. API Surface Summary

| Endpoint | Purpose |
|----------|---------|
| `POST /auth/login` | Authenticate |
| `POST /auth/logout` | End session |
| `GET /auth/me` | Current principal |
| `POST /auth/change-password` | Self password change |
| `POST /auth/refresh` | Remember Me / session extend |
| `GET/POST/PATCH … /users` | Admin user lifecycle + password set |
| `GET /audit-logs` | Admin audit query |

---

## 12. Data Stores Involved

| Table | Role |
|-------|------|
| `users` | Identity, role, password_hash, active |
| `auth_sessions` | Server sessions |
| `remember_me_tokens` | Persistent login |
| `audit_logs` | Security/business trail |
| `work_edit_locks` | Released on logout/timeout |

---

## 13. Acceptance Hooks (Design)

- Invalid credentials never return data.  
- Viewer mutating API → 403.  
- Non-Admin restore/masters/users → 403.  
- Idle 30 min → 401.  
- Remember Me survives restart until absolute expiry.  
- Password change enforces BR-SEC-02.  
- Login/password/restore audited.  

---

## 14. Approval Record

| Item | Value |
|------|-------|
| Document | Authentication & Authorization Design v1.0 |
| Status | Draft for engineering handoff |
| Code | Explicitly excluded |
