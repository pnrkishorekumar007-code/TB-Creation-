'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/AuthContext';
import api from '../../lib/api';
import ComicCard from '../../components/ComicCard';
import ScriptCard from '../../components/ScriptCard';

export default function BookmarksPage() {
  const { user, loading } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!user) return;
    api.get('/bookmarks/mine').then((res) => setBookmarks(res.data));
    api.get('/history/continue').then((res) => setHistory(res.data));
  }, [user]);

  if (loading) return null;
  if (!user) return <p className="max-w-6xl mx-auto px-5 py-10 text-muted">Log in to see your bookmarks.</p>;

  const comicBookmarks = bookmarks.filter((b) => b.comic);
  const scriptBookmarks = bookmarks.filter((b) => b.script);

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <h1 className="font-display text-3xl mb-8 uppercase">My Library</h1>

      <h2 className="font-display text-xl mb-3">Continue Reading</h2>
      {history.length === 0 ? (
        <p className="text-muted text-sm mb-10">Start reading a comic and it'll show up here.</p>
      ) : (
        <div className="flex flex-col gap-2 mb-10">
          {history.map((h) => (
            <Link
              key={h._id}
              href={`/comics/${h.comic._id}/read/${h.lastChapter._id}`}
              className="ink-card rounded px-4 py-3 flex justify-between items-center text-sm"
            >
              <span>{h.comic.title} — {h.lastChapter.title}</span>
              <span className="text-accent text-xs">Resume →</span>
            </Link>
          ))}
        </div>
      )}

      <h2 className="font-display text-xl mb-3">Bookmarked Comics</h2>
      {comicBookmarks.length === 0 ? (
        <p className="text-muted text-sm mb-8">No bookmarked comics yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-10">
          {comicBookmarks.map((b) => <ComicCard key={b._id} comic={b.comic} />)}
        </div>
      )}

      <h2 className="font-display text-xl mb-3">Bookmarked Scripts</h2>
      {scriptBookmarks.length === 0 ? (
        <p className="text-muted text-sm">No bookmarked scripts yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {scriptBookmarks.map((b) => <ScriptCard key={b._id} script={b.script} />)}
        </div>
      )}
    </div>
  );
}
