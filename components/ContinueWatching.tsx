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
  last_season: number | null;
  last_episode: number | null;
};

export default function ContinueWatching() {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const supabase = getSupabase();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('watch_history')
          .select('media_id, media_type, title, poster_path, last_season, last_episode')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        if (cancelled || !data) return;

        const seen = new Set<string>();
        const unique = (data as HistoryItem[]).filter((row) => {
          const key = `${row.media_type}-${row.media_id}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setItems(unique.slice(0, 10));
      } catch (err) {
        console.error('Could not load watch history:', err);
      }
    }

    load();
    return () => { cancelled = true; };
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
                ? `/tv/${item.media_id}?season=${item.last_season || 1}&episode=${item.last_episode || 1}`
                : `/watch/${item.media_id}`
            }
            title={item.title}
            posterPath={item.poster_path}
          />
        ))}
      </div>
    </section>
  );
}