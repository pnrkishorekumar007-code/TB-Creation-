import Link from 'next/link';
import ComicCard from '../components/ComicCard';
import CreatorCard from '../components/CreatorCard';
import HomeHeroActions from '../components/HomeHeroActions';
import HomeHeroVisual from '../components/HomeHeroVisual';
import { fetchApi } from '../lib/server-data';

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

function SectionHeader({ title, href }) {
  return (
    <div className="flex items-baseline justify-between mb-6">
      <h2 className="font-display text-2xl sm:text-3xl uppercase tracking-wide">{title}</h2>
      {href && (
        <Link href={href} className="text-sm text-accent hover:underline font-semibold">
          View all →
        </Link>
      )}
    </div>
  );
}

export default async function HomePage() {
  const { trending, latest, creators, stats } = await getData();
  const hasContent = trending.length > 0 || latest.length > 0;
  const showStats = stats && Number(stats.series) > 0;

  const statItems = showStats
    ? [
        { value: stats.series, label: 'Published Series' },
        { value: stats.creators, label: 'Creators' },
        { value: stats.chapters, label: 'Chapters' },
        { value: stats.readers, label: 'Readers' },
      ]
    : [];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/10">
        <div className="absolute inset-0 speed-line opacity-30 pointer-events-none" />
        <div className="hero-glow -top-40 -right-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-ink pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 relative">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center">
            <div>
              <p className="font-display text-accent tracking-widest text-sm mb-4 uppercase">
                TB Creation · Independent Publishing
              </p>
              <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl leading-[1.02] max-w-2xl uppercase tracking-tight">
                Your story.
                <br />
                <span className="gradient-text">Drawn, written, read.</span>
              </h1>
              <p className="text-muted mt-6 max-w-lg text-base sm:text-lg">
                Discover independent manga, comics and stories from creators
                building something new — then publish your own.
              </p>
              <div className="flex flex-wrap gap-4 mt-9">
                <HomeHeroActions />
              </div>

              {showStats && (
                <div className="stat-strip mt-12">
                  {statItems.map((s) => (
                    <div key={s.label}>
                      <p className="stat-num">{s.value}</p>
                      <p className="stat-label">{s.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden lg:block">
              <HomeHeroVisual trending={trending} />
            </div>
          </div>
        </div>
      </section>

      {!hasContent ? (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20 text-center">
          <p className="font-display text-2xl sm:text-3xl uppercase mb-3">
            Start Something New
          </p>
          <p className="text-muted max-w-md mx-auto mb-8">
            TB Creation is opening its doors to independent creators. Be one of
            the first to publish your story to the world.
          </p>
          <HomeHeroActions type="empty" />
        </section>
      ) : (
        <>
          {trending.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
              <SectionHeader title="Featured Series" href="/comics" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-5">
                {trending.map((c, i) => (
                  <ComicCard key={c._id} comic={c} priority={i < 2} />
                ))}
              </div>
            </section>
          )}

          {latest.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
              <SectionHeader title="New Releases" href="/comics" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-5">
                {latest.map((c) => (
                  <ComicCard key={c._id} comic={c} />
                ))}
              </div>
            </section>
          )}

          {creators.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
              <SectionHeader title="Popular Creators" href="/authors" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                {creators.slice(0, 5).map((c) => (
                  <CreatorCard key={c._id} creator={c} />
                ))}
              </div>
            </section>
          )}

          {/* Creator CTA */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
            <div className="ink-card rounded-2xl p-8 sm:p-14 text-center relative overflow-hidden">
              <div className="absolute inset-0 halftone opacity-40 pointer-events-none" />
              <div className="relative">
                <p className="font-display text-3xl sm:text-4xl uppercase mb-3">
                  Your story deserves to be read
                </p>
                <p className="text-muted max-w-md mx-auto mb-8">
                  Open a creator account, publish chapter by chapter, and build
                  an audience for your manga, webtoon or script.
                </p>
                <HomeHeroActions type="cta" />
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}