import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SafarSaga - Every Journey Has A Story',
  description: 'Premium travel agency offering handpicked destinations and unforgettable experiences worldwide. Discover extraordinary adventures with SafarSaga.',
  keywords: 'travel, vacation, destinations, booking, adventure, tours, packages, safarsaga, journey, story',
  authors: [{ name: 'SafarSaga Travel Agency' }],
  creator: 'SafarSaga',
  publisher: 'SafarSaga Travel Agency',
  openGraph: {
    title: 'SafarSaga - Every Journey Has A Story',
    description: 'Premium travel agency offering handpicked destinations and unforgettable experiences worldwide.',
    url: 'https://safarsaga.vercel.app',
    siteName: 'SafarSaga',
    images: [
      {
        url: '/logo.png.png',
        width: 1200,
        height: 630,
        alt: 'SafarSaga Travel Agency',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SafarSaga - Every Journey Has A Story',
    description: 'Premium travel agency offering handpicked destinations and unforgettable experiences worldwide.',
    images: ['/logo.png.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}