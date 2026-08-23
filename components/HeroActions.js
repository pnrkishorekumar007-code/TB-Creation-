'use client';

import Link from 'next/link';
import { useAuth } from '../lib/AuthContext';

export default function HeroActions() {
  const { user } = useAuth();

  let secondary = { href: '/signup', label: 'Become an Author' };
  if (user && (user.role === 'author' || user.role === 'admin')) {
    secondary = { href: '/dashboard', label: 'Go to Dashboard' };
  } else if (user) {
    secondary = { href: '/profile', label: 'My Profile' };
  }

  return (
    <>
      <Link href="/comics" className="glow-btn px-6 py-3.5 bg-accent text-ink font-bold rounded-md uppercase tracking-wide text-sm">
        Start Reading
      </Link>
      <Link href={secondary.href} className="outline-btn px-6 py-3.5 border border-paper/20 rounded-md hover:border-accent transition uppercase tracking-wide text-sm font-semibold">
        {secondary.label}
      </Link>
    </>
  );
}
