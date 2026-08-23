import './globals.css';
import { Bangers, Inter } from 'next/font/google';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AuthProvider } from '../lib/AuthContext';

const display = Bangers({ subsets: ['latin'], weight: '400', variable: '--font-display' });
const body = Inter({ subsets: ['latin'], variable: '--font-body' });

export const metadata = {
  title: 'TB Creation — Manga & Comics',
  description: 'Upload, publish, and read manga scripts and comics.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="font-body bg-ink text-paper min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
