/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
];

// Conservative CSP for the App Router. Next embeds its RSC bootstrap and the
// theme toggle as inline scripts and inlines font CSS, so script-src/style-src
// allow 'unsafe-inline'. The app never interpolates user input into HTML
// (React renders it), so the CSP still meaningfully restricts image, frame,
// connect, object, and form targets. Applied only to production builds because
// local dev needs HMR websockets and eval-based tooling.
// API origin for CSP connect-src/img-src: derived from the deployed API URL
// so the frontend may fetch comics and media from a different host (Render).
const apiOrigin = (() => {
  try { return process.env.NEXT_PUBLIC_API_URL ? new URL(process.env.NEXT_PUBLIC_API_URL).origin : ''; }
  catch (_) { return ''; }
})();

const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${apiOrigin}`.trim(),
  "font-src 'self' data:",
  `connect-src 'self' ${apiOrigin}`.trim(),
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  'upgrade-insecure-requests',
].join('; ');

const nextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '127.0.0.1' },
      { protocol: 'https', hostname: 'tb-creation.vercel.app' },
      ...(apiOrigin
        ? [{ protocol: new URL(apiOrigin).protocol.replace(':', ''), hostname: new URL(apiOrigin).hostname }]
        : []),
    ],
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