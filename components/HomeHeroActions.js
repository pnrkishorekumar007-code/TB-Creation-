'use client';

import Link from 'next/link';
import { useAuth } from '../lib/AuthContext';

export default function HomeHeroActions({ type = 'hero' }) {
  const { user } = useAuth();
  const isAuthor = user && (user.role === 'author' || user.role === 'admin');

  const publishHref = !user
    ? '/signup?role=author'
    : isAuthor
      ? '/dashboard/upload-comic'
      : '/dashboard';

  const primary =
    type === 'empty'
      ? {
          href: isAuthor ? '/dashboard/upload-comic' : '/signup?role=author',
          label: isAuthor ? 'Publish a Series' : 'Publish Your First Series',
        }
      : type === 'cta'
        ? { href: publishHref, label: isAuthor ? 'Go to Dashboard' : 'Start Publishing' }
        : { href: '/comics', label: 'Start Reading' };

  const secondary =
    type === 'empty'
      ? { href: '/comics', label: 'Browse Comics' }
      : type === 'cta'
        ? { href: '/comics', label: 'Explore Stories' }
        : { href: publishHref, label: 'Publish Your Story' };

  return (
    <>
      <Link
        href={primary.href}
        className="glow-btn px-6 py-3.5 bg-accent text-ink font-bold rounded-md uppercase tracking-wide text-sm"
      >
        {primary.label}
      </Link>
      <Link
        href={secondary.href}
        className="outline-btn px-6 py-3.5 border border-paper/20 rounded-md hover:border-accent transition uppercase tracking-wide text-sm font-semibold"
      >
        {secondary.label}
      </Link>
    </>
  );
}