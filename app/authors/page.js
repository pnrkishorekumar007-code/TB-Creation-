import { fetchApi } from '../../lib/server-data';
import CreatorCard from '../../components/CreatorCard';

export const metadata = {
  title: 'Creators',
  description: 'Meet the creators publishing comics and scripts on TB Creation.',
};

export const dynamic = 'force-dynamic';

export default async function AuthorsPage({ searchParams }) {
  const q = (await searchParams)?.q || '';
  const data = await fetchApi(`/authors${q ? `?search=${encodeURIComponent(q)}` : ''}`);
  const authors = data?.authors || [];

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-1">Community</p>
        <h1 className="font-display text-3xl sm:text-4xl mb-2 uppercase">Creators</h1>
        <p className="text-muted text-sm">The writers and artists building stories on TB Creation.</p>
      </div>

      <form action="/authors" method="get" className="flex gap-2 mb-8 max-w-xl">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search creators by name..."
          aria-label="Search creators"
          className="flex-1 min-w-0 bg-panel2/60 panel-border rounded-lg px-4 py-2.5 text-sm outline-none placeholder:text-muted focus:border-accent"
        />
        <button
          type="submit"
          className="px-4 py-2.5 bg-accent text-ink text-sm font-bold rounded-md glow-btn transition"
        >
          Search
        </button>
      </form>

      {authors.length === 0 ? (
        <div className="ink-card rounded-lg p-10 text-center border-dashed border-paper/10 border">
          <p className="font-display text-xl uppercase mb-2">{q ? 'No creators found' : 'Nobody yet'}</p>
          <p className="text-sm text-muted">
            {q
              ? 'No creators match that name — try a different search.'
              : 'Creators will appear here once they publish their first comic or script.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {authors.map((a) => (
            <CreatorCard key={a._id} creator={a} />
          ))}
        </div>
      )}
    </div>
  );
}