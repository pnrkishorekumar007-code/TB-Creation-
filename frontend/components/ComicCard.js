import Link from 'next/link';

export default function ComicCard({ comic }) {
  const isHot = comic.views > 100;

  return (
    <Link href={`/comics/${comic._id}`} className="block ink-card rounded-lg overflow-hidden relative group">
      <div className="aspect-[3/4] bg-panel2 overflow-hidden relative">
        {isHot && <span className="ribbon">🔥 Hot</span>}
        {comic.coverUrl ? (
          <img
            src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${comic.coverUrl}`}
            alt={comic.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-panel2 to-panel p-3">
            <span className="font-display text-center text-sm text-paper/30 uppercase leading-tight">
              {comic.title}
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="font-display text-lg leading-tight truncate uppercase">{comic.title}</p>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-xs text-muted">{comic.genre}</span>
          <span className="text-xs uppercase tracking-wide text-accent font-semibold">{comic.status}</span>
        </div>
      </div>
    </Link>
  );
}
