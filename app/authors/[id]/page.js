'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '../../../lib/api';
import ComicCard from '../../../components/ComicCard';
import ScriptCard from '../../../components/ScriptCard';
import FollowButton from '../../../components/FollowButton';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '/api').replace('/api', '');

export default function AuthorProfilePage() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/authors/${id}`).then((res) => setData(res.data));
  }, [id]);

  if (!data) return <p className="max-w-6xl mx-auto px-5 py-10 text-muted">Loading...</p>;

  const { author, comics, scripts } = data;

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <div className="flex items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-panel2 overflow-hidden ink-card shrink-0">
          {author.avatarUrl && (
            <img src={`${API_BASE}${author.avatarUrl}`} alt={author.name} className="w-full h-full object-cover" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl uppercase">{author.name}</h1>
            <FollowButton authorId={author._id} />
          </div>
          <p className="text-muted text-sm">{author.bio || 'No bio yet.'}</p>
        </div>
      </div>

      <h2 className="font-display text-xl mt-10 mb-3">Comics</h2>
      {comics.length === 0 ? (
        <p className="text-muted text-sm">No comics published yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {comics.map((c) => <ComicCard key={c._id} comic={c} />)}
        </div>
      )}

      <h2 className="font-display text-xl mt-10 mb-3">Scripts</h2>
      {scripts.length === 0 ? (
        <p className="text-muted text-sm">No scripts published yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {scripts.map((s) => <ScriptCard key={s._id} script={s} />)}
        </div>
      )}
    </div>
  );
}
