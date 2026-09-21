export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (typeof window !== 'undefined'
    ? window.location.origin
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000');

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(
  /\/api\/?$/,
  ''
);

/** Resolve a backend media path (e.g. "/uploads/covers/x.jpg") to an absolute URL. */
export function mediaUrl(src) {
  if (!src) return '';
  if (/^(https?:)?\/\//.test(src)) return src;
  return `${API_BASE}${src}`;
}

/** Fully-qualified URL (for OG tags / structured data). */
export function absoluteUrl(src) {
  const resolved = mediaUrl(src);
  if (!resolved) return '';
  if (/^(https?:)?\/\//.test(resolved)) return resolved;
  return `${SITE_URL}${resolved}`;
}

/** Human-friendly relative date, e.g. "3d ago" / "yesterday". */
export function timeAgo(input) {
  if (!input) return '';
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return '';
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export function formatNumber(n) {
  const num = Number(n) || 0;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}