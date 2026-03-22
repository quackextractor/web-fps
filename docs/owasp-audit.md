# OWASP Top 10 Security Audit Report

**Project:** Web FPS Game
**Date:** 2026-03-22
**Auditor:** Dominik Hoch

## Executive Summary
This document provides a systematic review of the application's security posture against the OWASP Top 10 (2021) vulnerabilities. Recent development cycles have focused heavily on backend hardening, input validation, and session security.

---

## 1. A01:2021-Broken Access Control
- **Implementation:** All sensitive API endpoints (`/api/save`, `/api/profile/...`) require a valid JWT session token.
- **Controls:** Session tokens are verified using `jose.jwtVerify`. Access is restricted to the authenticated user's own data via Prisma mapping (User ID extracted from JWT).
- **Status:** **PASS**

## 2. A02:2021-Cryptographic Failures
- **Implementation:** Passwords are never stored in plain text; they are hashed using `bcryptjs` with a robust salt round configuration (Point 7.6).
- **Session Security:** JWTs are transmitted via `HttpOnly`, `Secure` (production), and `SameSite: Strict` cookies to prevent token theft and leakage.
- **Status:** **PASS**

## 3. A03:2021-Injection
- **Implementation:** 
    - **SQL Injection:** Guarded by Prisma ORM which uses parameterized queries natively.
    - **Data Injection:** All incoming JSON payloads are strictly validated using `Zod` (Issue #36, #54). Non-numeric or malformed data is rejected before processing.
- **Status:** **PASS**

## 4. A04:2021-Insecure Design
- **Implementation:** Design follows "least privilege" for clients. Server-side validation (Price checks, jump detection) prevents cheating/manipulation that client-side logic cannot bypass.
- **Status:** **PASS**

## 5. A05:2021-Security Misconfiguration
- **Implementation:** Sensitive keys are managed via `.env` files. Detailed internal errors are masked from clients (Issue #35) and replaced with generic "Internal server error" messages.
- **Status:** **PASS**

## 6. A06:2021-Vulnerable and Outdated Components
- **Implementation:** Dependencies are tracked in `package.json`. It is recommended to run `npm audit` periodically as part of the CI/CD pipeline.
- **Status:** **MONITORED**

## 7. A07:2021-Identification and Authentication Failures
- **Implementation:** Multi-step authentication flow with bcrypt verification. JWTs have a defined expiration time and are tied to a secret key.
- **Status:** **PASS**

## 8. A08:2021-Software and Data Integrity Failures
- **Implementation:** Versioning is handled via `version.md` and `CHANGELOG.md`. Git history ensures traceability of all changes.
- **Status:** **PASS**

## 9. A09:2021-Security Logging and Monitoring Failures
- **Implementation:** All backend `catch` blocks log full stack traces internally for debugging (Issue #35), while maintaining client-side opacity.
- **Status:** **PASS**

## 10. A10:2021-Server-Side Request Forgery (SSRF)
- **Implementation:** The application does not fetch data from arbitrary user-supplied URLs. CSRF protection middleware (Issue #56) ensures all mutation requests originate from authorized domains.
- **Status:** **PASS**

---

## Conclusion
The application meets the core requirements for the MVP according to the OWASP Top 10 guidelines. Continuous monitoring and regular dependency updates are recommended post-launch.
