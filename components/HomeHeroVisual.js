import Image from 'next/image';
import Link from 'next/link';
import { mediaUrl } from '../lib/site';

export default function HomeHeroVisual({ trending }) {
  const withCovers = trending.slice(0, 3).filter((c) => c.coverUrl);

  if (withCovers.length > 0) {
    return (
      <div className="flex justify-center lg:justify-end gap-5">
        {withCovers.map((comic, i) => (
          <Link
            key={comic._id}
            href={`/comics/${comic._id}`}
            className={`relative w-44 xl:w-52 rounded-lg overflow-hidden panel-border shadow-card transition duration-300 hover:-translate-y-2 ${
              i === 1 ? 'lg:-mt-6 xl:-mt-10' : ''
            }`}
            style={{ aspectRatio: '3 / 4' }}
          >
            <Image
              src={mediaUrl(comic.coverUrl)}
              alt={`${comic.title} cover`}
              fill
              priority
              sizes="(max-width: 1280px) 33vw, 260px"
              className="object-cover"
            />
            <span className="absolute bottom-0 inset-x-0 px-3 py-2 bg-ink/75 backdrop-blur text-xs font-semibold truncate">
              {comic.title}
            </span>
          </Link>
        ))}
      </div>
    );
  }

  // Editorial placeholder while no covers exist — never fakes content.
  return (
    <div className="rounded-xl panel-border ink-card p-8 ml-auto max-w-sm">
      <p className="font-display text-xl uppercase leading-snug">
        Panel one.<br />An idea.<br />
        <span className="text-accent">A whole world.</span>
      </p>
      <div className="mt-6 grid grid-cols-3 gap-2">
        {[0, 1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="aspect-[3/4] rounded bg-panel2 flex items-center justify-center">
            <span className="font-display text-xs text-muted">#{n + 1}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted mt-5">
        Every series starts with a first page. Yours is waiting.
      </p>
    </div>
  );
}