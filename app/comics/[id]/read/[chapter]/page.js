'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../../../lib/api';
import { useAuth } from '../../../../../lib/AuthContext';
import { mediaUrl } from '../../../../../lib/site';

export default function ReaderPage() {
  const { id, chapter } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [chapterData, setChapterData] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    api
      .get(`/comics/${id}`)
      .then((res) => {
        setData(res.data);
        setChapterData(res.data.chapters.find((c) => c._id === chapter) || null);
      })
      .catch(() => setData(null));
  }, [id, chapter]);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    window.scrollTo(0, 0);
    return () => window.removeEventListener('scroll', onScroll);
  }, [chapter]);

  useEffect(() => {
    const key = `tb-read:${id}:${chapter}`;
    if (!chapterData) return undefined;
    if (chapterData.locked) return undefined;
    const restore = () => {
      const saved = Number(localStorage.getItem(key)) || 0;
      if (saved > 0 && saved < 0.98) {
        window.scrollTo(0, saved * document.documentElement.scrollHeight);
      }
    };
    const save = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      if (max > 0) localStorage.setItem(key, String(Math.min(1, window.scrollY / max)));
    };
    const t = setTimeout(restore, 60);
    window.addEventListener('beforeunload', save);
    return () => {
      clearTimeout(t);
      save();
      window.removeEventListener('beforeunload', save);
    };
  }, [chapterData, id, chapter]);

  useEffect(() => {
    if (user && chapterData && !chapterData.locked) {
      api.post('/history', { comicId: id, chapterId: chapter }).catch(() => {});
    }
  }, [user, chapterData, id, chapter]);

  useEffect(() => {
    const onKey = (e) => {
      if (!data || !chapterData) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowLeft') goTo(data.chapters[data.chapters.indexOf(chapterData) - 1]);
      if (e.key === 'ArrowRight') goTo(data.chapters[data.chapters.indexOf(chapterData) + 1]);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, chapterData]);

  const goTo = useCallback((ch) => {
    if (ch && !ch.locked) router.push(`/comics/${id}/read/${ch._id}`);
  }, [id, router]);

  if (!data || !chapterData) {
    return <p className="max-w-3xl mx-auto px-5 py-10 text-muted">Loading chapter...</p>;
  }

  const chapters = data.chapters;
  const idx = chapters.findIndex((c) => c._id === chapter);
  const prev = idx > 0 ? chapters[idx - 1] : null;
  const next = idx < chapters.length - 1 ? chapters[idx + 1] : null;

  return (
    <div className="bg-ink min-h-screen relative">
      {/* Scroll progress */}
      <div className="fixed top-16 left-0 right-0 h-0.5 z-30 bg-panel2" aria-hidden="true">
        <div className="h-full bg-accent transition-[width] duration-150" style={{ width: `${progress * 100}%` }} />
      </div>

      <div className="max-w-3xl mx-auto px-5 py-8">
        <div className="sticky top-16 bg-ink/95 backdrop-blur z-20 py-3 -mx-5 px-5 panel-border border-b">
          <div className="flex items-center gap-3">
            <Link href={`/comics/${id}`} className="text-sm text-accent hover:underline shrink-0">
              ← {data.comic.title}
            </Link>
            {chapters.length > 1 && (
              <select
                value={chapter}
                onChange={(e) => {
                  const target = chapters.find((c) => c._id === e.target.value);
                  goTo(target);
                }}
                aria-label="Chapters"
                className="ml-auto bg-panel panel-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-accent max-w-[240px]"
              >
                {chapters.map((c, i) => (
                  <option key={c._id} value={c._id} disabled={c.locked}>
                    Ch. {i + 1} — {c.title}{c.locked ? ' (locked)' : ''}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="flex items-baseline justify-between mt-4">
          <h1 className="font-display text-2xl">
            Ch. {idx + 1} — {chapterData.title}
          </h1>
          <span className="text-xs text-muted shrink-0 ml-3">Ch. {idx + 1} of {chapters.length}</span>
        </div>

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
          <div className="flex flex-col gap-3 mt-6">
            {chapterData.pageImages.map((src, i) => (
              <div key={i} className="relative overflow-hidden rounded panel-border border bg-panel2">
                <Image
                  src={mediaUrl(src)}
                  alt={`${chapterData.title} — page ${i + 1}`}
                  width={900}
                  height={1270}
                  unoptimized
                  className="w-full h-auto"
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between mt-10 pb-10 gap-3">
          {prev && !prev.locked ? (
            <Link
              href={`/comics/${id}/read/${prev._id}`}
              className="px-4 py-2.5 ink-card rounded-lg text-sm hover:border-accent/40 transition"
            >
              ← Previous
            </Link>
          ) : <span className="hidden sm:block" />}
          {next ? (
            <Link
              href={`/comics/${id}/read/${next._id}`}
              className="px-4 py-2.5 bg-accent text-ink rounded-lg text-sm font-semibold glow-btn transition"
            >
              Next Chapter →
            </Link>
          ) : (
            <Link href={`/comics/${id}`} className="px-4 py-2.5 border border-paper/20 rounded-lg text-sm hover:border-accent transition">
              Back to series →
            </Link>
          )}
        </div>

        {data.comic && idx >= 0 && (
          <p className="text-center text-[11px] text-muted pb-8">
            Use <kbd className="px-1.5 py-0.5 rounded bg-panel2 font-sans">←</kbd> and{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-panel2 font-sans">→</kbd> to switch chapters
          </p>
        )}
      </div>
    </div>
  );
}