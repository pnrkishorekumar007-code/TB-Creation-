import Link from 'next/link';

const EXPLORE = [
  { href: '/comics', label: 'Comics' },
  { href: '/scripts', label: 'Scripts' },
  { href: '/authors', label: 'Creators' },
  { href: '/feed', label: 'Feed' },
];

const CREATE = [
  { href: '/dashboard/upload-comic', label: 'Publish a Comic' },
  { href: '/dashboard/upload-script', label: 'Publish a Script' },
  { href: '/dashboard', label: 'Creator Dashboard' },
];

const COMPANY = [
  { href: '/contact', label: 'Contact' },
  { href: '/terms', label: 'Terms' },
  { href: '/privacy', label: 'Privacy' },
];

export default function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t-2 border-border/10 bg-panel/50">
      <div className="absolute inset-0 tone tone-fade rotate-180 pointer-events-none" aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-paper" aria-label="TB Creation home">
            <span className="logo-mark font-display text-2xl">TB</span>
            <span className="font-display text-3xl tracking-wider uppercase leading-none">Creation</span>
          </Link>
          <p className="text-muted text-sm mt-4 max-w-xs leading-relaxed">
            Your story. Drawn, written, read. A home for independent manga,
            comics and scripts.
          </p>
          <Link
            href="/signup?role=author"
            className="outline-btn inline-flex mt-6 px-4 py-2 text-sm font-bold border border-border/30 rounded-md"
          >
            Start publishing →
          </Link>
        </div>

        <FooterCol title="Explore" links={EXPLORE} />
        <FooterCol title="Create" links={CREATE} />
        <FooterCol title="Company" links={COMPANY} />
      </div>

      <div className="relative border-t border-border/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row justify-between gap-2 text-xs text-muted">
          <p>© {new Date().getFullYear()} TB Creation. Made by creators, for readers.</p>
          <p className="font-display tracking-widest text-sm text-accent/80">PANEL BY PANEL.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <nav aria-label={title}>
      <p className="section-eyebrow mb-4">{title}</p>
      <ul className="flex flex-col gap-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-sm text-paper/80 hover:text-accent transition inline-block hover:translate-x-1"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
