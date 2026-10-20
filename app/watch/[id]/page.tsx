'use client';

import { use, useEffect, useState } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { ContinueWatchingItem } from '@/components/ContinueWatching';

export default function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [imdbId, setImdbId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // 1. Fetch Movie IMDb ID from TMDb API
  useEffect(() => {
    if (!id) return;

    if (id.startsWith('tt')) {
      setImdbId(id);
      setLoading(false);
      return;
    }

    async function fetchExternalId() {
      try {
        const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${id}/external_ids?api_key=${apiKey}`
        );
        const data = await res.json();
        setImdbId(data.imdb_id || id);
      } catch (err) {
        console.error('Failed to fetch Movie IMDb ID:', err);
        setImdbId(id);
      } finally {
        setLoading(false);
      }
    }

    fetchExternalId();
  }, [id]);

  // 2. Save/Update item in watch_history localStorage
  useEffect(() => {
    if (!id) return;

    try {
      const saved = localStorage.getItem('watch_history');
      let history: ContinueWatchingItem[] = saved ? JSON.parse(saved) : [];

      const existingIndex = history.findIndex((item) => item.id === id);

      const newItem: ContinueWatchingItem = {
        id,
        title: `Movie (${id})`,
        posterPath: '',
        type: 'movie',
        progress: 10, // Initial default progress
      };

      if (existingIndex > -1) {
        // Move updated item to top of array
        const existingItem = history[existingIndex];
        history.splice(existingIndex, 1);
        history.unshift(existingItem);
      } else {
        history.unshift(newItem);
      }

      localStorage.setItem('watch_history', JSON.stringify(history));
    } catch (e) {
      console.error('Failed to update watch history:', e);
    }
  }, [id]);

  const embedUrl = imdbId ? `https://framextv.tech/embed/${imdbId}` : '';

  return (
    <main className="min-h-screen bg-black text-white font-sans pb-16">
      <Header />

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-6">
        
        {/* Info Header */}
        <div className="flex items-center justify-between bg-neutral-900/80 border border-neutral-800 p-4 rounded-xl">
          <div>
            <h1 className="text-sm font-semibold text-neutral-300">Streaming via FrameX TV Engine</h1>
            <p className="text-xs text-neutral-500">High-bitrate HTML5 responsive player stream.</p>
          </div>
        </div>

        {/* Player Container */}
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