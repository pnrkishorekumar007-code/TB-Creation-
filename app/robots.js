import { SITE_URL } from '../lib/site';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/admin', '/profile', '/bookmarks', '/feed', '/search'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}