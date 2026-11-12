'use client';

import { useEffect } from 'react';

const STORAGE_KEY = 'voltarix_history';

export default function WatchTracker({
  id,
  mediaType,
  title,
  posterPath,
  runtimeMinutes,
  season,
  episode,
}: {
  id: string | number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath?: string | null;
  runtimeMinutes?: number;
  season?: number;
  episode?: number;
}) {
  useEffect(() => {
    if (!id || !title) return;

    const stringId = String(id);
    const key = `${mediaType}-${stringId}`;
    const duration = (runtimeMinutes || (mediaType === 'movie' ? 120 : 45)) * 60;

    const read = () => {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      } catch {
        return {};
      }
    };

    const existing = read()[key] || read()[stringId]; // Fallback to migrate old ID-only entries
    // Reset elapsed time if switching to a different TV episode
    const isSameEpisode =
      mediaType === 'movie' ||
      (existing?.season === season && existing?.episode === episode);

    let elapsed = isSameEpisode ? (existing?.currentTime ?? 0) : 0;
    let lastTick: number | null = document.hidden ? null : Date.now();

    const save = () => {
      try {
        const history = read();
        // Clean up legacy unprefixed key if migrating
        if (history[stringId]) delete history[stringId];

        history[key] = {
          storageKey: key,
          id: stringId,
          mediaType,
          season,
          episode,
          title,
          posterPath: posterPath || existing?.posterPath || null,
          currentTime: Math.floor(elapsed),
          duration,
          progressPercent: Math.min(100, Math.round((elapsed / duration) * 100)),
          updatedAt: Date.now(),
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        window.dispatchEvent(new Event('voltarix_history_updated'));
      } catch (e) {
        console.error('Failed to sync watch history:', e);
      }
    };

    const tick = () => {
      const now = Date.now();
      if (lastTick !== null) {
        elapsed = Math.min(duration, elapsed + (now - lastTick) / 1000);
      }
      lastTick = document.hidden ? null : now;
    };

    // Save immediately on mount so the visit is registered right away
    save();

    const onVisibility = () => {
      tick();
      save();
    };

    const timer = setInterval(() => {
      tick();
      save();
    }, 5000);

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onVisibility);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onVisibility);
      tick();
      save();
    };
  }, [id, mediaType, title, posterPath, runtimeMinutes, season, episode]);

  return null;
}