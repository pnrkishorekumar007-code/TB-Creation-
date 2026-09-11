'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/AuthContext';
import NotificationBell from './NotificationBell';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');

const NAV_LINKS = [
  { href: '/comics', label: 'Comics' },
  { href: '/scripts', label: 'Scripts' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const authedLinks = [
    ...(user ? [{ href: '/feed', label: 'Feed' }] : []),
    ...(user ? [{ href: '/bookmarks', label: 'Bookmarks' }] : []),
    ...(user && (user.role === 'author' || user.role === 'admin') ? [{ href: '/dashboard', label: 'Dashboard' }] : []),
    ...(user?.role === 'admin' ? [{ href: '/admin', label: 'Admin' }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-ink/95 backdrop-blur panel-border border-b">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link href="/" className="font-display text-2xl tracking-wide text-paper uppercase" onClick={closeMenu}>
          TB<span className="text-accent">Creation</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-muted font-medium">
          {[...NAV_LINKS, ...authedLinks].map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-paper transition">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3">
            <NotificationBell />
            {user ? (
              <>
                <Link href="/profile" className="flex items-center gap-2 text-sm text-paper font-medium hover:text-accent transition">
                  <span className="w-7 h-7 rounded-full bg-panel2 border border-paper/10 overflow-hidden flex items-center justify-center text-xs font-bold uppercase">
                    {user.avatarUrl ? (
                      <img src={`${API_BASE}${user.avatarUrl}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      user.name?.[0] || '?'
                    )}
                  </span>
                  {user.name}
                </Link>
                <button
                  onClick={logout}
                  className="text-sm px-3.5 py-1.5 border border-accent text-accent rounded-md hover:bg-accent hover:text-ink transition font-semibold"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-muted hover:text-paper transition font-medium">
                  Log in
                </Link>
                <Link href="/signup" className="text-sm px-4 py-1.5 bg-accent text-ink font-bold rounded-md glow-btn transition">
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile: notification bell always visible, plus hamburger toggle */}
          <div className="sm:hidden flex items-center gap-3">
            {user && <NotificationBell />}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
              className="w-9 h-9 flex items-center justify-center rounded-md border border-paper/15 text-paper"
            >
              {menuOpen ? (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 2L16 16M16 2L2 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 4.5H16M2 9H16M2 13.5H16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="sm:hidden panel-border border-t bg-ink px-5 py-4 flex flex-col gap-1">
          {[...NAV_LINKS, ...authedLinks].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              className="py-2.5 text-sm text-muted hover:text-paper transition border-b border-white/5 last:border-0"
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-3 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  href="/profile"
                  onClick={closeMenu}
                  className="flex items-center gap-2 py-2 text-sm text-paper font-medium"
                >
                  <span className="w-7 h-7 rounded-full bg-panel2 border border-paper/10 overflow-hidden flex items-center justify-center text-xs font-bold uppercase">
                    {user.avatarUrl ? (
                      <img src={`${API_BASE}${user.avatarUrl}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      user.name?.[0] || '?'
                    )}
                  </span>
                  {user.name}
                </Link>
                <button
                  onClick={() => { logout(); closeMenu(); }}
                  className="text-sm px-4 py-2.5 border border-accent text-accent rounded-md font-semibold text-center"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={closeMenu} className="text-sm px-4 py-2.5 border border-paper/15 rounded-md text-center">
                  Log in
                </Link>
                <Link href="/signup" onClick={closeMenu} className="text-sm px-4 py-2.5 bg-accent text-ink font-bold rounded-md text-center">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
