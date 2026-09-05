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
    });
  };

  useEffect(() => { load(); }, [comicId]);

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
      <div className="flex">
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            onClick={() => rate(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className="cursor-pointer text-lg"
            style={{ color: (hover || myRating || 0) >= n ? '#E63946' : 'rgba(242,240,234,0.2)' }}
          >
            ★
          </span>
        ))}
      </div>
      <span className="text-xs text-muted">
        {average.toFixed(1)} ({count} rating{count !== 1 ? 's' : ''})
      </span>
    </div>
  );
}
