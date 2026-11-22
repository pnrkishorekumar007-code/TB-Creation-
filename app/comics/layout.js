// The comics page itself is a client component, so its metadata lives here.
export const metadata = {
  title: 'Discover Comics',
  description:
    'Browse original comic series from independent creators on TB Creation — action, romance, fantasy, horror, comedy and slice of life.',
  alternates: { canonical: '/comics' },
  openGraph: {
    title: 'Discover Comics',
    description:
      'Browse original comic series from independent creators on TB Creation — action, romance, fantasy, horror, comedy and slice of life.',
    type: 'website',
    url: '/comics',
  },
};

export default function ComicsLayout({ children }) {
  return children;
}
