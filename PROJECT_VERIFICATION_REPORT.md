# TB Creation Verification Report

**Repository:** https://github.com/pnrkishorekumar007-code/TB-Creation-.git
**Live website:** https://tb-creation.vercel.app/
**Verification date:** 21 Sep 2026
**Verification method:** File-by-file code inspection of the full working tree (backend, frontend, config, git history), local `npm run lint` / `npm run build` / `npm audit`, a 26-case live API security matrix executed against a locally-spawned backend running on the MongoDB Atlas cluster, a rate-limit (429) probe, direct HTTP probes of the deployed live site (routes + headers), and Playwright viewport/console checks on the live site. **No application code was modified to produce this report.** All test accounts/media were removed after testing (verified: 0 leftover rows).

---

## 1. Executive Summary

**Status: PARTIALLY COMPLETE — security-hardened code is in the tree and verified locally, but the live production site is currently broken.**

- **Working tree:** The previously requested work is implemented and verified in code: security headers + CSP, CORS allowlist, rate-limiting tiers, serverless bridge fix (`module.exports = app` in `backend/server.js`), media access gate + HMAC signed URLs (private-by-default; expiry, tamper and cross-owner verified), blocked `admin` self-signup (role coercion), comment/description limits, production JWT boot guard, and the prior-report P0 items are committed and pushed.
- **Verified locally (API, against Atlas):** 26/26 security/functional probes PASS, incl. private media 404 for anonymous/non-owner, signed URL 200, tampered/expired signature 404, cross-user chapter-add/submit 403, reader-vs-author 403, reader-vs-admin 403, role-escalation coercion, invalid input 400s, and anonymous-list exclusion of pending content. `npm run lint` clean; `npm run build` success (27 routes incl. `/robots.txt` + `/sitemap.xml`); `npm audit` 0 vulnerabilities on root and backend.
- **Live website: FRONTEND DEPLOYED, API COMPLETELY DOWN.** The live site serves the new build (security headers present; `/robots.txt` and `/sitemap.xml` return 200), but every `/api/*` endpoint (incl. `/api/health`) returns HTTP 500. The only code paths that can abort the serverless cold start before any route is served are the production `JWT_SECRET` gate (`backend/server.js`) and the DB-connect `process.exit(1)` (`backend/config/db.js`) — both can fire when Vercel's environment has no/weak `JWT_SECRET` and/or no `MONGO_URI`. Product is not operationally functional (no login, no data, no uploads) until Vercel env vars are provisioned and a redeploy is verified (Critical C-1).
- **Not verifiable:** DB has 0 comics and 0 admins. Reader flow (chapter rendering, prev/next), admin review flow, publish/approve lifecycle, and analytics are CANNOT VERIFY end-to-end — they need seeded approved content and an admin account.

Do not treat the site as released until C-1 and the P0 items in §11 are resolved.

---

## 2. Task Status

| Task | Status | Evidence | Notes |
|------|--------|----------|-------|
| 1. Security audit (secrets/git) | COMPLETE | `git ls-files` shows only `.env.example`-style files ever tracked; `.env` / `backend/uploads/*` gitignored; `NEXT_PUBLIC_*` only for `API_URL`/`SITE_URL`; working tree clean. | Atlas DB credentials live only in untracked `backend/.env` and were pasted into chat during setup -> rotate DB user password (P0). Nothing printed in this report. |
| 2. Authentication | PARTIALLY COMPLETE | Signup/login/logout/`/me` verified live (201/200/401); cookie raw-captured: `HttpOnly; SameSite=Lax`, `secure` in prod. Reset flows exist (hashed token, 1h expiry) but delivery is console-only. | Email verification NOT IMPLEMENTED. Reset URL printed to server log when non-prod (M-1). |
| 3. Authorization | COMPLETE | User resolved server-side from JWT (cookie preferred, Bearer fallback); roles read from DB, never body/URL/query; ownership checks in every scoped route; cross-user 403s verified. | No client-supplied `userId` is trusted anywhere. |
| 4. Database security | COMPLETE | MongoDB Atlas via Mongoose 8. Enforcement at app layer: ownership + `requireRole`, no client-controlled operators (strings coerced), password excluded at query sites. | `User.password` not `select:false` schema-level (L-3). |
| 5. Admin security | PARTIALLY COMPLETE | All `/api/admin/*` behind `protect` + `requireRole('admin')`; matrix: reader -> 403; signup coerces `role:'admin'` -> reader (verified). | No admin account exists -> admin runtime flow CANNOT VERIFY. |
| 6. API security | COMPLETE | 17 route files / all handlers audited (inventory §8); auth/ownership/validation/error-safety per route; matrix PASS. | Health, catch-all 404, central error middleware present. |
| 7. Input validation | COMPLETE | Email regex, password >= 6, required fields, comment <= 1000, report reason <= 500 + target allow-list, rating 1-5, ObjectId checks, magic-byte + size upload checks. | Array/object `search`/`genre`/`page` params can 500 instead of 400 (L-4). |
| 8. XSS / injection | COMPLETE | Only 2 `dangerouslySetInnerHTML` uses (static theme script; escaped JSON-LD). UGC renders as plain text. No SQL; regex-escaped search. | No XSS vector found. |
| 9. File upload security | COMPLETE | Auth + ownership; magic-byte type validation, `.bin` -> sniffed safe ext; size caps (cover 5MB / pages 8MB / script 15MB / avatar 3MB); random disk names; traversal-safe. | Rejected multipart leaves orphan temp `.bin` (L-5). |
| 10. Media storage | COMPLETE (security flow) | Upload -> disk -> `Media` doc (private by default) -> `/uploads` gate -> HMAC signed URL (1h TTL) -> owner/admin. Matrix: private 404, signed 200, tampered/expired 404. | Driver is local disk -> ephemeral on Vercel (H-1). |
| 11. User data isolation | COMPLETE | Bookmarks/likes/follows/history/ratings/notifications scope to `req.user.id`; profile edits self-only; private media owner-only. | Dashboard/analytics not exercisable without data (server-side verified). |
| 12. Security headers | COMPLETE | Live Next HTML sends CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`; Express `helmet` verified for API. | CSP is prod-only (correct). |
| 13. CORS | COMPLETE | Exact-origin allowlist from `CLIENT_URL`, fail-closed when unset, `credentials: true`; same-origin `/api` via `vercel.json` rewrites. | Combined with CSP `connect-src 'self'`. |
| 14. Rate limiting | COMPLETE | General 300/15m, auth 20/15m, write-tier 60/15m (non-GET). Verified 21st failed login -> 429. | Covers login/signup/reset/comment/contact/upload/admin. |
| 15. Error handling | COMPLETE | Central error middleware + `serverError()`: JSON `{ message }`, no stack/queries/paths leaked; CastError->400, multer->400, dup-key->400. | Server-side `console.error` remains (legit). |
| 16. Debug / test code | COMPLETE | No bypasses, test creds, debug routes, test-admin endpoints. 7 benign `console.*` sites. | Reset URL logged when non-prod (L-10). |
| 17. Dependencies | COMPLETE | `npm audit` -> 0 vulns (root, backend). `overrides` pin `qs`/`postcss`. | `next lint` deprecated - migrate to ESLint CLI (P2). |
| 18. Next.js security | COMPLETE | No `middleware.js`, no `app/api` handlers, no `'use server'`. Protected pages client-gated with server-side API enforcement. Token httpOnly; JS never writes it. | `X-Powered-By: Next.js` still emitted (L-2). |
| 19. Code quality | PARTIALLY COMPLETE | `backend/models/File.js` confirmed dead. Build clean -> no broken imports. | Stale duplicate `frontend/` app (46 tracked files) remains (P2). |
| 20. Build / test | COMPLETE | See §10: lint clean; `next build` success (27 routes); audits 0. | No test suite/typecheck script exist (recorded, not a defect). |
| 21. Functional verification | PARTIALLY COMPLETE | Live/API: homepage, signup/login/logout/me, dashboard/profile/admin gates vs 401/403, ownership, media gates, anonymous list filtering. Reader rendering, prev/next, full publish/edit/delete lifecycle, admin review: CANNOT VERIFY (0 comics, 0 admins; live API down). | Comic/script edit or delete endpoints do not exist (M-2). |
| 22. Responsive / UI | PARTIALLY COMPLETE | Playwright: no breakage at 390-1440, but horizontal overflow at 320px and 375px on every page (navbar right-cluster -> 386px scrollWidth). | Reader/upload/admin pages unreachable without content. |
| 23. SEO | PARTIALLY COMPLETE | Title/description/OG+Twitter base; dynamic `generateMetadata`; `/robots.txt` + `/sitemap.xml` 200 live. | No canonical; sitemap static-routes only; `lastModified` recomputed per request (L-7). |
| 24. Performance | PARTIALLY COMPLETE | `next/image` (9 files) with `priority` on LCP; reader `unoptimized`; `next/font` self-hosted; shared JS 103 kB. | 33 `'use client'` modules, no `next/dynamic` lazy boundaries; reader perf not measurable; DB indexes partial. |

---

## 3. Security Findings

### Critical
- **C-1 - Live API is completely down: every `/api/*` endpoint returns HTTP 500 (incl. `/api/health`).**
  Confirmed by direct probes on 21 Sep 2026. The deployed frontend is the current build (new CSP headers, working `/robots.txt` and `/sitemap.xml`), so this is the new API function, not the old broken bridge. The only code paths that can abort the serverless cold start before any route exists are (a) the production `JWT_SECRET` gate - `backend/server.js` `process.exit(1)` when `JWT_SECRET` is unset/short/example; or (b) `backend/config/db.js` `process.exit(1)` when Mongo cannot connect (no `MONGO_URI`). Both hard-exit inside the serverless function -> blanket 500. **Vercel's environment almost certainly has no/weak `JWT_SECRET` and/or no `MONGO_URI`** (cannot inspect remotely; fix + redeploy + `/api/health` check will confirm). Result: no login, no data, no uploads, no search on the live product.

### High
- **H-1 - Media storage is local disk (`multer.diskStorage` -> `backend/uploads/`).** Secure as implemented, but non-durable on Vercel serverless: files live on ephemeral per-instance disk and are lost on scale-to-zero/redeploy; `/uploads` serves from that same disk. Uploaded content cannot survive in production. Needs persistent object storage (S3 / Azure Blob / Vercel Blob) behind the existing signed-URL layer.

### Medium
- **M-1 - Password reset is console-only.** `forgotPassword` prints the reset URL to the server log when `NODE_ENV !== 'production'`; no SMTP/email provider is wired, so reset links never reach real users in production, and the dev-gated log would leak them in any non-prod (staging/preview) environment.
- **M-2 - Creator lifecycle incomplete server-side.** No update or delete endpoints for comics or scripts. Creators can create, add chapters, and submit for review, but cannot edit or delete a series (matches the UI gap: dashboard shows only upload screens).
- **M-3 - Live environment is empty and cannot be exercised.** Atlas DB currently has 0 comics / 0 scripts / 0 admins; content-dependent flows and the admin review flow remain verification gaps.
- **M-4 - `backend/.env` currently holds example/default values** (localhost URI, placeholder `JWT_SECRET`). The Atlas URI + generated secret set earlier were overwritten/reverted; with the current file the local backend fails Mongo connect and crashes on `npm run dev`. (Config state, not app code.)
- **M-5 - Atlas DB credentials were shared in plaintext** (pasted into chat during setup). The DB user password should be rotated before this environment is used beyond throwaway dev data.

### Low
- **L-1 - Responsive overflow at 320px/375px on all pages** (navbar right-cluster; scrollWidth 386). Confirmed live.
- **L-2 - `X-Powered-By: Next.js`** still emitted (`poweredByHeader: false` not set).
- **L-3 - `User.password` not schema-`select:false`** (mitigated at every query site).
- **L-4 - Array/object query params (`?search[a]=b`) cause 500 instead of 400** in `getComics`/`getScripts`.
- **L-5 - Rejected multipart uploads leave an orphan temp `.bin`** (no unlink on filter-reject).
- **L-6 - `/signup?role=author` is ignored**: `Navbar`/`HomeHeroActions` link the Publish CTA there, but `app/signup/page.js` never reads the param -> always `reader`.
- **L-7 - No canonical links; `sitemap.js` omits all dynamic routes and recomputes `lastModified` per request.**
- **L-8 - Missing `favicon.ico`** (404 on every page per Playwright console).
- **L-9 - Dead/duplicate tree:** `backend/models/File.js` (unused) + stale `frontend/` app (46 tracked files, old Next 14, hard-coded localhost).
- **L-10 - Reset-URL `console.log` in any non-production env** (staging/preview leak).
- **L-11 - Scheduled chapters not previewable by owner:** `addChapter` returns unsigned paths for future-dated chapters and `getComicById` filters them out until `publishAt`.

---

## 4. Authentication

Verified (code + live matrix):
- **Signup** (`POST /api/auth/signup`): required name/email/password, email regex, password >= 6, email lowercased, duplicate -> 400, bcrypt(10), role allow-list `author|reader` (self-requested `admin` coerced -> `reader`, verified), 30-day JWT in httpOnly cookie.
- **Login** (`POST /api/auth/login`): lowercased lookup, bcrypt compare, same cookie; wrong creds -> 401 (verified); rate-limited 20/15m (429 verified on 21st attempt).
- **Logout** (`POST /api/auth/logout`): clears cookie.
- **Session / `GET /api/auth/me`**: user resolved from httpOnly `tb_token` cookie (Bearer fallback for scripts) - 200 with cookie, 401 without (verified).
- **Cookie config**: `httpOnly:true`, `sameSite:'lax'`, `secure` when `NODE_ENV=production`, 30-day, `path:/`.
- **Protected routes:** all data endpoints require `protect` -> 401 server-side (verified). Frontend gates are UX; the API is authoritative.
- **Password reset:** implemented (`forgot-password` + `reset-password`, hashed token, 1h expiry, one-time) but delivery is console-only (M-1).
- **Email verification:** NOT IMPLEMENTED.

---

## 5. Authorization

- Authenticated user is always determined server-side from the JWT; the app does not trust `userId` from body/URL/query/hidden fields for any scoped operation.
- Roles come from the stored DB user via `requireRole(...)`; signup blocks admin self-assignment.
- Ownership verified in code and tested: chapters only on owned comics (cross-user 403), submit-for-review owner-or-admin (cross-user 403), comment deletion owner-or-admin, author profile edit self-only (`/api/authors/me`).
- Matrix: reader -> author 403, reader -> admin 403, non-owner private media 404, anonymous list excludes pending content.

---

## 6. Database

- **Engine:** MongoDB Atlas (`tb-creation` DB) via Mongoose 8.
- **Access model:** document-level RLS/Firestore policies do not apply to MongoDB; enforcement is at the app/driver layer (ownership checks, `requireRole`, sanitizers, no client-controlled operators reaching queries).
- **Collections present and secured:** users, comics, chapters, scripts, comments, likes, follows, bookmarks, ratings, notifications, reading history, reports, contact messages, media.
- **Gaps:** dev DB empty (0 comics/scripts/admins) -> read-path visibility semantics code-verified only; `User.password` lacks `select:false` (L-3).

---

## 7. Storage

End-to-end trace verified locally against Atlas:
1. **Upload** -> `POST /api/comics|scripts|authors/me` multipart; multer disk storage -> `backend/uploads/<kind>/<timestamp>-<rand>.bin`; magic-byte sniff rewrites to safe derived extension and rejects disallowed types; size caps enforced.
2. **Record** -> `Media` doc private by default; flipped public on approval (`publishFiles`) or immediately for avatars.
3. **Authorization** -> `GET /uploads/<path>` -> `serveMedia`: safe-path regex + traversal-safe resolve -> record lookup -> private files need valid unexpired HMAC token, else 404 (indistinguishable from not-found). Verified: anonymous 404, non-owner 404.
4. **URL generation** -> `signMediaUrl` `?e=<expires>&s=<hmac>` (1h TTL, `MEDIA_SIGNING_SECRET || JWT_SECRET`). Owner/admin payloads rewritten by `signPayloadMedia` (plain-object-only - the deep-copy corruption bug is guarded).
5. **Browser request** -> `mediaUrl()` preserves query strings; `Image unoptimized`; signed URL 200, tampered 404, expired 404 (all verified).
6. **Published content** -> public path; `Cache-Control: public, max-age=86400` vs `private, max-age=300`.
7. **Credentials** -> signing secret never reaches client.

**Deployment catch:** driver (local disk) is ephemeral on Vercel (H-1). No storage-service keys exposed to client.

---

## 8. API

Route inventory (`backend/routes/*`, mounted in `backend/server.js`):

| File | Endpoints | Protection |
|------|-----------|-----------|
| authRoutes | POST /signup, /login, /logout; GET /me; POST /forgot-password, /reset-password | public + auth rate-limit; /me protected |
| comicRoutes | GET /, /mine, /:id; POST /, /:id/chapters; PUT /:id/submit | reads public; writes author/admin; chapters/submit owner-checked |
| scriptRoutes | GET /, /mine, /:id; POST /; PUT /:id/submit | same model as comics |
| authorRoutes | GET /, /:id; PUT /me, /me/upgrade | reads public; /me scoped |
| adminRoutes | GET /comics/pending; PUT /comics/:id/review; GET /scripts/pending; PUT /scripts/:id/review | protect + requireRole('admin') router-wide |
| commentRoutes | GET /comic/:comicId; POST /; DELETE /:id | reads public; writes protected; delete owner/admin |
| contactRoutes | POST / | public + limiters |
| bookmarkRoutes | POST /toggle; GET /mine | protected router-wide |
| ratingRoutes | POST /; GET /comic/:comicId | write protected; read optionalAuth |
| likeRoutes | POST /toggle; GET /status | write protected; read optionalAuth |
| followRoutes | GET /count/:authorId; POST /toggle; GET /status/:authorId | writes protected |
| notificationRoutes | GET /; PUT /mark-read | protected router-wide |
| readingHistoryRoutes | POST /; GET /continue | protected router-wide |
| reportRoutes | POST /; GET /open; PUT /:id/resolve | POST protected; /open + resolve admin |
| feedRoutes | GET / | protected |
| searchRoutes | GET / | public |
| statsRoutes | GET / | public |
| server.js | GET /api/health (public); `/api` catch-all 404; error middleware | - |

Per-route audit: auth where required, ownership where scoped, validation, safe queries, clean errors, no sensitive fields in responses - all verified in the matrix. **Missing:** comic/script edit and delete endpoints (M-2).

---

## 9. Admin

- All four admin handlers behind `router.use(protect, requireRole('admin'))` (`adminRoutes.js`); report resolution (`GET /reports/open`, `PUT /reports/:id/resolve`) likewise admin-gated.
- Role escalation blocked (verified: self-requested admin coerced to reader; reader -> admin endpoints 403).
- **Emptiness constraint:** no admin account can be created via the public API and none exists in the DB, so the admin review + publish/publishFiles flows could not be exercised end-to-end (CANNOT VERIFY); behavior is server-side code-verified only.

---

## 10. Build / Test

- `npm run lint` (root): clean (Next 15.5.25; `next lint` deprecated - migrate to ESLint CLI, P2).
- `npm run build`: success - 27 routes generated, incl. `/robots.txt` and `/sitemap.xml`; no blocking errors/warnings.
- `npm audit --omit=dev` (root): 0 vulnerabilities. `npm audit` (backend): 0 vulnerabilities. `overrides` pin `qs`/`postcss`.
- Live probes: `/` 200 with new security headers; `/robots.txt` 200; `/sitemap.xml` 200; every `/api/*` -> 500 (C-1).
- No automated test suite or typecheck script currently exists (recorded for the record, not a defect).

---

## 11. Remaining Work

### P0 (blocking release)
- **Provision Vercel environment variables** in Vercel project settings: `MONGO_URI` (Atlas `tb-creation`), `JWT_SECRET` (>= 32 random chars, same as local), `MEDIA_SIGNING_SECRET`; redeploy; confirm `/api/health` -> 200 (C-1).
- **Remove the hard `process.exit(1)` calls** so a missing/weak env on a serverless cold start returns a clean JSON error (e.g. 500 `{ message }`) via the error middleware instead of killing the whole function (otherwise one bad env takes down every route).
- **Swap local-disk media storage to persistent object storage** (S3-compatible / Azure Blob) behind the existing signed-URL layer (H-1).
- **Wire a real email provider** (Resend/SendGrid/SES/et al.) for password-reset (and optionally verification) delivery; stop printing reset URLs in non-prod logs (M-1).
- **Restore `backend/.env`** to the Atlas URI + a real generated secret so the local backend runs again (M-4).
- **Rotate the Atlas DB user password** (credentials were shared in plaintext chat) (M-5).

### P1 (before feature rollout)
- Add comic/script **edit and delete** endpoints (+ UI) to close the creator lifecycle gap (M-2).
- Add an admin bootstrap path and seed at least one approved comic + one author + one reader so content flows are testable; only then can reader chapter rendering, prev/next, and the admin review flow be verified (M-3).
- Fix navbar overflow at 320/375px (L-1).
- Set `poweredByHeader: false` (L-2).
- Make array/object query params return 400 instead of 500 (L-4).
- Unlink orphan temp files on multer filter-reject (L-5).
- Remove the stale `frontend/` duplicate tree and `backend/models/File.js` (L-9).

### P2 (polish)
- Implement email verification (auth completeness).
- Add canonical URLs + dynamic routes in `sitemap.js` (L-7).
- Add `favicon.ico` (L-8).
- Stop `sitemap.js` recomputing `lastModified` per request.
- Add `next/dynamic` lazy boundaries for heavy client modules.
- Add `select: false` for `User.password` at schema level (L-3).
- Migrate linting to the ESLint CLI (`next lint` removal coming in Next 16).
- Ensure `/signup?role=author` selection is honored or retarget the CTA (L-6).
- Guard reset-URL logging to production-only (L-10); allow owners to preview scheduled chapters (L-11).

---

## 12. Files Reviewed

- **Backend:** `server.js`, middleware/express setup, `config/db.js`, `config/*`, `api/index.js` (serverless bridge), `vercel.json`, `next.config.js`, `backend/.env` (state audit only), `.env.example` variants.
- **Middleware/utils:** `middleware/auth.js`, `middleware/upload.js`, `middleware/serveMedia.js`, error-handler middleware, `utils/signMedia.js`, `utils/mediaAccess.js`, `utils/decorateComics.js`, `utils/httpError.js`.
- **Controllers (all ~17):** auth, comic, script, author, admin, comment, bookmark, like, follow, rating, notification, readingHistory, report, contact, feed, search, stats.
- **Routes (all 17):** `backend/routes/*.js`.
- **Models (all):** User, Media, Comic, Chapter, Script, Comment (+ likes/follows/bookmarks/ratings/notifications/history/reports/contact models); `File.js` verified dead.
- **Frontend/Next:** `app/layout.js`, `app/sitemap.js`, `app/robots.js`, `components/ui/JsonLd.js`, `lib/api.js`, `lib/site.js`, `next.config.js` (server components, client modules, hooks, metadata).
- **Live artifacts inspected:** deployed HTML headers/CSP, `/robots.txt`, `/sitemap.xml`, `/api/*` responses, console/network logs, Playwright viewports 320/375/390/768/1024/1440.

---

## 13. Recommended Next Action

1. **Fix the live API first.** In Vercel project settings add `MONGO_URI`, `JWT_SECRET` (>= 32 chars), and `MEDIA_SIGNING_SECRET`; then convert the `process.exit(1)` guards in `backend/server.js` and `backend/config/db.js` to throw through the error middleware (a single cold-start failure must not 500 every route); redeploy and confirm `GET /api/health` -> 200 and `GET /api/comics` -> 200 JSON.
2. Then restore `backend/.env` for local dev, rotate the Atlas password, and re-run the local 26-case matrix to confirm no regressions.
3. After the API is green, address storage persistence (H-1: move uploads to object storage) before allowing real user uploads.
4. Assign each P0/P1 finding a fix owner; re-run the matrix + a Playwright sweep at 320/375/390 px once responsive fixes land.

---

*End of report. Prepared 21 Sep 2026. No application code was changed in producing this report; all verification artifacts (temp harness scripts) were kept outside the repository.*