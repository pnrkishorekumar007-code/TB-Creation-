# TB Creation

A full-stack manga/comic publishing platform. Authors upload manga scripts and comics (chapter by chapter); readers browse, search, and read them online.

## Tech Stack
- **Frontend:** Next.js 14 (App Router) + Tailwind CSS
- **Backend:** Node.js + Express REST API
- **Database:** MongoDB (Mongoose)
- **File storage:** Local disk via Multer (swap for Cloudinary/S3 later if you want cloud storage)
- **Auth:** JWT, roles: reader / author / admin

## Features included (v1 + v2 + v3 + v4 + v5 + v6)
- **Mobile navigation** — a proper hamburger menu on small screens (the nav links used to just disappear below the `md` breakpoint with no way to reach them — now fixed)
- **Report modal** — reporting a comic or comment now opens a styled in-theme modal instead of the browser's native `prompt()`/`alert()` popups
- **Branded cover placeholders** — comics without a cover image show a styled gradient card with the title instead of plain "No cover" text
- **Loading and error states** — a themed spinner while pages load, and a styled error screen with a "Try Again" button instead of Next.js's default blank error page
- Signup/login with role selection (reader or author), with real email/password validation
- **Password reset** — forgot-password flow with a time-limited, hashed reset token (1 hour expiry)
- **Security hardening** — Helmet security headers, rate limiting on all API routes (300/15min) and a tighter limit on auth routes specifically (20/15min) to slow down brute-force attempts
- **Report/flag content** — readers can report a comic or a comment with a reason; admins review an Open Reports queue and mark reviewed/dismissed
- **Terms of Service & Privacy Policy pages** — linked in the footer (placeholder legal text — have a real lawyer review before public launch)
- **Custom 404 page** — styled to match the site instead of a generic error
- **Free-preview reading gate** — the first chapter of any comic is free for everyone; chapter 2 onward requires a free account, giving readers a real reason to sign up
- **My Profile page** — any logged-in user (reader or author) can edit their display name, bio, and avatar
- Comic upload with cover image, then add chapters (multi-page image upload)
- **Chapter scheduling** — set a future publish date/time on a chapter; it stays hidden from readers until then
- **Draft workflow** — save a comic/script as a draft, keep editing, then submit for review whenever you're ready (also used to resubmit after a rejection)
- Comic browsing with genre filter, full-text search, sort (newest/popular), and pagination
- Chapter reader view with prev/next navigation, only shows chapters whose publish date has passed
- Independent script upload (PDF/DOC/DOCX/TXT) with browsing, search, and pagination
- Public author profile pages showing their comics + scripts
- Follow authors — get in-app notifications when someone you follow publishes a new chapter
- **Personalized feed** (`/feed`) — a chronological feed of new chapters from authors you follow
- Bookmarks — save comics/scripts to a personal "My Library" page
- **Continue Reading** — automatically tracks the last chapter you read per comic, resume with one click from My Library
- **Star ratings** — rate comics 1-5, see the community average
- **Likes** — quick like/unlike on comics and scripts with a live count
- Comments on comics (post/delete, author or admin can remove)
- Notifications bell in the navbar with unread count
- Contact form (saved to database)
- Author dashboard ("My Uploads") showing draft/pending/approved/rejected status with a submit-for-review action
- Admin approval queue (approve/reject pending comics and scripts)
- Proper error handling: 404s, Multer upload errors, and validation errors all return clear messages instead of generic 500s

## Getting Started

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI (local Mongo or MongoDB Atlas connection string) and a real JWT_SECRET
npm run dev
```
Runs on `http://localhost:5000`.

You need MongoDB running — either install it locally, or create a free cluster at MongoDB Atlas and paste its connection string into `MONGO_URI`.

### 2. Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```
Runs on `http://localhost:3000`.

### 3. Create your first admin
There's no signup option for admin (by design — admins shouldn't self-register). After signing up a normal account, open MongoDB (Compass, Atlas UI, or the mongo shell) and manually change that user's `role` field from `"reader"` or `"author"` to `"admin"`. Then log in again to see the Admin link in the navbar.

## Project Structure
```
tb-creation/
├── backend/
│   ├── models/        # User, Comic, Chapter, Script, ContactMessage
│   ├── routes/        # auth, comics, scripts, authors, contact, admin
│   ├── controllers/
│   ├── middleware/     # auth.js (JWT + roles), upload.js (multer)
│   ├── uploads/         # uploaded files served at /uploads/*
│   └── server.js
└── frontend/
    ├── app/            # Next.js App Router pages
    ├── components/     # Navbar, Footer, ComicCard, ScriptCard
    └── lib/             # api.js (axios client), AuthContext.js
```

## Next steps (v6 ideas, not yet built)
- **Wire up a real email service** (SendGrid, Postmark, or AWS SES) — password reset currently logs the reset link to the server console instead of emailing it, since no email provider is configured. Look for the comment in `backend/controllers/authController.js` (`forgotPassword` function) — swap the `console.log` for an actual send call.
- **Per-page SEO metadata** — comic and script detail pages are currently client components (`'use client'`) for interactivity, so they can't export Next.js `generateMetadata`. To add real per-comic titles/descriptions for search engines and link previews, split each into a server component wrapper (handles `generateMetadata` + initial fetch) with a client child (handles the interactive bits — likes, comments, etc.)
- Author analytics dashboard (views over time, chart of most-read chapters)
- Tipping/donations, premium chapters
- Related comics recommendations
- Threaded comment replies
- Account deletion / data export (currently only editable, not deletable, from the UI)

## Notes
- Uploaded files are stored locally in `backend/uploads/` — fine for development, but for production, move to Cloudinary, S3, or similar so files survive redeploys.
- The design uses a manga-inspired dark theme (ink black background, red accent, halftone dot texture, Bangers display font) — all defined in `frontend/tailwind.config.js` and `frontend/app/globals.css`, easy to retheme.
