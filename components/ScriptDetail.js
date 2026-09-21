'use client';

import { useState } from 'react';
import Link from 'next/link';
import { mediaUrl, formatNumber, timeAgo } from '../lib/site';
import BookmarkButton from './BookmarkButton';
import FollowButton from './FollowButton';
import LikeButton from './LikeButton';
import ReportModal from './ReportModal';

export default function ScriptDetail({ script }) {
  const [reportOpen, setReportOpen] = useState(false);
  const authorId = script.author?._id || script.author;

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <p className="text-accent2 font-display tracking-widest text-sm uppercase">{script.genre}</p>
      <h1 className="font-display text-4xl mt-1">{script.title}</h1>
      <div className="flex items-center gap-3 mt-1">
        <Link href={`/authors/${authorId}`} className="text-accent2 text-sm hover:underline">
          by {script.author?.name}
        </Link>
        {authorId && <FollowButton authorId={authorId} />}
      </div>
      {script.synopsis && <p className="text-muted mt-4">{script.synopsis}</p>}
      <div className="flex items-center gap-4 mt-2 text-xs text-muted">
        {script.views != null && <span>{formatNumber(script.views)} views</span>}
        {script.createdAt && <time dateTime={script.createdAt}>{timeAgo(script.createdAt)}</time>}
      </div>

      <div className="flex flex-wrap gap-3 mt-6">
        <a
          href={mediaUrl(script.fileUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-5 py-3 bg-accent text-ink font-semibold rounded-md glow-btn transition"
        >
          Read Script File
        </a>
        <BookmarkButton scriptId={script._id} />
        <LikeButton scriptId={script._id} />
        <button
          type="button"
          onClick={() => setReportOpen(true)}
          className="inline-block px-4 py-3 text-sm text-muted hover:text-accent border border-border/20 rounded-md transition ml-auto"
        >
          Report
        </button>
      </div>

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="script"
        targetId={script._id}
      />
    </div>
  );
}