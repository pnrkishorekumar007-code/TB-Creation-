import Link from 'next/link';
import { formatNumber, timeAgo } from '../lib/site';

export default function ScriptCard({ script }) {
  const { _id, title, synopsis, genre, author, views = 0, createdAt } = script || {};
  const authorName =
    typeof author === 'object' && author ? author.name : author || 'Unknown';

  return (
    <Link href={`/scripts/${_id}`} className="ink-card rounded-lg p-5 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <p className="font-display text-lg leading-tight uppercase truncate">{title}</p>
        <span className="badge-pill shrink-0 uppercase tracking-wide text-accent2">
          {genre || 'Script'}
        </span>
      </div>
      <p className="text-sm text-muted line-clamp-2">{synopsis}</p>
      <div className="flex items-center justify-between mt-auto pt-3 text-xs text-muted">
        <span>by {authorName}</span>
        <span>
          {formatNumber(views)} views
          {createdAt ? <span aria-hidden="true"> · </span> : null}
          {createdAt ? <time dateTime={createdAt}>{timeAgo(createdAt)}</time> : null}
        </span>
      </div>
    </Link>
  );
}