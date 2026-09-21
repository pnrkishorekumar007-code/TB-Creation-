import Link from 'next/link';
import Image from 'next/image';
import { mediaUrl, formatNumber } from '../lib/site';
import ComicCard from './ComicCard';
import ScriptCard from './ScriptCard';
import FollowButton from './FollowButton';

export default function AuthorProfile({ data }) {
  const { author, comics = [], scripts = [] } = data || {};

  const stats = [
    { label: 'Series', value: author.seriesCount ?? comics.length + scripts.length },
    ...(author.followers != null ? [{ label: 'Followers', value: author.followers }] : []),
    ...(author.chapterCount != null ? [{ label: 'Chapters', value: author.chapterCount }] : []),
    ...(author.totalViews != null ? [{ label: 'Views', value: formatNumber(author.totalViews) }] : []),
  ];

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <div className="ink-card rounded-lg p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
        <div className="relative w-20 h-20 rounded-full overflow-hidden bg-panel2 panel-border shrink-0">
          {author.avatarUrl ? (
            <Image
              src={mediaUrl(author.avatarUrl)}
              alt={author.name}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center font-display text-2xl text-accent">
              {(author.name || '?').charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display text-3xl uppercase">{author.name}</h1>
            <FollowButton authorId={author._id} />
          </div>
          {author.bio && <p className="text-muted text-sm mt-1">{author.bio}</p>}
          {stats.length > 0 && (
            <div className="flex flex-wrap gap-5 mt-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="font-display text-lg leading-none">{s.value}</p>
                  <p className="text-xs text-muted uppercase tracking-widest mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl uppercase">Comics</h2>
          <Link href="/comics" className="text-xs text-muted hover:text-accent transition">
            Browse all →
          </Link>
        </div>
        {comics.length === 0 ? (
          <p className="text-muted text-sm">No comics published yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {comics.map((c) => <ComicCard key={c._id} comic={c} />)}
          </div>
        )}
      </div>

      <div className="mt-12">
        <h2 className="font-display text-xl mb-3 uppercase">Scripts</h2>
        {scripts.length === 0 ? (
          <p className="text-muted text-sm">No scripts published yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {scripts.map((s) => <ScriptCard key={s._id} script={s} />)}
          </div>
        )}
      </div>
    </div>
  );
}