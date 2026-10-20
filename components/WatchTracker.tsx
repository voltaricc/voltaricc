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
  progress?: number;
}

export default function WatchTracker({
  mediaId,
  mediaType,
  title,
  posterPath,
  season,
  episode,
  progress = 10,
}: WatchTrackerProps) {
  useEffect(() => {
    if (!mediaId || !title) return;

    try {
      const saved = localStorage.getItem('watch_history');
      let history = saved ? JSON.parse(saved) : [];

      history = history.filter((item: any) => item.id !== mediaId);

      const newItem = {
        id: mediaId,
        title,
        posterPath,
        type: mediaType,
        season,
        episode,
        progress, // Saves the current progress percentage
        updatedAt: new Date().toISOString(),
      };

      history.unshift(newItem);
      localStorage.setItem('watch_history', JSON.stringify(history));
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  }, [mediaId, mediaType, title, posterPath, season, episode, progress]);

  return null;
}