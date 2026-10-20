'use client';

import { use, useEffect, useState } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { ContinueWatchingItem } from '@/components/ContinueWatching';

export default function TVWatchPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [imdbId, setImdbId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [season, setSeason] = useState<number>(1);
  const [episode, setEpisode] = useState<number>(1);

  // 1. Fetch TV Series IMDb ID from TMDb API
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
          `https://api.themoviedb.org/3/tv/${id}/external_ids?api_key=${apiKey}`
        );
        const data = await res.json();
        setImdbId(data.imdb_id || id);
      } catch (err) {
        console.error('Failed to fetch TV IMDb ID:', err);
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
        title: `TV Series (${id})`,
        posterPath: '',
        type: 'tv',
        season,
        episode,
        progress: 10,
      };

      if (existingIndex > -1) {
        history[existingIndex] = {
          ...history[existingIndex],
          season,
          episode,
        };
      } else {
        history.unshift(newItem);
      }

      localStorage.setItem('watch_history', JSON.stringify(history));
    } catch (e) {
      console.error('Failed to update watch history:', e);
    }
  }, [id, season, episode]);

  // FrameX TV embed URL for TV shows
  // Supports both path-based (/embed/tv/id/s/e) and TMDb query parameters
  const embedUrl = imdbId
    ? `https://framextv.tech/embed/tv/${imdbId}/${season}/${episode}`
    : `https://framextv.tech/embed/tv/${id}?s=${season}&e=${episode}`;

  return (
    <main className="min-h-screen bg-black text-white font-sans pb-16">
      <Header />

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-6">
        
        {/* Controls Bar: Season & Episode Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-neutral-900/80 border border-neutral-800 p-4 rounded-xl">
          <div>
            <h1 className="text-sm font-semibold text-neutral-300">Streaming via FrameX TV Engine</h1>
            <p className="text-xs text-neutral-500">Select your season and episode below.</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Season Selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="season-select" className="text-xs text-neutral-400 font-medium">
                Season:
              </label>
              <select
                id="season-select"
                value={season}
                onChange={(e) => {
                  setSeason(Number(e.target.value));
                  setEpisode(1);
                }}
                className="bg-neutral-800 text-neutral-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-neutral-700 focus:outline-none focus:border-sky-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                  <option key={s} value={s}>
                    Season {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Episode Selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="episode-select" className="text-xs text-neutral-400 font-medium">
                Episode:
              </label>
              <select
                id="episode-select"
                value={episode}
                onChange={(e) => setEpisode(Number(e.target.value))}
                className="bg-neutral-800 text-neutral-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-neutral-700 focus:outline-none focus:border-sky-500"
              >
                {Array.from({ length: 24 }, (_, i) => i + 1).map((e) => (
                  <option key={e} value={e}>
                    Episode {e}
                  </option>
                ))}
              </select>
            </div>
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
              key={`${imdbId || id}-${season}-${episode}`}
              src={embedUrl}
              className="w-full h-full border-0"
              allowFullScreen
              title="TV Video Player"
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