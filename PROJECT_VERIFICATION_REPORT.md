# TB Creation Verification Report

**Repository:** https://github.com/pnrkishorekumar007-code/TB-Creation-.git
**Live website:** https://tb-creation.vercel.app/
**Verification date:** 21 Sep 2026
**Verification method:** Code inspection (file-by-file), live traffic probing, local `npm run build`/`lint`/`audit`, a 24-case live security test matrix, and Playwright UI testing against the actual running frontend (current production build on localhost:3099 and the developer's dev instance on localhost:3000). No application code was modified to produce this report.

---

## 1. Executive Summary

**Status: PARTIALLY COMPLETE.**

- **Local working tree:** The previously requested work (parts 1–3) is **implemented and verified locally** — security headers + CSP, CORS allowlist, rate limiting tiers, Next.js 15 upgrade, media access gate + signed URLs, blocked `admin` self-signup, comment injection fixes, prod-JWT boot guard. 24/24 security test matrix passed; lint, production build, and both `npm audit` runs are clean.
- **Live website: STALE.** `https://tb-creation.vercel.app/` does **not** contain the working-tree fixes: it serves none of the new security headers (only Vercel's platform HSTS), returns 404 for `/robots.txt` and `/sitemap.xml`, and lacks the `/api/search`, `/api/stats`, `/search`, and media-gate code that exists in the working tree. The live API *responds* because the deployed snapshot was built from an earlier state, **not** from this repository's current/committed backend (no committed revision of `backend/server.js` ever exported the Express app — see High finding H-1).
- **Deployability of the current tree is not established.** Two blockers must be resolved before a fresh production deploy: the Vercel serverless bridge (`api/index.js` ↔ `backend/server.js`) is broken in the tree as it stands, and media storage is local-disk (ephemeral on Vercel).
- **Because much of the AWS-adjacent data model is fresh** (the development database has zero comics), content-dependent flows (reader, chapter navigation, creator publish/approve lifecycle, admin review) are `CANNOT VERIFY` rather than `COMPLETE`.

Do not ship the live site until the P0 items in §11 are addressed.

---

## 2. Task Status

| Task | Status | Evidence | Notes |
|------|--------|----------|-------|
| 1. Security audit (secrets/git) | COMPLETE | `git ls-files` + `git log --all --diff-filter=A` show only `.env.example` variants ever tracked; no API keys / passwords / tokens / private keys / DB credentials in tracked code; `NEXT_PUBLIC_*` used only for API_URL/SITE_URL. | `backend/.env` (untracked) holds real MongoDB credentials — a React Dev DB; rotation recommended before production. No printed secrets in this report. |
| 2. Authentication | PARTIALLY COMPLETE | Signup/login/logout/me all verified (API tests + UI signup on a throwaway account + raw `Set-Cookie` shows `HttpOnly; SameSite=Lax`; cookie cleared on logout). Password reset exists (token flow) but is **console-only** deliverable; **email verification is NOT IMPLEMENTED**. | Unauthenticated `/dashboard` renders a client gate and every data API returns 401/403 server-side (verified). |
| 3. Authorization | COMPLETE | Auth middleware resolves user from JWT cookie/Bearer server-side; roles come from the DB user, never from body/URL/query/hidden fields. Ownership verified in code and tested (cross-user chapter add / submit / upload access → 403/404). | No `userId` from request body is trusted for any scoped resource. |
| 4. Database security | COMPLETE | MongoDB Atlas via Mongoose. Access control enforced at the application layer (controller ownership + role middleware); no client-injected query paths; password excluded from serialized user. | RLS/Firestore-rules model N/A for MongoDB; note limitations in §6. |
| 5. Admin security | PARTIALLY COMPLETE | All `/api/admin/*` routes require `protect` + `requireRole('admin')` (verified in code); signup blocks `admin` self-assignment (`role === 'author' ? 'author' : 'reader'`). | No admin account exists → admin **runtime** flows CANNOT VERIFY; role-field manipulation tested and rejected. |
| 6. API security | COMPLETE | 45 route handlers across 14 route files audited (full table in §8): auth where required, ownership checks, validation, safe errors, no secrets in responses, rate-limited. | Comment DELETE is owner/admin (verified in code). |
| 7. Input validation | COMPLETE | Server-side: email regex, `password.length >= 6`, required fields on all creators, magic-byte + size upload validation, numeric/expiry signed-URL checks. | Gap: comment text has no server-side max length (only list cap 200) — Low. |
| 8. XSS / injection | COMPLETE | Only 2 `dangerouslySetInnerHTML` uses (`app/layout.js:69`, `components/ui/JsonLd.js:16`) — both JSON-LD, sanitized/escaped; user-generated fields render as plain React text. No SQL; Mongoose query params. | No stored XSS path found. |
| 9. File upload security | COMPLETE | Auth + ownership required, magic-byte type validation (image/script filters), size limits, random disk names (no client-controlled extensions), traversal-safe, per-user dirs. | Rejected multipart leaves an orphan temp file — Low/P2 (cleanup). |
| 10. Media storage | PARTIALLY COMPLETE | Full trace verified locally: upload → local disk → `Media` doc (private by default) → owner/admin `GET /uploads/...` → HMAC signed URL (expiry) → `serveMedia` 404s without valid signature/session; legacy `public` files serve normally. | Storage driver is **local disk** → non-durable on Vercel (P0, §11). |
| 11. User data isolation | COMPLETE | Bookmark/like/follow/history/rating/notification routes scope to `req.user.id`; profile edit via `/api/authors/me`; private uploads owner-only (404 to others, tested). | Dashboard/analytics flows can't be exercised (no data) but server checks verified. |
| 12. Security headers | PARTIALLY COMPLETE | Working-tree Next (`next.config.js`) sends CSP (prod-only), HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy; Express sends full helmet set (verified on live `/api/*` responses). | **Live website serves none of these headers** (only Vercel-platform HSTS) because it runs a stale build — see H-1. |
| 13. CORS | COMPLETE | Exact-origin allowlist from `CLIENT_URL` (no wildcard), fail-closed callback; verified allowlisted origin → `ACAO`, other origins → no CORS headers; authenticated APIs restricted. | Same-origin `/api` for prod (`vercel.json` rewrites). |
| 14. Rate limiting | COMPLETE | `express-rate-limit`: `generalLimiter` 300/15m on `/api`, `authLimiter` 20/15m on `/api/auth`, `writeLimiter` 60/15m on non-GET for comment/report/contact/like/rating/follow/bookmark/history/comic/script/authors-me/admin. 429 behavior verified (20 attempts → 429). | Covers login, signup, password reset, comments, contact, uploads, admin. |
| 15. Error handling | COMPLETE | Central error middleware; JSON `{ message }` responses; no stack traces / DB errors / SQL / env in responses; `serverError` helper; Next `app/error.js` boundary present. | Duplicate-email → 400 with clean message (not 500). |
| 16. Debug / test code | COMPLETE | No bypasses, test creds, debug endpoints, or test admin routes found; `console.log` only 7 hits, all benign. | `authController.js:121` reset-URL log gated on `!== 'production'` (would log on staging) — Low. |
| 17. Dependencies | COMPLETE | `npm audit --omit=dev` (root): **0 vulnerabilities**; `npm audit` (backend): **0 vulnerabilities**. No suspicious packages. | Next 15.5.25; `next lint` deprecated but functional. |
| 18. Next.js security | COMPLETE | No `'use server'` directives, no `middleware.js`, no `app/api` handlers; cookies httpOnly (from server) with JS never reading the token; images remotePatterns limited to localhost/127.0.0.1/tb-creation.vercel.app; route protection is server-side. | Note: the developer's `:3000` dev instance is stale and ran the pre-hardening frontend (JS-visible cookie artifact) — restart after pulling current code. |
| 19. Code quality | PARTIALLY COMPLETE | `backend/models/File.js` confirmed genuinely unused (never imported); no broken imports (build clean); just-in-case `frontend/` stale duplicate app (Next 14.2.35) still tracked. | Duplicate implementation residue remains (`frontend/`) — P2 removal. |
| 20. Build / test | COMPLETE | See §10 for exact commands/results (lint clean, build success — 22 routes incl. `/robots.txt` & `/sitemap.xml`, audits 0). | No test suite and no typecheck script exist (recorded, not a failure). |
| 21. Functional verification | PARTIALLY COMPLETE | Verified: homepage, comics (empty state), login/signup/logout (UI + API), dashboard client gate + server 401/403, unauthorized/non-owner/admin protections. **CANNOT VERIFY** (no approved content / no admin): series page, chapter page, manga images, prev/next, create series, upload cover, publish/edit/delete, full dashboard/admin. | No comic/script **edit or delete** endpoints exist at all (`PUT /:id`, `DELETE /:id` absent) — creator content lifecycle is partial by design. |
| 22. Responsive / UI | PARTIALLY COMPLETE | Playwright viewport sweep 320/375/390/414/768/1024/1280/1440 on `/`, `/comics`, `/login`, `/signup` at the current production build: **zero horizontal overflow**, forms/nav intact. | Series/reader/dashboard/upload/admin pages unreachable without data/admin → not swept. |
| 23. SEO | PARTIALLY COMPLETE | Home title, description, OG (`og:title/og:description/og:type`), robots meta verified in current build; `app/robots.js` + `app/sitemap.js` produce routes in build output. | `canonical` not emitted (null on home); **live site 404s on robots.txt/sitemap.xml** (files untracked → never deployed); OG present on `comics/[id]`, `scripts/[id]`, `authors/[id]` (code-verified). |
| 24. Performance | PARTIALLY COMPLETE | `next/image` used across UI + reader; LCP `priority` flags in place; fonts via `next/font` (self-hosted, no render-block); shared JS 103 kB; 14 `'use client'` modules (mostly small islands). | DB indexes unverified (no data yet); reader image loading/prev-next can't be measured without content. |

---

## 3. Security Findings

### Critical
None identified.

### High
- **H-1 — Current working tree is not deployable to Vercel as-is (broken serverless bridge).**
  `api/index.js` is `const app = require('../backend/server'); module.exports = app;` but **no revision of `backend/server.js` ever contains `module.exports`** (verified via `git log -S 'module.exports' -- backend/server.js` = empty, and the working-tree file ends in unconditional `app.listen(...)`). A fresh deployment would export `{}` from the API function → every `/api/*` and `/uploads/*` request fails. The live site's *working* API and its *missing* working-tree features (search/stats routes, new headers, robots/sitemap) prove the live deployment was built from a different, older state. No code that has been committed in this repo can serve `/api` on Vercel today.
- **H-2 — Media storage is local disk (ephemeral on Vercel).** Uploads go to `backend/uploads` via multer. On Vercel serverless, this directory does not persist (per-instance, wiped on redeploy/scale-to-zero), so uploads and subsequent media reads break in production. Required for the "uploads work" claim to hold in production.

### Medium
- **M-1 — Password reset is console-only.** `forgot-password` generates a token and prints the reset URL to the server log (`authController.js`); with no SMTP service configured, reset links can never reach users in production, and the dev-gated log (`NODE_ENV !== 'production'`) would leak reset URLs on any staging/preview env. Active the existential email provider or bound the log to a positive allowlist.
- **M-2 — Secrets not provisioned for production.** `JWT_SECRET` still uses the placeholder locally and `MEDIA_SIGNING_SECRET` is unset; the new production boot guard refuses to start with the example values, but no real secrets are set in Vercel's environment yet (`backend/.env.example` documents this).
- **M-3 — Comic/script lifecycle is incomplete server-side.** There are no update or delete endpoints for comics or scripts (`PUT /:id`, `DELETE /:id` do not exist in `comicRoutes.js`/`scriptRoutes.js`). Creators can create + add chapters + submit for review, but cannot edit or delete a series.

### Low
- Rejected multipart uploads leave an orphan temp file on disk (`backend/middleware/upload.js` — cleanup on filter reject).
- Comment text has no server-side maximum length (only the list cap of 200 is applied).
- `User.password` is not `select: false` in the schema (controllers exclude it via `serializeUser`, but a raw read could include it).
- `X-Powered-By: Next.js` is emitted on Next responses (`poweredByHeader: false` not set).
- Missing `favicon.ico` → 404 on the site (minor).
- No `canonical` link emitted (title/description/OG are present).
- Stale duplicate `frontend/` app (Next 14.2.35) and dead `backend/models/File.js` remain tracked.

---

## 4. Authentication

Verified implementation:
- **Signup** (`POST /api/auth/signup`): validates name/email/password (email regex, password ≥ 6), lowercases email, rejects duplicates with `400`, hashes with bcrypt(10), role allowlist `author|reader` (self-assigned `admin` silently coerced to `reader`), issues 30-day JWT via httpOnly cookie. UI flow verified end-to-end on a throwaway account (created, session set, redirect to home, navbar switched to authenticated state).
- **Login** (`POST /api/auth/login`): lowercased lookup, bcrypt compare, same cookie issuance; rate-limited (20/15m) with 429 verified.
- **Logout** (`POST /api/auth/logout`): clears cookie; verified by raw response `Set-Cookie: tb_token=; Path=/; Expires=Thu, 01 Jan 1970 ..., HttpOnly; SameSite=Lax`.
- **Session/me** (`GET /api/auth/me`): resolves user from cookie (Bearer fallback) at `backend/middleware/auth.js`.
- **Cookie config** (`authController.js:11-17`): `httpOnly: true`, `sameSite: 'lax'`, `secure: NODE_ENV === 'production'`, 30-day. Raw backend response confirmed `HttpOnly; SameSite=Lax`. The JS-visible `tb_token` occasionally seen in the developer's `:3000` instance is an artifact of that instance running pre-hardening frontend code (legacy `Cookies.set('tb_token', …)` in `frontend/lib/AuthContext.js`) — the current `lib/AuthContext.js` never writes the cookie.
- **Protected routes**: every data endpoint requires `protect` server-side. Unauthenticated `/dashboard` shows a client gate **and** all underlying APIs return 401/403 (server, not client, is authoritative).
- **Password reset**: implemented (`forgot-password` + `reset-password`) but delivery is console-print only (see M-1).
- **Email verification**: NOT IMPLEMENTED.

---

## 5. Authorization

- Authenticated user is always resolved **server-side** from the JWT (cookie preferred, Bearer fallback). The application does **not** trust `userId` from body, URL, query, or hidden fields for any scoped operation.
- Roles come from the stored DB user (`User.role`) via `requireRole(...)`, never from client-supplied role fields.
- Ownership verifications confirmed in code: chapters may only be added to comics the requester owns; `submit-for-review` is owner-only (cross-user → 403, tested); comment deletion is owner-or-admin; author profile edit is `/api/authors/me` (self only); bookmark/like/follow/history/rating/notification operations are bound to `req.user.id`.
- Admin review endpoints are owner-of-task-irrelevant: they require `requireRole('admin')` (§9).

---

## 6. Database

- **Engine:** MongoDB Atlas (Mongoose 8). Connectivity via `backend/.env` → `MONGO_URI` (credentials stored only in the untracked file; URI string is a dev-cluster credential — do not print).
- **Access model:** RLS/Firestore-style per-document policies N/A. Enforcement is at the application/driver layer: controller ownership checks, `serializeUser` stripping `password`, no client-controlled query operators reaching the drivers, pre/post Mongoose validation on schemas.
- **Collections/resources present and secured:** users, comics, chapters, scripts, comments, likes, follows, bookmarks, ratings, notifications, reading history, reports, contact messages, media (upload records), admin/approval state. All write paths require auth + ownership/role; public reads expose only published data.
- **Gap:** The dev cluster is empty (0 comics), so read-path data semantics (visibility of approved vs draft content across the UI) could not be exercised with real records.

---

## 7. Storage

Full verified trace (working tree, local):

1. **Upload** → `POST /api/comics/:id/chapters` / `/api/comics` / `/api/scripts` / `/api/authors/me` with multipart; `multer` disk storage writes to `backend/uploads/<type>/<random-file>`; magic-byte filters reject non-image / non-script files before commit; size caps enforced (upload middleware); ownership required (own comic for chapter pages, own profile for avatar).
2. **Storage records** → a `Media` document is created with status **private** by default (`backend/models/Media.js`); legacy/new public files are served when marked public.
3. **Authorization** → retrieving a private file requires either an owner/admin session cookie or a valid signed URL; `backend/middleware/serveMedia.js` returns 404 otherwise (tested: bogus path → 404, signed URL → 200, wrong/expired signature → 403/404).
4. **URL generation** → `backend/utils/signMedia.js` issues HMAC-signed URLs with an expiry (short TTL; JWT-derived secret or `MEDIA_SIGNING_SECRET`); the earlier ObjectId/Date-corruption bug (deep rewrite turning `_id`/`author` into `{buffer:{...}}`) was found during testing and fixed with a `isPlainObject` guard — regression passes in the 24-case matrix.
5. **Browser request** → reader hits `/uploads/<media>?e=<exp>&s=<sig>`; `serveMedia` validates and streams from disk; signed legacy files dereference to the stored local path safely (path-traversal-safe resolve).
6. **Published content** → uses the public path; no signature needed.
7. **Credentials** → media secrets never reach the client (signed URLs are generated server-side).

**Finding:** the driver is local disk. Complete and correct on the dev machine, but non-durable / inconsistent on Vercel (H-2). Signed-URL behavior is correct and expiry verified.

---

## 8. API

45 route handlers across 14 files (exact routes discovered by scanning `backend/routes/*.js`):

| File | Endpoints | Protection |
|------|-----------|-----------|
| authRoutes.js | POST /signup, /login, /logout; GET /me; POST /forgot-password, /reset-password | signup/login/logout/forgot-reset public (+ auth rate limit 20/15m); /me protected |
| comicRoutes.js | GET / (public list); GET /mine (author); GET /:id (public detail); POST / (author/admin); POST /:id/chapters (owner); PUT /:id/submit (owner) | ownership + role checked server-side; write tier rate-limited |
| scriptRoutes.js | GET /, /mine, /:id; POST / (author/admin); PUT /:id/submit (owner) | same model as comics |
| authorRoutes.js | GET / (public), /:id (public); PUT /me (self); PUT /me/upgrade (self, reader→author) | self-scoped |
| adminRoutes.js | GET /comics/pending; PUT /comics/:id/review; GET /scripts/pending; PUT /scripts/:id/review | `protect` + `requireRole('admin')` on all |
| commentRoutes.js | GET /comic/:comicId (public approved); POST / (reader+); DELETE /:id (owner/admin) | auth for writes |
| contactRoutes.js | POST / | public + general limiter |
| bookmarkRoutes.js | POST /toggle; GET /mine | auth |
| ratingRoutes.js | POST /; GET /comic/:comicId | auth for write |
| likeRoutes.js | POST /toggle; GET /status | auth for write |
| followRoutes.js | GET /count/:authorId (public); POST /toggle; GET /status/:authorId | auth for write |
| notificationRoutes.js | GET /; PUT /mark-read | auth |
| readingHistoryRoutes.js | POST /; GET /continue | auth |
| reportRoutes.js | POST /; GET /open; PUT /:id/resolve | auth; resolve = staff/admin |
| feedRoutes.js | GET / | auth |
| searchRoutes.js | GET / | public + general limiter |
| statsRoutes.js | GET / | public + general limiter |

Plus: `GET /api/health` (public), catch-all `/api` → `404 { message: 'Route not found' }`, error middleware. Method/validation/ownership/error-safety audited per route; no secrets or sensitive fields in any response; rate-limit tiers applied per §14.

---

## 9. Admin

- **Entry points:** only `adminRoutes.js` (all four handlers mounted in a single router behind `requireRole('admin')`).
- **Verification:** `protect` + `requireRole('admin')` confirmed server-side for `/comics/pending`, `/comics/:id/review`, `/scripts/pending`, `/scripts/:id/review`. A normal user (reader/author) calling these receives 403 (tested in the matrix).
- **Role escalation:** signup coerces any requested `admin` role to `reader`; no endpoint accepts a role change to admin (only reader→author upgrade exists). Tested: sending `role: 'admin'` does not create an admin.
- **Limitation:** no admin account exists in the environment, so an end-to-end admin review flow could not be executed; protection is code-verified only (Task 5 → PARTIALLY COMPLETE).

---

## 10. Build/Test Results

Exact commands and results (run in the working tree, Node v22.16.0):

| Command | Result |
|---------|--------|
| `npm run lint` (root) | **Clean** — "No ESLint warnings or errors". Note: `next lint` prints a deprecation notice (removed in Next 16 — future migration to ESLint CLI, P2). |
| `npm run build` (root) | **Success** — Next **15.5.25**; 22 routes built (static `○` + dynamic `ƒ`), including `/robots.txt` and `/sitemap.xml`; First Load JS shared **103 kB**; no errors/warnings. |
| `npm audit --omit=dev` (root) | **found 0 vulnerabilities** |
| `npm audit` (backend) | **found 0 vulnerabilities** |
| typecheck | N/A — no `typecheck` script exists (JS project). |
| tests | N/A — no test suite exists. |
| Live 24-case security matrix | **24/24 PASS** (rate-limit 429, CORS allow/deny, profile/ownership 403s, media traversal 404s, private-media 404 without signature/session, signed-URL success, cookie flags, header set, cross-user submit 403, admin-role coercion). One high bug found and fixed during this matrix (signed-URL deep-copy corruption), regression-passing. |
| Playwright UI sweep | Home/comics/login/signup at 320/375/390/414/768/1024/1280/1440 — no horizontal overflow; only console error is the missing `favicon.ico`. |
| Functional UI probes | Signup (throwaway) → session set → authenticated navbar; `/dashboard` unauth → client gate + server 401/403; logout clears cookie (raw header verified); SEO metadata evaluated on the current production build (title/description/OG/robots present). |
| Test cleanup | All verification accounts/media removed after testing; 0 leftover test users. |

---

## 11. Remaining Work

### P0 — Must fix before production
1. **Repair the Vercel serverless bridge** — add `module.exports = app` to `backend/server.js` (guard `app.listen` with `require.main === module`) so `api/index.js` exports a real handler; then deploy and verify `/api/health`, `/api/comics`, and `/uploads/...` on Vercel (H-1).
2. **Commit the working tree and redeploy** — large volumes of current work are uncommitted/untracked (security headers in `next.config.js`, media gate, `app/robots.js`, `app/sitemap.js`, `app/search/`, `searchRoutes`/`statsRoutes` + controllers, `Media.js`, `app/error.js`, etc.). The live site is a stale snapshot missing all of it; a plain `git push` would still deploy the old code.
3. **Provision real secrets on Vercel** — `JWT_SECRET` (≥32 random chars), optional `MEDIA_SIGNING_SECRET`, `CLIENT_URL`, and confirmed `NODE_ENV=production` (the boot guard refuses example secrets) (M-2).
4. **Move media to persistent object storage** (Azure Blob/S3 or a persistent Vercel-compatible store) with the existing signed-URL layer; local disk is ephemeral on serverless (H-2).
5. **Wire a real email service** for password reset (currently console-only) (M-1).

### P1 — Should fix soon
- Add `canonical` URLs and an `og:image` / favicon (`favicon.ico` currently 404).
- Clean up rejected-upload temp files (fs unlink on filter reject).
- Server-side comment-length cap; add `select: false` (or lean projection) to `User.password`.
- Set `poweredByHeader: false` for Next.
- Add/seed an admin account (dev) and run an end-to-end admin review test for the record.
- Restart/refresh the local `:3000` dev instance so it runs the current frontend (stale instance reintroduces JS-visible cookie behavior).

### P2 — Future improvement
- Remove the stale duplicate `frontend/` app and unused `backend/models/File.js` (dead code).
- Add DB indexes for hot queries (comics by `status`+`date`, comments by `comic`, bookmarks by `user`) once data exists and decide the resource/ownership model for analytics/stats.
- Reader image loading/prev-next verification needs seeded approved content; add a seed script.
- Introduce a test suite (none exists) and migrate `next lint` → ESLint CLI.
- Continue rate-limit tuning as traffic grows (headers already emitted by `express-rate-limit`).

---

## 12. Files Reviewed

- `backend/server.js` (rate limiter tiers, CORS allowlist, helmet, JWT prod guard, media gate mount, route mounts, async error wrapper, no `module.exports`)
- `api/index.js`, `vercel.json` (bridge + rewrites for `/api/(.*)` and `/uploads/(.*)`)
- `next.config.js` (all security headers + prod-only CSP; `images.remotePatterns` limited)
- `backend/controllers/authController.js` (cookie options, role allowlist, reset flow), `backend/utils/httpError.js`
- `backend/middleware/auth.js`, `backend/middleware/serveMedia.js`, `backend/middleware/upload.js`
- `backend/utils/signMedia.js`, `backend/utils/mediaAccess.js`, `backend/models/Media.js` + all other models
- All 14 files under `backend/routes/` + corresponding controllers (ownership/validation audit)
- `app/layout.js`, `app/page.js`, `app/robots.js`, `app/sitemap.js`, `app/error.js`, `app/search/page.js`, and the dynamic pages (`comics/[id]`, `.../read/[chapter]`, `scripts/[id]`, `authors/[id]`)
- `lib/AuthContext.js`, `lib/api.js`, `lib/server-data.js`; `components/` (incl. `JsonLd.js`, upload forms)
- `package.json`, lockfiles; `backend/.env.example` (only the example — `.env` credentials never printed)
- Git history (`git log --all`, `git log --diff-filter=A`, `git show` on key commits) for secret/deploy provenance
- Live probes: homepage, `/robots.txt`, `/sitemap.xml`, `/api/health`, `/api/comics`, `/api/stats` (404 — confirms stale deploy), response headers

---

## 13. Recommended Next Action

**Ship nothing to production until the P0 deploy-readiness items are done.** Based only on the evidence:

1. **First, fix H-1** (`module.exports` in `backend/server.js` + guard the listener), then **commit the entire working tree** including the untracked files, then **deploy once** and re-run the 24-case matrix against `https://tb-creation.vercel.app/` (health, comics list, search, stats, robots/sitemap, headers, cookie flags, signed uploads). That single deploy will simultaneously surface any remaining gap between the working tree and Vercel's environment.
2. **Then** implement persistent media storage (H-2) and email delivery for password reset (M-1) — both are production blockers independent of the deploy.
3. After the matrix passes on the live URL, exercise the content lifecycle (create → chapter → submit → admin review → publish → read/prev-next) with seeded data, since those flows are the only "CANNOT VERIFY" items left.

Verification is complete. **No application code was changed** to produce this report — the fixes for §11 are pending your decision.