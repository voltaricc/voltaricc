'use client';

import { useEffect, useState } from 'react';
import PosterCard from '@/components/PosterCard';
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

      // Exclude anything already in watch history so suggestions feel fresh
      const watchedKeys = new Set(
        history.map((entry) => makeKey(entry.mediaType, entry.id))
      );

      // Use up to 4 most recently watched titles as seeds
      const seeds = history.slice(0, 4);

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

        // Light shuffle and cap at 15 items to keep the row fast and varied
        const shuffled = merged.sort(() => Math.random() - 0.5).slice(0, 15);
        setRecommendations(shuffled);
      } catch (err) {
        console.error('Failed to build recommendations:', err);
      }
    }

    loadRecommendations();
    window.addEventListener(HISTORY_EVENT, loadRecommendations);
    window.addEventListener('storage', loadRecommendations);
    return () => {
      window.removeEventListener(HISTORY_EVENT, loadRecommendations);
      window.removeEventListener('storage', loadRecommendations);
    };
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
          const name = item.title || item.name || 'Untitled';
          const resolvedMediaType: 'movie' | 'tv' =
            item.media_type === 'tv' ? 'tv' : 'movie';
          const linkHref =
            resolvedMediaType === 'movie' ? `/watch/${item.id}` : `/tv/${item.id}`;
          const releaseYear =
            item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4) || '';

          return (
            <PosterCard
              key={`${resolvedMediaType}-${item.id}`}
              href={linkHref}
              mediaId={item.id}
              mediaType={resolvedMediaType}
              title={name}
              posterPath={item.poster_path || null}
              rating={item.vote_average}
              subtitle={releaseYear}
              className="flex-none w-[180px] md:w-[220px]"
            />
          );
        })}
      </div>
    </section>
  );
}