'use client';

import { useEffect } from 'react';
import { makeKey, readHistory, writeHistory } from '@/lib/watchHistory';

const MIN_WATCH_SECONDS = 10; // Ignore brief clicks or accidental page visits
const SAVE_INTERVAL_MS = 10000; // Save every 10s during active playback

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
    const key = makeKey(mediaType, stringId);
    let duration = (runtimeMinutes || (mediaType === 'movie' ? 120 : 45)) * 60;

    const initialHistory = readHistory();
    const existing = initialHistory[key] || initialHistory[stringId];
    const isSameEpisode =
      mediaType === 'movie' ||
      (existing?.season === season && existing?.episode === episode);

    let currentTime = isSameEpisode ? (existing?.currentTime ?? 0) : 0;
    let sessionWatched = 0;
    let isPlaying = false;
    let lastTick: number | null = null;
    let lastSavedSecond = Math.floor(currentTime);

    const accumulateWatchTime = () => {
      if (!isPlaying) return;
      const now = Date.now();
      if (lastTick !== null && !document.hidden) {
        const delta = (now - lastTick) / 1000;
        if (delta > 0 && delta < 15) {
          sessionWatched += delta;
        }
      }
      lastTick = document.hidden ? null : now;
    };

    const save = (force = false) => {
      if (sessionWatched < MIN_WATCH_SECONDS) return;

      const flooredTime = Math.floor(currentTime);
      if (!force && flooredTime === lastSavedSecond) return;

      try {
        const history = readHistory();
        if (history[stringId]) delete history[stringId];

        history[key] = {
          storageKey: key,
          id: stringId,
          mediaType,
          season,
          episode,
          title,
          posterPath: posterPath || existing?.posterPath || null,
          currentTime: flooredTime,
          duration: Math.round(duration),
          progressPercent: Math.min(100, Math.round((currentTime / duration) * 100)),
          updatedAt: Date.now(),
        };

        writeHistory(history);
        lastSavedSecond = flooredTime;
      } catch (e) {
        console.error('Failed to sync watch history:', e);
      }
    };

    // Listen to vidy.st JSON string messages:
    // { event: "timeupdate" | "play" | "pause" | "ended", currentTime, duration }
    const handleMessage = (event: MessageEvent) => {
      // vidy.st always posts JSON strings; ignore non-strings & heavy MEDIA_DATA dumps
      if (typeof event.data !== 'string') return;
      if (!event.data.includes('"event"')) return;

      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'MEDIA_DATA') return;

        if (typeof payload.duration === 'number' && payload.duration > 0) {
          duration = payload.duration;
        }

        if (typeof payload.currentTime === 'number' && payload.currentTime >= 0) {
          currentTime = payload.currentTime;
        }

        switch (payload.event) {
          case 'play':
            isPlaying = true;
            lastTick = document.hidden ? null : Date.now();
            break;

          case 'timeupdate':
            if (!isPlaying) {
              isPlaying = true;
              lastTick = document.hidden ? null : Date.now();
            } else {
              accumulateWatchTime();
            }
            break;

          case 'pause':
            accumulateWatchTime();
            isPlaying = false;
            lastTick = null;
            save(true);
            break;

          case 'ended':
            accumulateWatchTime();
            isPlaying = false;
            lastTick = null;
            currentTime = duration;
            save(true);
            break;
        }
      } catch {
        // Ignore non-JSON strings
      }
    };

    const onVisibility = () => {
      accumulateWatchTime();
      if (document.hidden) {
        lastTick = null;
        save(true);
      } else if (isPlaying) {
        lastTick = Date.now();
      }
    };

    const timer = setInterval(() => {
      if (!isPlaying) return;
      accumulateWatchTime();
      save(false);
    }, SAVE_INTERVAL_MS);

    window.addEventListener('message', handleMessage);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onVisibility);

    return () => {
      clearInterval(timer);
      window.removeEventListener('message', handleMessage);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onVisibility);
      accumulateWatchTime();
      save(true);
    };
  }, [id, mediaType, title, posterPath, runtimeMinutes, season, episode]);

  return null;
}