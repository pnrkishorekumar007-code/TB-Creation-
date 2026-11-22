// The scripts page itself is a client component, so its metadata lives here.
export const metadata = {
  title: 'Read Scripts',
  description:
    'Readable scripts and pitches from independent writers — the blueprints behind great comics, on TB Creation.',
  alternates: { canonical: '/scripts' },
  openGraph: {
    title: 'Read Scripts',
    description:
      'Readable scripts and pitches from independent writers — the blueprints behind great comics, on TB Creation.',
    type: 'website',
    url: '/scripts',
  },
};

export default function ScriptsLayout({ children }) {
  return children;
}
