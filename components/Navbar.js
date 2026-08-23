'use client';

import Link from 'next/link';
import { useAuth } from '../lib/AuthContext';
import NotificationBell from './NotificationBell';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '/api').replace('/api', '');

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-ink/95 backdrop-blur panel-border border-b">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link href="/" className="font-display text-2xl tracking-wide text-paper uppercase">
          TB<span className="text-accent">Creation</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-muted font-medium">
          <Link href="/comics" className="hover:text-paper transition">Comics</Link>
          <Link href="/scripts" className="hover:text-paper transition">Scripts</Link>
          <Link href="/contact" className="hover:text-paper transition">Contact</Link>
          {user && (
            <Link href="/feed" className="hover:text-paper transition">Feed</Link>
          )}
          {user && (
            <Link href="/bookmarks" className="hover:text-paper transition">Bookmarks</Link>
          )}
          {user && (user.role === 'author' || user.role === 'admin') && (
            <Link href="/dashboard" className="hover:text-paper transition">Dashboard</Link>
          )}
          {user?.role === 'admin' && (
            <Link href="/admin" className="hover:text-paper transition">Admin</Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <NotificationBell />
          {user ? (
            <>
              <Link
                href="/profile"
                className="hidden sm:flex items-center gap-2 group"
                title={user.name}
              >
                <span className="w-7 h-7 rounded-full overflow-hidden shrink-0 bg-panel2 panel-border flex items-center justify-center text-xs font-bold text-paper uppercase group-hover:border-accent/60 transition">
                  {user.avatarUrl ? (
                    <img
                      src={`${API_BASE}${user.avatarUrl}`}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (user.name || '?').charAt(0)
                  )}
                </span>
                <span className="text-sm text-paper font-medium group-hover:text-accent transition max-w-[140px] truncate">
                  {user.name}
                </span>
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
              <Link
                href="/signup"
                className="text-sm px-4 py-1.5 bg-accent text-ink font-bold rounded-md glow-btn transition"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
