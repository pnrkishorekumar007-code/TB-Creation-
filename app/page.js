import Link from 'next/link';
import ComicCard from '../components/ComicCard';
import CreatorCard from '../components/CreatorCard';
import HomeHeroActions from '../components/HomeHeroActions';
import HomeHeroVisual from '../components/HomeHeroVisual';
import { fetchApi } from '../lib/server-data';

const GENRES = [
  'Action',
  'Romance',
  'Fantasy',
  'Slice of Life',
  'Horror',
  'Comedy',
  'Sci-Fi',
  'Mystery',
  'Drama',
  'Adventure',
];

const STEPS = [
  {
    n: '01',
    title: 'Create',
    body: 'Open a free creator account and set up your series — cover, genre, tags and a short pitch.',
  },
  {
    n: '02',
    title: 'Publish',
    body: 'Upload chapters page by page, save drafts, or schedule a release for the moment you choose.',
  },
  {
    n: '03',
    title: 'Grow',
    body: 'Readers follow, rate and comment. You get a feed, notifications and a profile that is yours.',
  },
];

async function getData() {
  const [trending, latest, authors, stats] = await Promise.all([
    fetchApi('/comics?sort=popular&limit=6'),
    fetchApi('/comics?sort=newest&limit=6'),
    fetchApi('/authors'),
    fetchApi('/stats'),
  ]);
  return {
    trending: trending?.comics || [],
    latest: latest?.comics || [],
    creators: authors?.authors || [],
    stats: stats || null,
  };
}

function SectionHeader({ index, eyebrow, title, href }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-8">
      <div>
        <p className="section-eyebrow mb-2">
          {index ? `${index} · ` : ''}
          {eyebrow}
        </p>
        <h2 className="font-display text-3xl sm:text-4xl uppercase tracking-wide leading-none">
          {title}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          className="shrink-0 text-sm font-bold text-paper hover:text-accent transition underline decoration-2 decoration-accent underline-offset-4"
        >
          View all →
        </Link>
      )}
    </div>
  );
}

function GenreStrip() {
  const items = [...GENRES, ...GENRES];
  return (
    <div className="overflow-x-clip py-3" aria-hidden="true">
      <div className="marquee bg-accent text-onaccent border-y-2 border-border/80 -rotate-[0.6deg]">
        <div className="marquee-track animate-marquee py-2.5">
          {items.map((g, i) => (
            <span
              key={i}
              className="font-display text-xl tracking-widest uppercase whitespace-nowrap px-6 flex items-center gap-12"
            >
              {g}
              <span className="opacity-60">✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const { trending, latest, creators, stats } = await getData();
  const hasContent = trending.length > 0 || latest.length > 0;
  const showStats = stats && Number(stats.series) > 0;

  const statItems = showStats
    ? [
        { value: stats.series, label: 'Series' },
        { value: stats.creators, label: 'Creators' },
        { value: stats.chapters, label: 'Chapters' },
        { value: stats.readers, label: 'Readers' },
      ]
    : [];

  return (
    <div>
      {/* ───────── Hero ───────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 tone tone-fade pointer-events-none" />
        <div className="absolute inset-0 speed-line opacity-40 pointer-events-none" />
        <div className="hero-glow -top-48 -right-24" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-20 sm:pb-28 relative">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-14 items-center">
            <div className="animate-fade-up">
              <p className="section-eyebrow mb-5">Independent manga &amp; comics</p>
              <h1 className="font-display text-6xl sm:text-7xl lg:text-[5.5rem] leading-[0.95] uppercase tracking-wide max-w-2xl">
                Your story.
                <br />
                <span className="gradient-text">Drawn, written,</span>
                <br />
                <span className="mark">read.</span>
              </h1>
              <p className="text-muted mt-7 max-w-lg text-base sm:text-lg leading-relaxed">
                Discover independent manga, comics and stories from creators
                building something new — then publish your own.
              </p>
              <div className="flex flex-wrap gap-4 mt-9">
                <HomeHeroActions />
              </div>

              {showStats && (
                <div className="stat-strip mt-14">
                  {statItems.map((s) => (
                    <div key={s.label}>
                      <p className="stat-num">{s.value}</p>
                      <p className="stat-label">{s.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden lg:block animate-fade-up" style={{ animationDelay: '0.15s' }}>
              <HomeHeroVisual trending={trending} />
            </div>
          </div>
        </div>
      </section>

      <GenreStrip />

      {!hasContent ? (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-24 text-center">
          <p className="section-eyebrow justify-center mb-3">Day one</p>
          <p className="font-display text-4xl sm:text-5xl uppercase mb-4">Start Something New</p>
          <p className="text-muted max-w-md mx-auto mb-9">
            TB Creation is opening its doors to independent creators. Be one of
            the first to publish your story to the world.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <HomeHeroActions type="empty" />
          </div>
        </section>
      ) : (
        <>
          {trending.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-8">
              <SectionHeader index="01" eyebrow="Trending" title="Featured Series" href="/comics" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6">
                {trending.map((c, i) => (
                  <ComicCard key={c._id} comic={c} priority={i < 2} />
                ))}
              </div>
            </section>
          )}

          {latest.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-8">
              <SectionHeader index="02" eyebrow="Just dropped" title="New Releases" href="/comics" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6">
                {latest.map((c) => (
                  <ComicCard key={c._id} comic={c} />
                ))}
              </div>
            </section>
          )}

          {creators.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-8">
              <SectionHeader index="03" eyebrow="Meet the makers" title="Popular Creators" href="/authors" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
                {creators.slice(0, 5).map((c) => (
                  <CreatorCard key={c._id} creator={c} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* ───────── How it works ───────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-8">
        <SectionHeader eyebrow="For creators" title="From first panel to first fans" />
        <ol className="grid md:grid-cols-3 gap-5 sm:gap-6">
          {STEPS.map((s) => (
            <li key={s.n} className="static-card rounded-lg p-6 relative overflow-hidden">
              <span
                className="absolute -top-3 -right-1 font-display text-8xl leading-none text-accent/15 select-none"
                aria-hidden="true"
              >
                {s.n}
              </span>
              <p className="font-display text-3xl uppercase relative">{s.title}</p>
              <p className="text-sm text-muted mt-3 leading-relaxed relative">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ───────── Creator CTA ───────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16">
        <div className="static-card rounded-xl p-8 sm:p-14 relative overflow-hidden text-center sm:text-left">
          <div className="absolute inset-0 bg-halftone opacity-60 pointer-events-none" />
          <div
            className="hidden sm:flex absolute -right-6 top-1/2 -translate-y-1/2 w-56 h-56 burst bg-accent text-onaccent items-center justify-center rotate-12"
            aria-hidden="true"
          >
            <span className="font-display text-4xl leading-none text-center">
              YOUR
              <br />
              TURN!
            </span>
          </div>
          <div className="relative sm:max-w-xl">
            <p className="font-display text-4xl sm:text-5xl uppercase leading-[1.02] mb-4">
              Your story deserves to be read
            </p>
            <p className="text-muted mb-8 leading-relaxed">
              Open a creator account, publish chapter by chapter, and build an
              audience for your manga, webtoon or script.
            </p>
            <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
              <HomeHeroActions type="cta" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
