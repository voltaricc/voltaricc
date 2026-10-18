'use client';

import { useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

interface WatchTrackerProps {
  mediaId: string;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath: string;
  season?: number;
  episode?: number;
}

export default function WatchTracker({
  mediaId,
  mediaType,
  title,
  posterPath,
  season,
  episode,
}: WatchTrackerProps) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  useEffect(() => {
    async function recordHistory() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('watch_history').upsert(
        {
          user_id: user.id,
          media_id: mediaId,
          media_type: mediaType,
          title,
          poster_path: posterPath,
          season: season || null,
          episode: episode || null,
          watched_at: new Date().toISOString(),
        },
        { onConflict: 'user_id, media_id, media_type, season, episode' }
      );
    }

    recordHistory();
  }, [mediaId, mediaType, season, episode]);

  return null;
}