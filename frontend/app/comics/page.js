'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api';
import ComicCard from '../../components/ComicCard';

const GENRES = ['All', 'Action', 'Romance', 'Fantasy', 'Slice of Life', 'Horror', 'Comedy', 'General'];

export default function ComicsPage() {
  const [comics, setComics] = useState([]);
  const [genre, setGenre] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = { page };
    if (genre !== 'All') params.genre = genre;
    if (search) params.search = search;
    if (sort === 'popular') params.sort = 'popular';

    setLoading(true);
    setError('');
    api
      .get('/comics', { params })
      .then((res) => {
        setComics(res.data.comics);
        setPages(res.data.pages || 1);
      })
      .catch(() => setError('Could not load comics. Is the backend running?'))
      .finally(() => setLoading(false));
  }, [genre, search, sort, page]);

  useEffect(() => setPage(1), [genre, search, sort]);

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <h1 className="font-display text-3xl mb-6 uppercase">Browse Comics</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title..."
          className="flex-1 bg-panel panel-border rounded px-4 py-2 text-sm outline-none focus:border-accent"
        />
        <select value={genre} onChange={(e) => setGenre(e.target.value)} className="bg-panel panel-border rounded px-4 py-2 text-sm">
          {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-panel panel-border rounded px-4 py-2 text-sm">
          <option value="newest">Newest</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>

      {loading ? (
        <p className="text-muted">Loading comics...</p>
      ) : error ? (
        <p className="text-accent">{error}</p>
      ) : comics.length === 0 ? (
        <p className="text-muted">No comics found. Try a different filter.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
            {comics.map((c) => <ComicCard key={c._id} comic={c} />)}
          </div>

          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 ink-card rounded text-sm disabled:opacity-30"
              >
                ← Prev
              </button>
              <span className="px-4 py-2 text-sm text-muted">Page {page} of {pages}</span>
              <button
                disabled={page >= pages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 ink-card rounded text-sm disabled:opacity-30"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
