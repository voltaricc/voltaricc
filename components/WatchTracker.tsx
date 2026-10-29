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
    if (!id || !title) return;

    // 1. Instantly log/update history when opening the watch page
    const historyItem = {
      id,
      mediaType,
      title,
      posterPath,
      currentTime: 0,
      duration: 0,
      progressPercent: 5, // Initial starting progress so it shows up immediately
      updatedAt: Date.now(),
    };

    try {
      const existingHistory = JSON.parse(localStorage.getItem('voltarix_history') || '{}');
      // Only overwrite if it doesn't already exist or to bump timestamp to the top
      existingHistory[id] = {
        ...historyItem,
        progressPercent: existingHistory[id]?.progressPercent || 5,
      };
      localStorage.setItem('voltarix_history', JSON.stringify(existingHistory));
      window.dispatchEvent(new Event('voltarix_history_updated'));
    } catch (e) {
      console.error('Failed to save watch history:', e);
    }

    // 2. Fallback message listener for iframes that do support postMessage
    function handlePlayerMessage(event: MessageEvent) {
      if (typeof event.data !== 'string') return;
      try {
        const payload = JSON.parse(event.data);
        if (payload.event === 'timeupdate' && payload.currentTime) {
          const currentTime = Math.floor(payload.currentTime);
          const duration = Math.floor(payload.duration || 0);
          const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 5;

          const updatedItem = {
            id,
            mediaType,
            title,
            posterPath,
            currentTime,
            duration,
            progressPercent: Math.round(progressPercent),
            updatedAt: Date.now(),
          };

          const history = JSON.parse(localStorage.getItem('voltarix_history') || '{}');
          history[id] = updatedItem;
          localStorage.setItem('voltarix_history', JSON.stringify(history));
          window.dispatchEvent(new Event('voltarix_history_updated'));
        }
      } catch (err) {
        // Ignore non-json messages
      }
    }

    window.addEventListener('message', handlePlayerMessage);
    return () => window.removeEventListener('message', handlePlayerMessage);
  }, [id, mediaType, title, posterPath]);

  return null;
}