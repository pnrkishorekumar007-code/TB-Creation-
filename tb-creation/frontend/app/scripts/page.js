'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api';
import ScriptCard from '../../components/ScriptCard';

export default function ScriptsPage() {
  const [scripts, setScripts] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    api
      .get('/scripts', { params: { page, ...(search ? { search } : {}) } })
      .then((res) => {
        setScripts(res.data.scripts);
        setPages(res.data.pages || 1);
      })
      .catch(() => setError('Could not load scripts. Is the backend running?'))
      .finally(() => setLoading(false));
  }, [search, page]);

  useEffect(() => setPage(1), [search]);

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <h1 className="font-display text-3xl mb-6 uppercase">Browse Scripts</h1>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search scripts by title..."
        className="w-full sm:w-96 bg-panel panel-border rounded px-4 py-2 text-sm outline-none focus:border-accent mb-8"
      />

      {loading ? (
        <p className="text-muted">Loading scripts...</p>
      ) : error ? (
        <p className="text-accent">{error}</p>
      ) : scripts.length === 0 ? (
        <p className="text-muted">No scripts found.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {scripts.map((s) => <ScriptCard key={s._id} script={s} />)}
          </div>

          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-4 py-2 ink-card rounded text-sm disabled:opacity-30">← Prev</button>
              <span className="px-4 py-2 text-sm text-muted">Page {page} of {pages}</span>
              <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="px-4 py-2 ink-card rounded text-sm disabled:opacity-30">Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
