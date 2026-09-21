'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api';
import ScriptCard from '../../components/ScriptCard';
import ScriptCardSkeleton from '../../components/ScriptCardSkeleton';

const GENRES = ['All', 'Action', 'Romance', 'Fantasy', 'Slice of Life', 'Horror', 'Comedy', 'General'];

export default function ScriptsPage() {
  const [scripts, setScripts] = useState([]);
  const [genre, setGenre] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const params = { page };
    if (search) params.search = search;
    if (genre !== 'All') params.genre = genre;

    setLoading(true);
    setError('');
    api
      .get('/scripts', { params })
      .then((res) => {
        setScripts(res.data.scripts);
        setPages(res.data.pages || 1);
        setTotal(res.data.total || 0);
      })
      .catch(() => setError('Could not load scripts. Is the backend running?'))
      .finally(() => setLoading(false));
  }, [genre, search, page, refreshKey]);

  const filtered = search || genre !== 'All';

  const resetFilters = () => {
    setGenre('All');
    setSearch('');
    setPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-1">Writers Room</p>
        <h1 className="font-display text-3xl sm:text-4xl mb-2 uppercase">Scripts</h1>
        <p className="text-muted text-sm">Readable scripts and pitches — the blueprints behind great comics.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search scripts by title..."
          aria-label="Search scripts"
          className="flex-1 min-w-0 bg-panel2/60 panel-border rounded-lg px-4 py-2.5 text-sm outline-none placeholder:text-muted focus:border-accent"
        />
        <select
          value={genre}
          onChange={(e) => {
            setGenre(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by genre"
          className="bg-panel panel-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-accent"
        >
          {GENRES.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {Array.from({ length: 9 }).map((_, i) => (
            <ScriptCardSkeleton key={i} />
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
      ) : scripts.length === 0 ? (
        <div className="ink-card rounded-lg p-10 text-center border-dashed border-paper/10 border">
          <p className="font-display text-xl uppercase mb-2">Nothing here yet</p>
          <p className="text-sm text-muted mb-6">
            {filtered
              ? 'No scripts match those filters — try a different combination.'
              : 'No scripts yet. Writers, the page is yours.'}
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
          <p className="text-xs text-muted mb-4">{total} scripts</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {scripts.map((s) => (
              <ScriptCard key={s._id} script={s} />
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