'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import api from '../../../lib/api';
import BookmarkButton from '../../../components/BookmarkButton';
import FollowButton from '../../../components/FollowButton';
import LikeButton from '../../../components/LikeButton';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');

export default function ScriptDetailPage() {
  const { id } = useParams();
  const [script, setScript] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get(`/scripts/${id}`).then((res) => setScript(res.data)).catch(() => setNotFound(true));
  }, [id]);

  if (notFound) return <p className="max-w-3xl mx-auto px-5 py-10 text-muted">Script not found.</p>;
  if (!script) return <p className="max-w-3xl mx-auto px-5 py-10 text-muted">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <p className="text-accent2 font-display tracking-widest text-sm">{script.genre?.toUpperCase()}</p>
      <h1 className="font-display text-4xl mt-1">{script.title}</h1>
      <div className="flex items-center gap-3 mt-1">
        <Link href={`/authors/${script.author?._id}`} className="text-accent2 text-sm hover:underline">
          by {script.author?.name}
        </Link>
        {script.author?._id && <FollowButton authorId={script.author._id} />}
      </div>
      <p className="text-muted mt-4">{script.synopsis}</p>
      <p className="text-xs text-muted mt-2">{script.views} views</p>

      <div className="flex gap-3 mt-6">
        <a
          href={`${API_BASE}${script.fileUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-5 py-3 bg-accent text-ink font-semibold rounded"
        >
          Read Script File
        </a>
        <BookmarkButton scriptId={script._id} />
        <LikeButton scriptId={script._id} />
      </div>
    </div>
  );
}
