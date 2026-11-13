import type { Metadata } from 'next';
import './globals.css';
import FloatingNav from '@/components/FloatingNav';

export const metadata: Metadata = {
  title: 'Voltarix - Streaming Platform',
  description: 'High-end streaming platform',
  icons: {
    icon: '/icon.jpg',
    shortcut: '/icon.jpg',
    apple: '/icon.jpg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Tilt+Warp&display=swap" rel="stylesheet" />
        <link href="https://fonts.cdnfonts.com/css/youtube-sans" rel="stylesheet" />
      </head>
      <body className="bg-black text-white antialiased min-h-screen pb-24">
        {children}
        <FloatingNav />
      </body>
    </html>
  );
}