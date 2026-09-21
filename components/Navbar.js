'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/AuthContext';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';
import SearchBar from './SearchBar';
import { mediaUrl } from '../lib/site';

const PRIMARY_LINKS = [
  { href: '/comics', label: 'Discover' },
  { href: '/scripts', label: 'Scripts' },
  { href: '/authors', label: 'Creators' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeButtonRef = useRef(null);

  const isAuthor =
    user && (user.role === 'author' || user.role === 'admin');

  const publishHref = !user
    ? '/signup?role=author'
    : isAuthor
      ? '/dashboard/upload-comic'
      : '/dashboard';

  const publishLabel = !isAuthor ? 'Publish' : 'Publish';

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      const onKey = (e) => {
        if (e.key === 'Escape') setMenuOpen(false);
      };
      document.addEventListener('keydown', onKey);
      closeButtonRef.current?.focus();
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', onKey);
      };
    }
    return undefined;
  }, [menuOpen]);

  const navLinkClass = (href, mobile = false) =>
    `transition ${mobile ? 'px-3 py-2.5 rounded-md text-paper text-base' : 'text-sm text-muted hover:text-paper'} ${
      pathname === href || (href !== '/comics' && pathname.startsWith(href))
        ? 'text-accent'
        : ''
    } font-medium`;

  return (
    <header className="sticky top-0 z-40 bg-ink/90 backdrop-blur panel-border border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-3">
        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          className="lg:hidden p-2 -ml-2 rounded-md text-paper hover:text-accent transition"
        >
          {menuOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Logo */}
        <Link
          href="/"
          className="font-display text-xl sm:text-[1.7rem] tracking-wide text-paper uppercase shrink-0"
          aria-label="TB Creation home"
        >
          TB<span className="text-accent">Creation</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-6 mx-auto" aria-label="Primary">
          {PRIMARY_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={navLinkClass(l.href)}>
              {l.label}
            </Link>
          ))}
          {user && (
            <Link href="/feed" className={navLinkClass('/feed')}>
              Feed
            </Link>
          )}
          {user && (
            <Link href="/bookmarks" className={navLinkClass('/bookmarks')}>
              Library
            </Link>
          )}
          {isAuthor && (
            <Link href="/dashboard" className={navLinkClass('/dashboard')}>
              Dashboard
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link href="/admin" className={navLinkClass('/admin')}>
              Admin
            </Link>
          )}
        </nav>

        {/* Desktop search */}
        <div className="hidden xl:block">
          <SearchBar variant="desktop" />
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <NotificationBell />
          {user && (
            <Link
              href="/profile"
              title={user.name}
              className="hidden sm:flex items-center gap-2 group shrink-0"
            >
              <span className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 bg-panel2 panel-border flex items-center justify-center text-xs font-bold text-paper uppercase group-hover:border-accent/60 transition">
                {user.avatarUrl ? (
                  <Image
                    src={mediaUrl(user.avatarUrl)}
                    alt={user.name}
                    fill
                    sizes="28px"
                    className="object-cover"
                  />
                ) : (
                  (user.name || '?').charAt(0)
                )}
              </span>
            </Link>
          )}

          {user ? (
            <>
              <Link
                href={publishHref}
                className="hidden sm:inline-flex text-sm px-4 py-2 bg-accent text-ink font-bold rounded-md glow-btn transition"
              >
                {publishLabel}
              </Link>
              <button
                onClick={logout}
                className="hidden sm:inline-flex text-sm px-3 py-2 border border-border/20 text-muted hover:text-paper hover:border-accent/60 rounded-md transition font-medium"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline-flex text-sm text-muted hover:text-paper transition font-medium"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="hidden sm:inline-flex text-sm px-4 py-2 bg-accent text-ink font-bold rounded-md glow-btn transition"
              >
                Sign up
              </Link>
            </>
          )}

          {/* Mobile actions: the drawer carries the full nav (Publish, Log out),
              so the header keeps only a compact Publish CTA for logged-out
              visitors. This is what previously overflowed 320-375px screens. */}
          {!user && (
            <Link
              href={publishHref}
              className="sm:hidden text-xs px-2.5 py-1.5 bg-accent text-ink font-bold rounded-md whitespace-nowrap"
            >
              {publishLabel}
            </Link>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 z-40" aria-hidden="true">
          <div
            className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
            onClick={closeMenu}
          />
          <div
            id="mobile-nav"
            role="dialog"
            aria-label="Site menu"
            className="absolute right-0 top-0 bottom-0 w-full max-w-xs bg-panel panel-border border-l shadow-card overflow-y-auto scrollbar-thin"
          >
            <div className="p-4 border-b border-border/10">
              <SearchBar variant="mobile" autoFocus={false} />
            </div>
            <nav className="p-3 flex flex-col gap-1" aria-label="Mobile">
              {PRIMARY_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className={navLinkClass(l.href, true)}>
                  {l.label}
                </Link>
              ))}
              {user ? (
                <>
                  <span className="px-3 py-2 text-xs uppercase tracking-widest text-muted">
                    {user.name}
                  </span>
                  <Link href="/feed" className={navLinkClass('/feed', true)}>Feed</Link>
                  <Link href="/bookmarks" className={navLinkClass('/bookmarks', true)}>My Library</Link>
                  <Link href="/profile" className={navLinkClass('/profile', true)}>Profile</Link>
                  {isAuthor && (
                    <Link href="/dashboard" className={navLinkClass('/dashboard', true)}>Dashboard</Link>
                  )}
                  {user?.role === 'admin' && (
                    <Link href="/admin" className={navLinkClass('/admin', true)}>Admin</Link>
                  )}
                  <Link href={publishHref} className={navLinkClass(publishHref, true)}>Publish</Link>
                </>
              ) : (
                <>
                  <Link href="/login" className={navLinkClass('/login', true)}>Log in</Link>
                  <Link href="/signup" className={navLinkClass('/signup', true)}>Sign up</Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}