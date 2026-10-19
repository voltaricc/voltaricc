'use client';

import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase/client';
import PosterCard from './PosterCard';
import { RowHeading } from './MediaRow';

type HistoryItem = {
  media_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  season: number | null;
  episode: number | null;
};

export default function ContinueWatching() {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const supabase = getSupabase();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('watch_history')
          .select('media_id, media_type, title, poster_path, season, episode')
          .eq('user_id', user.id)
          .order('watched_at', { ascending: false })
          .limit(30);

        if (error) throw error;
        if (cancelled || !data) return;

        // Newest first, one card per title.
        const seen = new Set<string>();
        const unique = (data as HistoryItem[]).filter((row) => {
          const key = `${row.media_type}-${row.media_id}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setItems(unique.slice(0, 12));
      } catch (err) {
        console.error('Could not load watch history:', err);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!items.length) return null;

  return (
    <section>
      <RowHeading>Continue Watching</RowHeading>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
        {items.map((item) => (
          <PosterCard
            key={`${item.media_type}-${item.media_id}`}
            href={
              item.media_type === 'tv'
                ? `/tv/${item.media_id}?season=${item.season || 1}&episode=${item.episode || 1}`
                : `/watch/${item.media_id}`
            }
            title={item.title}
            posterPath={item.poster_path}
            subtitle={
              item.media_type === 'tv' ? `S${item.season || 1} · E${item.episode || 1}` : undefined
            }
          />
        ))}
      </div>
    </section>
  );
}