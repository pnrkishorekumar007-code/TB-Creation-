import Link from 'next/link';
import { formatNumber, timeAgo } from '../lib/site';

export default function ScriptCard({ script }) {
  const { _id, title, synopsis, genre, author, views = 0, createdAt } = script || {};
  const authorName =
    typeof author === 'object' && author ? author.name : author || 'Unknown';

  return (
    <Link href={`/scripts/${_id}`} className="ink-card rounded-md p-5 flex flex-col gap-2 relative overflow-hidden group">
      <span className="absolute left-0 top-0 bottom-0 w-1.5 bg-accent" aria-hidden="true" />
      <div className="flex items-start justify-between gap-3 pl-2">
        <p className="font-display text-xl leading-tight uppercase truncate tracking-wide">{title}</p>
        <span className="badge-pill shrink-0 uppercase tracking-wide text-accent2">
          {genre || 'Script'}
        </span>
      </div>
      <p className="text-sm text-muted line-clamp-2 pl-2">{synopsis}</p>
      <div className="flex items-center justify-between mt-auto pt-3 text-xs text-muted pl-2">
        <span>by {authorName}</span>
        <span>
          {formatNumber(views)} views
          {createdAt ? <span aria-hidden="true"> · </span> : null}
          {createdAt ? <time dateTime={createdAt} suppressHydrationWarning>{timeAgo(createdAt)}</time> : null}
        </span>
      </div>
    </Link>
  );
}