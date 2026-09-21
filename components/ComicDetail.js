'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { absoluteUrl, mediaUrl, timeAgo, formatNumber } from '../lib/site';
import BookmarkButton from './BookmarkButton';
import FollowButton from './FollowButton';
import CommentSection from './CommentSection';
import LikeButton from './LikeButton';
import RatingStars from './RatingStars';
import ReportModal from './ReportModal';

export default function ComicDetail({ data }) {
  const { comic, chapters } = data || {};
  const [reportOpen, setReportOpen] = useState(false);

  const authorId = comic.author?._id || comic.author;
  const authorName = comic.author?.name || 'Unknown author';
  const hasChapters = chapters && chapters.length > 0;
  const coverSrc = mediaUrl(comic.coverUrl);

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 shrink-0">
          <div className="relative aspect-[3/4] bg-panel2 rounded overflow-hidden ink-card">
            {coverSrc ? (
              <Image
                src={coverSrc}
                alt={`${comic.title} cover`}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 256px"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-panel2 via-panel to-panel2/60">
                <span className="font-display text-5xl text-accent/80">
                  {(comic.title || '?').trim().charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="mt-3">
            <BookmarkButton comicId={comic._id} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-accent font-display tracking-widest text-sm uppercase">{comic.genre}</p>
          <h1 className="font-display text-4xl mt-1">{comic.title}</h1>
          {hasChapters && (
            <p className="text-sm text-muted mt-1">
              {chapters.length} chapter{chapters.length === 1 ? '' : 's'}
              {comic.status ? <span aria-hidden="true"> · </span> : null}
              {comic.status ? <span className="uppercase text-accent">{comic.status}</span> : null}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <Link href={`/authors/${authorId}`} className="text-accent2 text-sm hover:underline">
              by {authorName}
            </Link>
            {authorId && <FollowButton authorId={authorId} />}
          </div>
          <p className="text-muted mt-4 max-w-2xl">{comic.description}</p>

          {comic.views > 0 && (
            <div className="flex items-center gap-4 mt-4 text-xs text-muted">
              <span>{formatNumber(comic.views)} views</span>
            </div>
          )}

          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <LikeButton comicId={comic._id} />
            <RatingStars comicId={comic._id} />
            <button
              type="button"
              onClick={() => setReportOpen(true)}
              className="text-xs text-muted hover:text-accent ml-auto transition"
            >
              Report
            </button>
          </div>

          {comic.tags && comic.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {comic.tags.map((t) => (
                <span key={t} className="px-2 py-0.5 badge-pill text-xs">{t}</span>
              ))}
            </div>
          )}

          <h2 className="font-display text-xl mt-10 mb-3">Chapters</h2>
          {!hasChapters ? (
            <p className="text-muted text-sm">No chapters published yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {chapters.map((ch) => (
                <Link
                  key={ch._id}
                  href={`/comics/${comic._id}/read/${ch._id}`}
                  className="ink-card rounded px-4 py-3 flex justify-between items-center text-sm hover:border-accent/40 transition"
                >
                  <span className="flex items-center gap-2">
                    {ch.locked && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted shrink-0" aria-hidden="true">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    )}
                    <span className="truncate">{ch.title}</span>
                  </span>
                  <span className="text-muted shrink-0 ml-3">
                    {ch.publishAt ? timeAgo(ch.publishAt) : ''}
                  </span>
                </Link>
              ))}
            </div>
          )}

          <h2 className="font-display text-xl mt-10 mb-3">Comments</h2>
          <CommentSection comicId={comic._id} />
        </div>
      </div>

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="comic"
        targetId={comic._id}
      />
    </div>
  );
}