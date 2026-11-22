import { SITE_URL } from '../lib/site';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/+$/, '');

// Comics, scripts and author pages change without a redeploy, so the sitemap is
// rebuilt hourly instead of frozen at build time.
export const revalidate = 3600;

// Login/signup/reset pages are deliberately absent: they are noindex in robots.js.
const STATIC_ROUTES = ['/', '/comics', '/scripts', '/authors', '/contact', '/terms', '/privacy'];

// 50 per page (the API's max) x 10 pages = 500 URLs per content type.
const MAX_PAGES = 10;

const getJson = async (path) => {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      next: { revalidate },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null; // API unreachable at build time: ship the static routes only
  }
};

const collect = async (path, key, toUrl) => {
  const first = await getJson(`${path}?page=1&limit=50`);
  if (!first?.[key]?.length) return [];
  const pages = Math.min(first.pages || 1, MAX_PAGES);
  const rest = await Promise.all(
    Array.from({ length: pages - 1 }, (_, i) => getJson(`${path}?page=${i + 2}&limit=50`))
  );
  const items = [first[key], ...rest.map((r) => r?.[key] || [])].flat();
  return items.map((item) => ({
    url: `${SITE_URL}${toUrl(item)}`,
    lastModified: item.updatedAt || item.createdAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));
};

export default async function sitemap() {
  const [comics, scripts, authors] = await Promise.all([
    collect('/comics', 'comics', (c) => `/comics/${c._id}`),
    collect('/scripts', 'scripts', (s) => `/scripts/${s._id}`),
    collect('/authors', 'authors', (a) => `/authors/${a._id}`),
  ]);

  const staticRoutes = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    changeFrequency: 'weekly',
    priority: route === '/' ? 1 : 0.7,
  }));

  return [...staticRoutes, ...comics, ...scripts, ...authors];
}
