'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api';
import ComicCard from '../../components/ComicCard';
import ComicCardSkeleton from '../../components/ComicCardSkeleton';

const GENRES = ['All', 'Action', 'Romance', 'Fantasy', 'Slice of Life', 'Horror', 'Comedy', 'General'];

const SORTS = [
  { value: 'newest', label: "What's New" },
  { value: 'updated', label: 'Recently Updated' },
  { value: 'popular', label: 'Popular' },
];

const STATUSES = [
  { value: 'all', label: 'Any Status' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
];

export default function ComicsPage() {
  const [comics, setComics] = useState([]);
  const [genre, setGenre] = useState('All');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const params = { page };
    if (genre !== 'All') params.genre = genre;
    if (status !== 'all') params.status = status;
    if (search) params.search = search;
    if (sort !== 'newest') params.sort = sort;

    setLoading(true);
    setError('');
    api
      .get('/comics', { params })
      .then((res) => {
        setComics(res.data.comics);
        setPages(res.data.pages || 1);
        setTotal(res.data.total || 0);
      })
      .catch(() => setError('Could not load comics. Is the backend running?'))
      .finally(() => setLoading(false));
  }, [genre, status, search, sort, page, refreshKey]);

  const filtered = search || genre !== 'All' || status !== 'all';

  const resetFilters = () => {
    setGenre('All');
    setStatus('all');
    setSearch('');
    setSort('newest');
    setPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-1">Browse</p>
        <h1 className="font-display text-3xl sm:text-4xl mb-2 uppercase">Discover Comics</h1>
        <p className="text-muted text-sm">Original series from TB Creation creators.</p>
      </div>

      {/* Search + sort + status */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by title, genre, tag..."
          aria-label="Search comics"
          className="flex-1 min-w-0 bg-panel2/60 panel-border rounded-lg px-4 py-2.5 text-sm outline-none placeholder:text-muted focus:border-accent"
        />
        <div className="flex gap-2">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by status"
            className="bg-panel panel-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-accent"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            aria-label="Sort comics"
            className="bg-panel panel-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-accent"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Genre chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-thin -mx-1 px-1" role="group" aria-label="Filter by genre">
        {GENRES.map((g) => {
          const active = genre === g;
          return (
            <button
              key={g}
              type="button"
              onClick={() => {
                setGenre(g);
                setPage(1);
              }}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm border transition ${
                active
                  ? 'bg-accent text-ink font-semibold border-accent'
                  : 'bg-panel panel-border text-muted hover:text-paper hover:border-accent/60'
              }`}
            >
              {g}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <ComicCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="ink-card rounded-lg p-10 text-center">
          <p className="text-sm text-muted mb-4">{error}</p>
          <button
            type="button"
            onClick={() => setRefreshKey((k) => k + 1)}
            className="px-5 py-2.5 bg-accent text-ink text-sm font-bold rounded-md glow-btn transition"
          >
            Retry
          </button>
        </div>
      ) : comics.length === 0 ? (
        <div className="ink-card rounded-lg p-10 text-center border-dashed border-paper/10 border">
          <p className="font-display text-xl uppercase mb-2">Nothing here yet</p>
          <p className="text-sm text-muted mb-6">
            {filtered
              ? 'No comics match those filters — try a different combination.'
              : 'No comic series yet. The shelf is waiting for your first story.'}
          </p>
          {filtered && (
            <button
              type="button"
              onClick={resetFilters}
              className="px-5 py-2.5 bg-accent text-ink text-sm font-bold rounded-md glow-btn transition"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-xs text-muted mb-4">{total} series</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
            {comics.map((c) => (
              <ComicCard key={c._id} comic={c} />
            ))}
          </div>

          {pages > 1 && (
            <nav className="flex justify-center items-center gap-3 mt-10" aria-label="Pagination">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 ink-card rounded-lg text-sm disabled:opacity-30 hover:border-accent/40 transition"
              >
                ← Prev
              </button>
              <span className="px-4 py-2 text-sm text-muted">
                Page {page} of {pages}
              </span>
              <button
                disabled={page >= pages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 ink-card rounded-lg text-sm disabled:opacity-30 hover:border-accent/40 transition"
              >
                Next →
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}