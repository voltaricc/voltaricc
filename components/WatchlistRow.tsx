'use client';

import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase/client';
import PosterCard from './PosterCard';
import { RowHeading } from './MediaRow';

type Item = {
  id: string;
  media_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  vote_average: number | null;
};

export default function WatchlistRow() {
  const [items, setItems] = useState<Item[]>([]);

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
          .from('watchlist')
          .select('id, media_id, media_type, title, poster_path, vote_average')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        if (!cancelled && data) setItems(data as Item[]);
      } catch (err) {
        console.error('Could not load watchlist:', err);
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
      <RowHeading>My List</RowHeading>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
        {items.map((item) => (
          <PosterCard
            key={item.id}
            href={item.media_type === 'tv' ? `/tv/${item.media_id}` : `/watch/${item.media_id}`}
            title={item.title}
            posterPath={item.poster_path}
            rating={item.vote_average ?? undefined}
          />
        ))}
      </div>
    </section>
  );
}