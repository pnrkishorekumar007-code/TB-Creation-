'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import api from '../../../lib/api';
import BookmarkButton from '../../../components/BookmarkButton';
import FollowButton from '../../../components/FollowButton';
import CommentSection from '../../../components/CommentSection';
import LikeButton from '../../../components/LikeButton';
import RatingStars from '../../../components/RatingStars';
import ReportModal from '../../../components/ReportModal';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');

export default function ComicDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    api
      .get(`/comics/${id}`)
      .then((res) => setData(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="max-w-6xl mx-auto px-5 py-10 text-muted">Loading...</p>;
  if (notFound || !data) return <p className="max-w-6xl mx-auto px-5 py-10 text-muted">Comic not found.</p>;

  const { comic, chapters } = data;

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 shrink-0">
          <div className="aspect-[3/4] bg-panel2 rounded overflow-hidden ink-card">
            {comic.coverUrl && (
              <img src={`${API_BASE}${comic.coverUrl}`} alt={comic.title} className="w-full h-full object-cover" />
            )}
          </div>
          <div className="flex gap-2 mt-3">
            <BookmarkButton comicId={comic._id} />
          </div>
        </div>

        <div className="flex-1">
          <p className="text-accent font-display tracking-widest text-sm">{comic.genre?.toUpperCase()}</p>
          <h1 className="font-display text-4xl mt-1">{comic.title}</h1>
          <div className="flex items-center gap-3 mt-1">
            <Link href={`/authors/${comic.author?._id}`} className="text-accent2 text-sm hover:underline">
              by {comic.author?.name}
            </Link>
            {comic.author?._id && <FollowButton authorId={comic.author._id} />}
          </div>
          <p className="text-muted mt-4 max-w-2xl">{comic.description}</p>

          <div className="flex gap-4 mt-4 text-xs text-muted items-center">
            <span>{comic.views} views</span>
            <span className="uppercase text-accent">{comic.status}</span>
          </div>

          <div className="flex items-center gap-3 mt-3">
            <LikeButton comicId={comic._id} />
            <RatingStars comicId={comic._id} />
            <button
              onClick={() => setReportOpen(true)}
              className="text-xs text-muted hover:text-accent ml-auto"
            >
              Report
            </button>
          </div>

          <h2 className="font-display text-xl mt-10 mb-3">Chapters</h2>
          {chapters.length === 0 ? (
            <p className="text-muted text-sm">No chapters published yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {chapters.map((ch) => (
                <Link
                  key={ch._id}
                  href={`/comics/${comic._id}/read/${ch._id}`}
                  className="ink-card rounded px-4 py-3 flex justify-between items-center text-sm"
                >
                  <span>{ch.locked ? '🔒 ' : ''}{ch.title}</span>
                  <span className="text-muted">{new Date(ch.publishAt).toLocaleDateString()}</span>
                </Link>
              ))}
            </div>
          )}

          <h2 className="font-display text-xl mt-10 mb-3">Comments</h2>
          <CommentSection comicId={comic._id} />
        </div>
      </div>

      {reportOpen && (
        <ReportModal targetType="comic" targetId={comic._id} onClose={() => setReportOpen(false)} />
      )}
    </div>
  );
}
