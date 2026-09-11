'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/AuthContext';
import api from '../../lib/api';

export default function FeedPage() {
  const { user, loading } = useAuth();
  const [chapters, setChapters] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.get('/feed').then((res) => setChapters(res.data)).finally(() => setFetching(false));
  }, [user]);

  if (loading) return null;
  if (!user) return <p className="max-w-4xl mx-auto px-5 py-10 text-muted">Log in to see your feed.</p>;

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <h1 className="font-display text-3xl mb-2 uppercase">Your Feed</h1>
      <p className="text-muted mb-8">New chapters from authors you follow.</p>

      {fetching ? (
        <p className="text-muted">Loading...</p>
      ) : chapters.length === 0 ? (
        <p className="text-muted text-sm">
          Nothing yet — follow an author from their profile or a comic page to see their new chapters here.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {chapters.map((ch) => (
            <Link
              key={ch._id}
              href={`/comics/${ch.comic._id}/read/${ch._id}`}
              className="ink-card rounded px-4 py-3 flex justify-between items-center text-sm"
            >
              <div>
                <p>{ch.comic.title} — {ch.title}</p>
                <p className="text-xs text-muted mt-1">by {ch.comic.author?.name}</p>
              </div>
              <span className="text-muted text-xs">{new Date(ch.publishAt).toLocaleDateString()}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
