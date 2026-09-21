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
    <footer className="panel-border border-t mt-16 bg-panel/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <Link
            href="/"
            className="font-display text-2xl tracking-wide text-paper uppercase"
          >
            TB<span className="text-accent">Creation</span>
          </Link>
          <p className="text-muted text-sm mt-3 max-w-xs">
            Your story. Drawn, written, read. A home for independent manga,
            comics and scripts.
          </p>
        </div>

        <FooterCol title="Explore" links={EXPLORE} />
        <FooterCol title="Create" links={CREATE} />
        <FooterCol title="Company" links={COMPANY} />
      </div>

      <div className="border-t border-border/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row justify-between gap-2 text-xs text-muted">
          <p>© {new Date().getFullYear()} TB Creation. Made by creators, for readers.</p>
          <p>Discover independent manga &amp; comics.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <nav aria-label={title}>
      <p className="text-xs uppercase tracking-widest text-muted mb-4">{title}</p>
      <ul className="flex flex-col gap-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-paper/80 hover:text-accent transition">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}