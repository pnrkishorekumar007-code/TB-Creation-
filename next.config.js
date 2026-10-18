/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
];

// The backend origin (Render, etc.) when the API is served from a different
// domain than this Next app. Derived from NEXT_PUBLIC_API_URL so the CSP and
// next/image allow-list follow whatever backend URL is configured.
let apiOrigin = '';
let apiHost = '';
try {
  const raw = process.env.NEXT_PUBLIC_API_URL || '';
  if (/^https?:\/\//.test(raw)) {
    const parsedUrl = new URL(raw);
    apiOrigin = parsedUrl.origin;
    apiHost = parsedUrl.host;
  }
} catch (err) {
  apiOrigin = '';
  apiHost = '';
}

const imgSrc = [
  "'self'",
  'data:',
  'blob:',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'https://res.cloudinary.com',
];
if (apiOrigin) imgSrc.push(apiOrigin);

const connectSrc = ["'self'", 'http://localhost:5000', 'http://127.0.0.1:5000'];
if (apiOrigin) connectSrc.push(apiOrigin);

// Conservative CSP for the App Router. Next embeds its RSC bootstrap and the
// theme toggle as inline scripts and inlines font CSS, so script-src/style-src
// allow 'unsafe-inline'. The app never interpolates user input into HTML
// (React renders it), so the CSP still meaningfully restricts image, frame,
// connect, object, and form targets. Applied only to production builds because
// local dev needs HMR websockets and eval-based tooling.
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  `img-src ${imgSrc.join(' ')}`,
  "font-src 'self' data:",
  `connect-src ${connectSrc.join(' ')}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  'upgrade-insecure-requests',
].join('; ');

const remotePatterns = [
  { protocol: 'http', hostname: 'localhost' },
  { protocol: 'http', hostname: '127.0.0.1' },
  { protocol: 'https', hostname: 'tb-creation.vercel.app' },
  { protocol: 'https', hostname: 'res.cloudinary.com' },
];
if (apiHost) remotePatterns.push({ protocol: 'https', hostname: apiHost });

const nextConfig = {
  poweredByHeader: false,
  outputFileTracingRoot: __dirname,
  images: {
    remotePatterns,
  },
  async headers() {
    const headers = [...securityHeaders];
    if (process.env.NODE_ENV === 'production') {
      headers.push({ key: 'Content-Security-Policy', value: contentSecurityPolicy });
    }
    return [
      {
        source: '/(.*)',
        headers,
      },
    ];
  },
};

module.exports = nextConfig;