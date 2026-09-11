'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/AuthContext';
import api from '../lib/api';

export default function FollowButton({ authorId }) {
  const { user } = useAuth();
  const router = useRouter();
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user || user.id === authorId) return;
    api.get(`/follows/status/${authorId}`).then((res) => setFollowing(res.data.following));
  }, [user, authorId]);

  if (user?.id === authorId) return null;

  const toggle = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setBusy(true);
    try {
      const res = await api.post('/follows/toggle', { authorId });
      setFollowing(res.data.following);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`px-4 py-2 rounded text-sm font-semibold transition ${
        following ? 'bg-panel2 text-paper border border-paper/20' : 'bg-accent text-ink'
      }`}
    >
      {following ? 'Following' : '+ Follow'}
    </button>
  );
}
