'use client';

import { use, useEffect, useState } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';

export default function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [imdbId, setImdbId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If the ID already starts with 'tt', it's already an IMDb ID
    if (id.startsWith('tt')) {
      setImdbId(id);
      setLoading(false);
      return;
    }

    // Otherwise, fetch external IDs from TMDb API to get the IMDb ID
    async function fetchExternalId() {
      try {
        const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY; // or your public key
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${id}/external_ids?api_key=${apiKey}`
        );
        const data = await res.json();
        if (data.imdb_id) {
          setImdbId(data.imdb_id);
        } else {
          setImdbId(id); // Fallback to original ID
        }
      } catch (err) {
        console.error('Failed to fetch IMDb ID:', err);
        setImdbId(id);
      } finally {
        setLoading(false);
      }
    }

    fetchExternalId();
  }, [id]);

  const embedUrl = imdbId ? `https://framextv.tech/embed/${imdbId}` : '';

  return (
    <main className="min-h-screen bg-black text-white font-sans pb-16">
      <Header />

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between bg-neutral-900/80 border border-neutral-800 p-4 rounded-xl">
          <div>
            <h1 className="text-sm font-semibold text-neutral-300">Streaming via FrameX TV Engine</h1>
            <p className="text-xs text-neutral-500">High-bitrate HTML5 responsive player stream.</p>
          </div>
        </div>

        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 shadow-2xl">
          {loading ? (
            <div className="flex items-center justify-center w-full h-full text-neutral-400 text-sm">
              Loading player...
            </div>
          ) : (
            <iframe
              src={embedUrl}
              className="w-full h-full border-0"
              allowFullScreen
              title="Video Player"
              referrerPolicy="origin"
            />
          )}
        </div>

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