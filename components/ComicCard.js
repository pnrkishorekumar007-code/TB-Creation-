import Link from 'next/link';
import Image from 'next/image';
import { mediaUrl, formatNumber, timeAgo } from '../lib/site';

export default function ComicCard({ comic, priority = false }) {
  const {
    _id,
    title,
    coverUrl,
    author,
    genre,
    status,
    views = 0,
    chapterCount = 0,
    rating,
    lastChapterAt,
  } = comic || {};

  const isHot = views > 100;
  const coverSrc = mediaUrl(coverUrl);
  const initial = (title || '?').trim().charAt(0).toUpperCase();
  const authorName =
    typeof author === 'object' && author ? author.name : author || 'Unknown';
  const ratingAvg = rating ? Number(rating.average) || 0 : 0;
  const ratingCount = rating ? Number(rating.count) || 0 : 0;

  return (
    <Link
      href={`/comics/${_id}`}
      className="ink-card rounded-lg overflow-hidden relative group flex flex-col"
    >
      <div className="relative aspect-[3/4] bg-panel2 overflow-hidden shrink-0">
        {isHot && <span className="ribbon">Hot</span>}
        {coverSrc ? (
          <Image
            src={coverSrc}
            alt={`${title} cover`}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-panel2 via-panel to-panel2/60">
            <span className="font-display text-4xl text-accent/80">{initial}</span>
            <span className="px-2 py-0.5 badge-pill">{genre || 'General'}</span>
          </div>
        )}
        {status && (
          <span className="absolute bottom-2 right-2 text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded bg-ink/70 backdrop-blur text-paper">
            {status}
          </span>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1 min-w-0">
        <p className="font-display text-base sm:text-lg leading-tight truncate uppercase">
          {title}
        </p>
        <p className="text-xs text-muted mt-0.5 truncate">by {authorName}</p>

        <div className="flex items-center gap-2 mt-2 text-[11px] text-muted">
          {chapterCount > 0 && <span>{chapterCount} ch.</span>}
          {genre && (
            <>
              <span aria-hidden="true">·</span>
              <span className="truncate">{genre}</span>
            </>
          )}
        </div>

        {(ratingCount > 0 || lastChapterAt || isHot) && (
          <div className="flex items-center justify-between mt-2 text-[11px]">
            {ratingCount > 0 ? (
              <span className="text-amber-400" aria-label={`Rated ${ratingAvg.toFixed(1)} out of 5`}>
                ★ {ratingAvg.toFixed(1)}
                <span className="text-muted"> ({formatNumber(ratingCount)})</span>
              </span>
            ) : isHot ? (
              <span className="text-accent2">{formatNumber(views)} views</span>
            ) : (
              <span />
            )}
            {lastChapterAt && (
              <time dateTime={lastChapterAt} className="text-muted">
                {timeAgo(lastChapterAt)}
              </time>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}