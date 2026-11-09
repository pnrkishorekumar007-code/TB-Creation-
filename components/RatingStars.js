'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/AuthContext';
import api from '../lib/api';

export default function RatingStars({ comicId }) {
  const { user } = useAuth();
  const router = useRouter();
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [myRating, setMyRating] = useState(null);
  const [hover, setHover] = useState(0);

  const load = () => {
    api.get(`/ratings/comic/${comicId}`).then((res) => {
      setAverage(res.data.average);
      setCount(res.data.count);
      setMyRating(res.data.myRating);
    }).catch(() => {});
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comicId]);

  const rate = async (value) => {
    if (!user) {
      router.push('/login');
      return;
    }
    await api.post('/ratings', { comicId, value });
    load();
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex" role="group" aria-label="Rate this comic">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            onClick={() => rate(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onFocus={() => setHover(n)}
            onBlur={() => setHover(0)}
            aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
            aria-pressed={myRating === n}
            className={`cursor-pointer text-xl leading-none px-0.5 transition-colors ${
              (hover || myRating || 0) >= n ? 'text-accent' : 'text-border/20'
            }`}
          >
            ★
          </button>
        ))}
      </div>
      <span className="text-xs text-muted">
        {average.toFixed(1)} ({count} rating{count !== 1 ? 's' : ''})
      </span>
    </div>
  );
}
