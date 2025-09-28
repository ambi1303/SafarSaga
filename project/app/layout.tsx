import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import ScrollToTop from '@/components/ScrollToTop';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SafarSaga - Every Journey Has A Story',
  description: 'Premium travel agency offering handpicked destinations and unforgettable experiences worldwide. Discover extraordinary adventures with SafarSaga.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <Header />
        <main className="min-h-screen page-transition">
          {children}
        </main>
        <Footer />
        <WhatsAppButton />
        <ScrollToTop />
        <Toaster />
      </body>
    </html>
  );
}