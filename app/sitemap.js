import { SITE_URL } from '../lib/site';

const routes = [
  '/',
  '/comics',
  '/scripts',
  '/authors',
  '/search',
  '/contact',
  '/terms',
  '/privacy',
  '/login',
  '/signup',
  '/forgot-password',
];

export default function sitemap() {
  const now = new Date();
  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: route === '/' ? 1 : 0.7,
  }));
}