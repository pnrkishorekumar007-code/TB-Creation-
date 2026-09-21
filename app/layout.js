import './globals.css';
import { Archivo, Inter } from 'next/font/google';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AuthProvider } from '../lib/AuthContext';
import { ThemeProvider } from '../lib/ThemeContext';
import { SITE_URL } from '../lib/site';

const display = Archivo({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800', '900'],
  variable: '--font-display',
  display: 'swap',
});

const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const baseMetadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'TB Creation — Discover Independent Manga & Comics',
    template: '%s | TB Creation',
  },
  description:
    'Discover manga, comics and stories from independent creators. Read new stories and publish your own on TB Creation.',
  keywords: [
    'manga',
    'comics',
    'webtoon',
    'independent creators',
    'manga scripts',
    'publish manga',
  ],
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'TB Creation',
    title: 'TB Creation — Discover Independent Manga & Comics',
    description:
      'Your story. Drawn, written, read. Discover independent manga, comics and stories from creators building something new.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TB Creation — Discover Independent Manga & Comics',
    description:
      'Your story. Drawn, written, read. Discover independent manga, comics and stories from creators building something new.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const metadata = baseMetadata;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${display.variable} ${body.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('tb-theme');if(t)document.documentElement.dataset.theme=t;}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-body bg-ink text-paper min-h-screen flex flex-col antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:bg-accent focus:text-ink focus:px-4 focus:py-2 focus:rounded focus:font-semibold"
        >
          Skip to content
        </a>
        <AuthProvider>
          <ThemeProvider>
            <Navbar />
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}