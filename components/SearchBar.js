'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import api from '../lib/api';
import { mediaUrl } from '../lib/site';

export default function SearchBar({ variant = 'desktop', autoFocus = false }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const q = query.trim();
      if (!q) {
        setResults(null);
        setLoading(false);
        setSearched(false);
        return;
      }
      setLoading(true);
      api
        .get('/search', { params: { q } })
        .then((res) => {
          setResults(res.data);
          setSearched(true);
          setOpen(true);
        })
        .catch(() => {
          setResults(null);
          setSearched(true);
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const onDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'Enter') {
        const q = query.trim();
        if (q) {
          setOpen(false);
          router.push(`/search?q=${encodeURIComponent(q)}`);
        }
      }
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('keydown', onDown);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onDown);
      document.removeEventListener('mousedown', onDown);
    };
  }, [query, router]);

  const total =
    results
      ? (results.comics?.length || 0) +
        (results.creators?.length || 0) +
        (results.scripts?.length || 0)
      : 0;

  const compact = variant === 'desktop';

  return (
    <div ref={ref} className="relative w-full">
      <div
        className={`flex items-center gap-2 bg-panel2/60 panel-border rounded-lg transition focus-within:border-accent/60 ${
          compact ? 'px-2.5 h-9 w-56 sm:w-64' : 'px-3 h-11 w-full'
        }`}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted shrink-0"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="search"
          role="searchbox"
          aria-label="Search comics, creators, scripts"
          placeholder="Search manga, creators, genres..."
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setOpen(true)}
          className="flex-1 min-w-0 bg-transparent text-sm text-paper placeholder:text-muted outline-none"
        />
        {loading && (
          <span className="w-3.5 h-3.5 rounded-full border-2 border-accent/30 border-t-accent animate-spin shrink-0" aria-hidden="true" />
        )}
      </div>

      {open && results && (
        <div className="absolute top-full mt-2 w-full sm:w-96 right-0 bg-panel panel-border rounded-lg shadow-card overflow-hidden z-50 max-h-[70vh] overflow-y-auto scrollbar-thin">
          <p className="px-4 py-2 text-xs uppercase tracking-wide text-muted border-b border-border/10">
            {total === 0 ? 'No results' : `${total} result${total === 1 ? '' : 's'} for "`}
            <span className="text-paper font-semibold">{query.trim()}</span>
            {total !== 0 ? `"` : ''}
          </p>

          {total === 0 && searched && (
            <p className="px-4 py-6 text-sm text-muted">
              Nothing found. Try a different title, creator or genre.
            </p>
          )}

          <Group title="Comics" items={results.comics} hrefFor={(c) => `/comics/${c._id}`}>
            {(c) => (
              <SearchRow
                title={c.title}
                subtitle={
                  typeof c.author === 'object' && c.author
                    ? c.author.name
                    : c.author || ''
                }
                img={mediaUrl(c.coverUrl)}
                fallback="M"
              />
            )}
          </Group>

          <Group title="Creators" items={results.creators} hrefFor={(a) => `/authors/${a._id}`}>
            {(a) => <SearchRow title={a.name} subtitle={`${a.seriesCount || 0} series`} img={mediaUrl(a.avatarUrl)} fallback="C" />}
          </Group>

          <Group title="Scripts" items={results.scripts} hrefFor={(s) => `/scripts/${s._id}`}>
            {(s) => (
              <SearchRow
                title={s.title}
                subtitle={
                  typeof s.author === 'object' && s.author ? s.author.name : s.author || ''
                }
                img={null}
                fallback="S"
              />
            )}
          </Group>

          {total > 0 && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push(`/search?q=${encodeURIComponent(query.trim())}`);
              }}
              className="w-full px-4 py-3 text-sm text-accent font-semibold hover:bg-panel2 transition border-t border-border/10 text-left"
            >
              View all results →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Group({ title, items, hrefFor, children }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="border-b border-border/10 last:border-b-0">
      <p className="px-4 py-2 text-[10px] uppercase tracking-widest text-muted">
        {title}
      </p>
      {items.map((item) => (
        <Link
          key={item._id}
          href={hrefFor(item)}
          className="flex items-center gap-3 px-4 py-2.5 hover:bg-panel2 transition text-sm"
        >
          {children(item)}
        </Link>
      ))}
    </div>
  );
}

function SearchRow({ title, subtitle, img, fallback }) {
  return (
    <>
      {img ? (
        <Image
          src={img}
          alt=""
          width={32}
          height={32}
          className="w-8 h-8 rounded object-cover shrink-0"
        />
      ) : (
        <span className="w-8 h-8 rounded bg-panel2 flex items-center justify-center font-display text-xs text-accent shrink-0">
          {fallback}
        </span>
      )}
      <span className="min-w-0">
        <span className="block truncate text-paper font-medium">{title}</span>
        {subtitle && <span className="block text-xs text-muted truncate">{subtitle}</span>}
      </span>
    </>
  );
}