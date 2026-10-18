import Link from 'next/link';

const TAGLINES = {
  login: { eyebrow: 'Welcome back', line: 'Pick up right where\nyou left off.' },
  signup: { eyebrow: 'Join TB Creation', line: 'Your story.\nDrawn, written, read.' },
  'forgot-password': { eyebrow: 'Account recovery', line: "We'll get you\nback in." },
  'reset-password': { eyebrow: 'Almost there', line: 'One new password\naway from back in.' },
};

export default function AuthLayout({ variant = 'login', children }) {
  const copy = TAGLINES[variant] || TAGLINES.login;

  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
      {/* Branding panel — hidden on small screens, shown on lg+ */}
      <div className="hidden lg:flex relative overflow-hidden bg-panel border-r border-border/10 items-center justify-center p-12">
        <div className="absolute inset-0 bg-halftone opacity-30 pointer-events-none" />
        <div className="hero-glow -top-32 -left-24" />
        <div className="relative max-w-sm">
          <p className="font-display text-accent tracking-widest text-sm mb-4 uppercase">
            {copy.eyebrow}
          </p>
          <h2 className="font-display text-4xl xl:text-5xl leading-[1.05] uppercase whitespace-pre-line">
            {copy.line}
          </h2>
          <p className="text-muted mt-6 text-sm">
            Independent manga, comics and scripts — published by creators,
            discovered by readers, all in one place.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-sm">
          <Link href="/" className="font-display text-xl tracking-wide uppercase block mb-10 lg:hidden">
            TB<span className="text-accent">Creation</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
