import type { Metadata } from 'next';
import './globals.css';
import FloatingNav from '@/components/FloatingNav';

export const metadata: Metadata = {
  title: 'Voltarix - Streaming Platform',
  description: 'High-end streaming platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased min-h-screen pb-24">
        {children}
        <FloatingNav />
      </body>
    </html>
  );
}