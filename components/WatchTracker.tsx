'use client';

import { useEffect } from 'react';

export default function WatchTracker({
  id,
  mediaType,
  title,
  posterPath,
}: {
  id: string;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath?: string;
}) {
  useEffect(() => {
    function handlePlayerMessage(event: MessageEvent) {
      if (typeof event.data !== 'string') return;
      try {
        const payload = JSON.parse(event.data);
        
        if (payload.event === 'timeupdate' && payload.currentTime) {
          const currentTime = Math.floor(payload.currentTime);
          const duration = Math.floor(payload.duration || 0);
          const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

          if (currentTime > 5 && progressPercent < 95) {
            const historyItem = {
              id,
              mediaType,
              title,
              posterPath,
              currentTime,
              duration,
              progressPercent: Math.round(progressPercent),
              updatedAt: Date.now(),
            };

            const existingHistory = JSON.parse(localStorage.getItem('voltarix_history') || '{}');
            existingHistory[id] = historyItem;
            localStorage.setItem('voltarix_history', JSON.stringify(existingHistory));
          }
        }
      } catch (e) {
        // Ignore non-json messages
      }
    }

    window.addEventListener('message', handlePlayerMessage);
    return () => window.removeEventListener('message', handlePlayerMessage);
  }, [id, mediaType, title, posterPath]);

  return null;
}