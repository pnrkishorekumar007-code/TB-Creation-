'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/AuthContext';
import api from '../lib/api';

export default function BookmarkButton({ comicId, scriptId, initialBookmarked = false }) {
  const { user } = useAuth();
  const router = useRouter();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setBusy(true);
    try {
      const res = await api.post('/bookmarks/toggle', { comicId, scriptId });
      setBookmarked(res.data.bookmarked);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`px-4 py-2 rounded text-sm font-semibold border transition ${
        bookmarked ? 'bg-accent text-ink border-accent' : 'border-paper/20 text-paper hover:border-accent'
      }`}
    >
      {bookmarked ? '★ Bookmarked' : '☆ Bookmark'}
    </button>
  );
}
