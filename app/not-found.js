import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-5 py-24 text-center">
      <p className="font-display text-7xl text-accent mb-2">404</p>
      <h1 className="font-display text-2xl mb-3 uppercase">Page Not Found</h1>
      <p className="text-muted mb-8">
        This page doesn't exist — maybe the comic was removed, or the link's outdated.
      </p>
      <div className="flex justify-center gap-3">
        <Link href="/" className="px-5 py-3 bg-accent text-ink font-semibold rounded-md glow-btn">
          Back to Home
        </Link>
        <Link href="/comics" className="px-5 py-3 border border-paper/20 rounded-md hover:border-accent transition">
          Browse Comics
        </Link>
      </div>
    </div>
  );
}
