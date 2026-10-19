'use client';

import { useEffect } from 'react';
import { getSupabase } from '@/lib/supabase/client';

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
  useEffect(() => {
    let cancelled = false;

    async function recordHistory() {
      try {
        const supabase = getSupabase();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user || cancelled) return;

        const fields = {
          title,
          poster_path: posterPath || null,
          season: season ?? null,
          episode: episode ?? null,
          watched_at: new Date().toISOString(),
        };

        // Is this title already in the history? If so, update it. If not, add it.
        const { data: existing, error: findError } = await supabase
          .from('watch_history')
          .select('id')
          .eq('user_id', user.id)
          .eq('media_id', mediaId)
          .eq('media_type', mediaType)
          .limit(1)
          .maybeSingle();
        if (findError) throw findError;

        const { error } = existing
          ? await supabase.from('watch_history').update(fields).eq('id', existing.id)
          : await supabase
              .from('watch_history')
              .insert({ user_id: user.id, media_id: mediaId, media_type: mediaType, ...fields });
        if (error) throw error;
      } catch (err) {
        console.error('Could not save watch history:', err);
      }
    }

    recordHistory();
    return () => {
      cancelled = true;
    };
  }, [mediaId, mediaType, title, posterPath, season, episode]);

  return null;
}