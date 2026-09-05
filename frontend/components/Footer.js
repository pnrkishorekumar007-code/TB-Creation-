import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="panel-border border-t mt-16">
      <div className="max-w-6xl mx-auto px-5 py-10 flex flex-col sm:flex-row justify-between gap-4 text-sm text-muted">
        <p>© {new Date().getFullYear()} TB Creation. Made by creators, for readers.</p>
        <div className="flex gap-5 flex-wrap">
          <Link href="/comics" className="hover:text-paper transition">Comics</Link>
          <Link href="/scripts" className="hover:text-paper transition">Scripts</Link>
          <Link href="/contact" className="hover:text-paper transition">Contact</Link>
          <Link href="/terms" className="hover:text-paper transition">Terms</Link>
          <Link href="/privacy" className="hover:text-paper transition">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}
