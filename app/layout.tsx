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

// Inside your root layout file (app/layout.tsx), add the Google Fonts stylesheet link in the HTML head:
<head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=Tilt+Warp&display=swap" rel="stylesheet" />
  <link href="https://fonts.cdnfonts.com/css/youtube-sans" rel="stylesheet" />
</head>