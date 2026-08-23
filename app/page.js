import Link from 'next/link';
import ComicCard from '../components/ComicCard';
import HeroActions from '../components/HeroActions';

async function getComics() {
  try {
    // NEXT_PUBLIC_API_URL may be same-origin relative (e.g. "/api" on Vercel),
    // but server-side fetch() needs an absolute URL.
    let base = process.env.NEXT_PUBLIC_API_URL || '/api';
    if (base.startsWith('/')) {
      const host = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
      base = `${host}${base}`;
    }
    const res = await fetch(`${base}/comics?sort=popular&limit=6`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.comics || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const trending = await getComics();

  return (
    <div>
      <section className="relative overflow-hidden border-b panel-border">
        <div className="absolute inset-0 speed-line opacity-30 pointer-events-none" />
        <div className="hero-glow -top-40 -right-20" />
        <div className="max-w-6xl mx-auto px-5 py-24 relative">
          <p className="font-display text-accent tracking-widest text-sm mb-1">CHAPTER ONE</p>
          <h1 className="font-display text-6xl sm:text-7xl leading-[0.92] max-w-2xl uppercase">
            Your story.<br />
            <span className="gradient-text">Drawn, written, read.</span>
          </h1>
          <p className="text-muted mt-6 max-w-lg text-lg">
            TB Creation is where independent manga artists and writers publish
            their comics and scripts — and where readers discover their next favorite series.
          </p>

          <div className="flex flex-wrap gap-4 mt-9">
            <HeroActions />
          </div>

          <div className="stat-strip mt-14">
            <div><p className="stat-num">120+</p><p className="stat-label">Series</p></div>
            <div><p className="stat-num">5K+</p><p className="stat-label">Readers</p></div>
            <div><p className="stat-num">Weekly</p><p className="stat-label">New Chapters</p></div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 py-16">
        <div className="flex items-baseline justify-between mb-7">
          <h2 className="font-display text-3xl uppercase">Trending Now</h2>
          <Link href="/comics" className="text-sm text-accent hover:underline font-semibold">View all →</Link>
        </div>

        {trending.length === 0 ? (
          <p className="text-muted">No comics published yet — be the first to upload one.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {trending.map((c) => (
              <ComicCard key={c._id} comic={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
