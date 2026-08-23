'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/AuthContext';
import api from '../lib/api';

export default function LikeButton({ comicId, scriptId }) {
  const { user } = useAuth();
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/likes/status', { params: comicId ? { comicId } : { scriptId } }).then((res) => {
      setLiked(res.data.liked);
      setCount(res.data.count);
    });
  }, [comicId, scriptId]);

  const toggle = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setBusy(true);
    try {
      const res = await api.post('/likes/toggle', { comicId, scriptId });
      setLiked(res.data.liked);
      setCount(res.data.count);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`px-4 py-2 rounded text-sm font-semibold border transition ${
        liked ? 'bg-accent text-ink border-accent' : 'border-paper/20 text-paper hover:border-accent'
      }`}
    >
      {liked ? '♥' : '♡'} {count}
    </button>
  );
}
