import Image from 'next/image';
import Link from 'next/link';
import { mediaUrl } from '../lib/site';

const TILTS = ['-5deg', '3deg', '-2deg'];

function SoundFx() {
  return (
    <div
      className="absolute -top-5 -right-2 z-10 w-24 h-24 burst bg-highlight text-black flex items-center justify-center rotate-12 animate-float"
      style={{ '--tilt': '12deg' }}
      aria-hidden="true"
    >
      <span className="font-display text-2xl leading-none">NEW!</span>
    </div>
  );
}

export default function HomeHeroVisual({ trending }) {
  const withCovers = trending.slice(0, 3).filter((c) => c.coverUrl);

  if (withCovers.length > 0) {
    return (
      <div className="relative flex justify-center lg:justify-end items-center gap-4 pt-6">
        <SoundFx />
        {withCovers.map((comic, i) => (
          <Link
            key={comic._id}
            href={`/comics/${comic._id}`}
            className={`group relative w-40 xl:w-48 overflow-hidden rounded-md border-2 border-border/80 bg-panel transition duration-300 hover:!rotate-0 hover:-translate-y-2 ${
              i === 1 ? 'lg:-mt-10 xl:-mt-14' : i === 2 ? 'lg:mt-10' : ''
            }`}
            style={{
              aspectRatio: '3 / 4',
              transform: `rotate(${TILTS[i]})`,
              boxShadow: '6px 6px 0 rgb(var(--accent))',
            }}
          >
            <Image
              src={mediaUrl(comic.coverUrl)}
              alt={`${comic.title} cover`}
              fill
              priority
              sizes="(max-width: 1280px) 33vw, 260px"
              className="object-cover"
            />
            <span className="absolute bottom-0 inset-x-0 px-3 py-2 bg-ink/85 backdrop-blur font-display text-sm uppercase tracking-wide truncate">
              {comic.title}
            </span>
          </Link>
        ))}
      </div>
    );
  }

  // No covers yet: show a bold typographic poster instead of fake content.
  return (
    <div className="relative ml-auto max-w-sm pt-6">
      <SoundFx />
      <div
        className="static-card rounded-md p-7 -rotate-2"
        style={{ boxShadow: '8px 8px 0 rgb(var(--accent))' }}
      >
        <p className="font-display text-5xl uppercase leading-[0.95]">
          Draw it.
          <br />
          Write it.
          <br />
          <span className="text-accent">Share it.</span>
        </p>
        <p className="text-sm text-muted mt-5 leading-relaxed">
          Be the first to publish a series on TB Creation.
        </p>
      </div>
    </div>
  );
}
