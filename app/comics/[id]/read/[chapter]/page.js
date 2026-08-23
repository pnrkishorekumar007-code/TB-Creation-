'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import api from '../../../../../lib/api';
import { useAuth } from '../../../../../lib/AuthContext';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '/api').replace('/api', '');

export default function ReaderPage() {
  const { id, chapter } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [chapterData, setChapterData] = useState(null);

  useEffect(() => {
    api.get(`/comics/${id}`).then((res) => {
      setData(res.data);
      const found = res.data.chapters.find((c) => c._id === chapter);
      setChapterData(found);
    });
  }, [id, chapter]);

  useEffect(() => {
    if (user && chapterData) {
      api.post('/history', { comicId: id, chapterId: chapter }).catch(() => {});
    }
  }, [user, chapterData, id, chapter]);

  if (!data || !chapterData) {
    return <p className="max-w-3xl mx-auto px-5 py-10 text-muted">Loading chapter...</p>;
  }

  const chapters = data.chapters;
  const idx = chapters.findIndex((c) => c._id === chapter);
  const prev = chapters[idx - 1];
  const next = chapters[idx + 1];

  return (
    <div className="bg-ink min-h-screen">
      <div className="max-w-3xl mx-auto px-5 py-8">
        <Link href={`/comics/${id}`} className="text-sm text-accent hover:underline">
          ← Back to {data.comic.title}
        </Link>
        <h1 className="font-display text-2xl mt-2">{chapterData.title}</h1>

        {chapterData.locked ? (
          <div className="ink-card rounded-lg p-10 mt-8 text-center">
            <p className="font-display text-2xl mb-2">Keep Reading with a Free Account</p>
            <p className="text-muted max-w-sm mx-auto mb-6">
              The first chapter is free for everyone. Sign up or log in to unlock every chapter,
              save your progress, and follow your favorite authors.
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/signup" className="px-5 py-3 bg-accent text-ink font-semibold rounded-md glow-btn">
                Sign Up Free
              </Link>
              <Link href="/login" className="px-5 py-3 border border-paper/20 rounded-md hover:border-accent transition">
                Log In
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 mt-6">
            {chapterData.pageImages.map((src, i) => (
              <img
                key={i}
                src={`${API_BASE}${src}`}
                alt={`Page ${i + 1}`}
                className="w-full rounded panel-border border"
              />
            ))}
          </div>
        )}

        <div className="flex justify-between mt-10 pb-10">
          {prev ? (
            <Link href={`/comics/${id}/read/${prev._id}`} className="px-4 py-2 ink-card rounded text-sm">
              ← Previous
            </Link>
          ) : <span />}
          {next ? (
            <Link href={`/comics/${id}/read/${next._id}`} className="px-4 py-2 bg-accent text-ink rounded text-sm font-semibold">
              Next Chapter →
            </Link>
          ) : <span />}
        </div>
      </div>
    </div>
  );
}
