'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';

export default function WatchPage({ params }: { params: { id: string } }) {
  const { id } = params;

  // FrameX TV embed URL using your TMDb/media ID
  // You can optionally append parameters like ?server=name or &t=0 if needed
  const embedUrl = `https://framextv.tech/embed/${id}`;

  return (
    <main className="min-h-screen bg-black text-white font-sans pb-16">
      <Header />

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-6">
        
        {/* Player Info Header */}
        <div className="flex items-center justify-between bg-neutral-900/80 border border-neutral-800 p-4 rounded-xl">
          <div>
            <h1 className="text-sm font-semibold text-neutral-300">Streaming via FrameX TV Engine</h1>
            <p className="text-xs text-neutral-500">High-bitrate HTML5 responsive player stream.</p>
          </div>
        </div>

        {/* Player Container */}
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 shadow-2xl">
          <iframe
            src={embedUrl}
            className="w-full h-full border-0"
            allowFullScreen
            title="Video Player"
            referrerPolicy="origin"
          />
        </div>

        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-sky-400 transition"
          >
            ← Back to Home
          </Link>
        </div>

      </div>
    </main>
  );
}