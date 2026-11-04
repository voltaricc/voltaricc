'use client';

import { useEffect } from 'react';

export default function WatchTracker({
  id,
  mediaType,
  title,
  posterPath,
  runtimeMinutes,
}: {
  id: string;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath?: string;
  runtimeMinutes?: number;
}) {
  useEffect(() => {
    if (!id || !title) return;

    // Use actual TMDB runtime in seconds, or default to 120m for movies / 45m for TV shows
    const totalDurationSeconds = (runtimeMinutes || (mediaType === 'movie' ? 120 : 45)) * 60;
    
    // Check if there's already saved progress so it resumes smoothly
    let elapsedSeconds = 0;
    try {
      const existingHistory = JSON.parse(localStorage.getItem('voltarix_history') || '{}');
      if (existingHistory[id]?.currentTime) {
        elapsedSeconds = existingHistory[id].currentTime;
      }
    } catch (e) {}

    const saveProgress = () => {
      elapsedSeconds += 5; // Add 5 real seconds every 5 seconds
      const progressPercent = Math.min(99, Math.round((elapsedSeconds / totalDurationSeconds) * 100));

      try {
        const history = JSON.parse(localStorage.getItem('voltarix_history') || '{}');
        history[id] = {
          id,
          mediaType,
          title,
          posterPath,
          currentTime: elapsedSeconds,
          duration: totalDurationSeconds,
          progressPercent,
          updatedAt: Date.now(),
        };
        localStorage.setItem('voltarix_history', JSON.stringify(history));
        window.dispatchEvent(new Event('voltarix_history_updated'));
      } catch (e) {
        console.error('Failed to sync progress:', e);
      }
    };

    // Run every 5 seconds to accurately track real elapsed watch time
    const timer = setInterval(saveProgress, 5000);

    return () => clearInterval(timer);
  }, [id, mediaType, title, posterPath, runtimeMinutes]);

  return null;
}