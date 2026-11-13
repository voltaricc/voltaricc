'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSortedHistory, HISTORY_EVENT, makeKey } from '@/lib/watchHistory';

type RecommendedItem = {
  id: number;
  media_type?: 'movie' | 'tv';
  title?: string;
  name?: string;
  poster_path?: string | null;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
};

export default function YouMightLike() {
  const [recommendations, setRecommendations] = useState<RecommendedItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    async function loadRecommendations() {
      const history = getSortedHistory();
      if (history.length === 0) {
        setRecommendations([]);
        return;
      }

      // Track everything already watched so we don't recommend it again
      const watchedKeys = new Set(
        history.map((entry) => makeKey(entry.mediaType, entry.id))
      );

      // Use the top 3 most recently watched titles as seeds
      const seeds = history.slice(0, 3);

      try {
        const responses = await Promise.all(
          seeds.map(async (seed) => {
            const res = await fetch(
              `/api/recommendations?mediaType=${seed.mediaType}&id=${seed.id}`
            );
            if (!res.ok) return [];
            const data = await res.json();
            return (data.results || []).map((item: any) => ({
              ...item,
              media_type: item.media_type || seed.mediaType,
            }));
          })
        );

        // Flatten, filter out already-watched & posterless items, and deduplicate
        const seen = new Set<string>();
        const merged: RecommendedItem[] = [];

        for (const list of responses) {
          for (const item of list) {
            if (!item.poster_path) continue;
            const resolvedType: 'movie' | 'tv' =
              item.media_type === 'tv' || item.first_air_date ? 'tv' : 'movie';
            const key = makeKey(resolvedType, item.id);

            if (!watchedKeys.has(key) && !seen.has(key)) {
              seen.add(key);
              merged.push({ ...item, media_type: resolvedType });
            }
          }
        }

        // Light shuffle so recommendations feel fresh across seeds, capped at 15 items
        const shuffled = merged.sort(() => Math.random() - 0.5).slice(0, 15);
        setRecommendations(shuffled);
      } catch (err) {
        console.error('Failed to build recommendations:', err);
      }
    }

    loadRecommendations();
    window.addEventListener(HISTORY_EVENT, loadRecommendations);
    return () => window.removeEventListener(HISTORY_EVENT, loadRecommendations);
  }, []);

  if (!mounted || recommendations.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-12 mt-10 space-y-4">
      <h2
        className="text-xl md:text-2xl font-bold tracking-wide text-white"
        style={{ fontFamily: "'YouTube Sans', sans-serif" }}
      >
        You Might Like
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 custom-scrollbar scroll-smooth">
        {recommendations.map((item) => {
          const posterPath = `https://image.tmdb.org/t/p/w500${item.poster_path}`;
          const name = item.title || item.name || 'Untitled';
          const resolvedMediaType = item.media_type || 'movie';
          const linkHref =
            resolvedMediaType === 'movie' ? `/watch/${item.id}` : `/tv/${item.id}`;

          return (
            <Link
              key={`${resolvedMediaType}-${item.id}`}
              href={linkHref}
              className="flex-none w-[180px] md:w-[220px] group relative bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800/80 hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-500/10 transition-all duration-300 hover:scale-105"
            >
              <div className="relative aspect-[2/3] w-full overflow-hidden">
                <img
                  src={posterPath}
                  alt={name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                <span className="absolute top-2 left-2 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-black/70 backdrop-blur-md rounded-md text-white border border-white/15 shadow">
                  {resolvedMediaType === 'movie' ? 'Movie' : 'TV Show'}
                </span>
              </div>

              <div className="p-3">
                <h3 className="text-sm font-semibold text-white truncate group-hover:text-sky-400 transition-colors">
                  {name}
                </h3>
                <div className="flex items-center justify-between text-xs text-neutral-400 mt-1">
                  <span className="text-sky-400/90 font-medium">
                    ★ {item.vote_average?.toFixed(1) || 'N/A'}
                  </span>
                  <span>
                    {item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4) || ''}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}