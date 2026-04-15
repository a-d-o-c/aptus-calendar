import type { Metadata } from 'next';
import { Cormorant_Garamond, DM_Mono, Libre_Baskerville } from 'next/font/google';
import { HemisphereProvider } from '@/lib/hemisphere-context';
import './globals.css';

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const dmMono = DM_Mono({
  variable: '--font-dm-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
});

const libre = Libre_Baskerville({
  variable: '--font-libre',
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Aptus — A Temporal Operating System',
  description: 'A calendar aligned with natural cycles. 13 months, 28 days each, anchored to the equinox.',
  metadataBase: new URL('https://www.aptuscalendar.com'),
  openGraph: {
    title: 'Aptus Calendar',
    description: 'Aligned with natural cycles. Not a replacement — a correction.',
    type: 'website',
    url: 'https://www.aptuscalendar.com',
  },
  twitter: {
    card: 'summary',
    title: 'Aptus Calendar',
    description: 'Aligned with natural cycles. Not a replacement — a correction.',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Aptus',
  },
  formatDetection: { telephone: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${dmMono.variable} ${libre.variable} h-full`}
    >
      <body className="h-full antialiased">
        <HemisphereProvider>{children}</HemisphereProvider>
      </body>
    </html>
  );
}
