import Link from 'next/link';
import Image from 'next/image';
import { mediaUrl, formatNumber } from '../lib/site';

export default function CreatorCard({ creator }) {
  const { _id, name, bio, avatarUrl, seriesCount = 0, followers = 0 } = creator || {};
  const avatarSrc = mediaUrl(avatarUrl);
  const initial = (name || '?').trim().charAt(0).toUpperCase();

  return (
    <Link
      href={`/authors/${_id}`}
      className="ink-card rounded-lg p-5 flex flex-col items-center text-center gap-2 hover:-translate-y-1"
    >
      <div className="relative w-20 h-20 rounded-full overflow-hidden bg-panel2 ring-2 ring-panel2">
        {avatarSrc ? (
          <Image
            src={avatarSrc}
            alt={`${name} avatar`}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center font-display text-2xl text-accent/80">
            {initial}
          </span>
        )}
      </div>
      <p className="font-display text-lg leading-tight truncate max-w-full uppercase">
        {name}
      </p>
      <p className="text-xs text-muted line-clamp-2 min-h-[2rem]">{bio || 'Creator on TB Creation'}</p>
      <div className="flex items-center gap-3 mt-2 text-[11px] text-muted">
        <span>{formatNumber(seriesCount)} series</span>
        <span aria-hidden="true">·</span>
        <span>{formatNumber(followers)} followers</span>
      </div>
    </Link>
  );
}