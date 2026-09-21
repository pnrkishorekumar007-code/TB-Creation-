'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import api from '../../lib/api';
import { mediaUrl } from '../../lib/site';
import ComicCardSkeleton from '../../components/ComicCardSkeleton';

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!q.trim()) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    api
      .get('/search', { params: { q } })
      .then((res) => setData(res.data))
      .catch(() => setError('Could not search right now. Please try again.'))
      .finally(() => setLoading(false));
  }, [q]);

  const comics = data?.comics || [];
  const creators = data?.creators || [];
  const scripts = data?.scripts || [];
  const total = comics.length + creators.length + scripts.length;

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-1">Search</p>
        <h1 className="font-display text-3xl sm:text-4xl mb-2 uppercase">
          {q.trim() ? (
            <>
              Results for &quot;<span className="text-accent">{q.trim()}</span>&quot;
            </>
          ) : (
            'Search TB Creation'
          )}
        </h1>
        <p className="text-muted text-sm">Find comics, creators, and scripts.</p>
      </div>

      <form action="/search" method="get" className="flex gap-2 mb-10 max-w-xl">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search..."
          aria-label="Search"
          className="flex-1 min-w-0 bg-panel2/60 panel-border rounded-lg px-4 py-2.5 text-sm outline-none placeholder:text-muted focus:border-accent"
        />
        <button
          type="submit"
          className="px-4 py-2.5 bg-accent text-ink text-sm font-bold rounded-md glow-btn transition"
        >
          Search
        </button>
      </form>

      {!q.trim() ? (
        <p className="text-sm text-muted">Type a title, creator, or genre above to search.</p>
      ) : loading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="ink-card rounded-lg p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-panel2 skeleton" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded bg-panel2 skeleton" />
                <div className="h-3 w-1/2 rounded bg-panel2 skeleton" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="ink-card rounded-lg p-10 text-center">
          <p className="text-sm text-muted">{error}</p>
        </div>
      ) : total === 0 ? (
        <div className="ink-card rounded-lg p-10 text-center border-dashed border-paper/10 border">
          <p className="font-display text-xl uppercase mb-2">Nothing found</p>
          <p className="text-sm text-muted">Try a different title, creator, or genre.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <SearchGroup title={`Comics (${comics.length})`} items={comics}
            hrefFor={(c) => `/comics/${c._id}`}
            metaFor={(c) => (typeof c.author === 'object' && c.author ? c.author.name : '')}
            imgFor={(c) => mediaUrl(c.coverUrl)} fallback="C"
          />
          <SearchGroup title={`Creators (${creators.length})`} items={creators}
            hrefFor={(a) => `/authors/${a._id}`}
            metaFor={(a) => `${a.seriesCount || 0} series`}
            imgFor={(a) => mediaUrl(a.avatarUrl)} fallback="P" round
          />
          <SearchGroup title={`Scripts (${scripts.length})`} items={scripts}
            hrefFor={(s) => `/scripts/${s._id}`}
            metaFor={(s) => (typeof s.author === 'object' && s.author ? s.author.name : '')}
            imgFor={() => ''} fallback="S"
          />
        </div>
      )}
    </div>
  );
}

function SearchGroup({ title, items, hrefFor, metaFor, imgFor, fallback, round = false }) {
  if (items && items.length === 0) return null;
  return (
    <section>
      <h2 className="font-display text-lg uppercase mb-3">{title}</h2>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <Link
            key={item._id}
            href={hrefFor(item)}
            className="ink-card rounded-lg px-4 py-3 flex items-center gap-3 text-sm hover:border-accent/40 transition"
          >
            <span className={`w-11 h-11 ${round ? 'rounded-full' : 'rounded'} bg-panel2 shrink-0 overflow-hidden flex items-center justify-center relative`}>
              {imgFor(item) ? (
                <Image
                  src={imgFor(item)}
                  alt=""
                  width={44}
                  height={44}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-display text-accent">{fallback}</span>
              )}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-semibold">{item.title || item.name}</span>
              {metaFor(item) && (
                <span className="block text-xs text-muted truncate">{metaFor(item)}</span>
              )}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchResults />
    </Suspense>
  );
}