'use client';

import { useEffect } from 'react';
import { makeKey, readHistory, writeHistory } from '@/lib/watchHistory';

const MIN_WATCH_SECONDS = 10; // Ignore brief clicks or accidental page visits

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
    const duration = (runtimeMinutes || (mediaType === 'movie' ? 120 : 45)) * 60;

    const initialHistory = readHistory();
    const existing = initialHistory[key] || initialHistory[stringId];
    const isSameEpisode =
      mediaType === 'movie' ||
      (existing?.season === season && existing?.episode === episode);

    let elapsed = isSameEpisode ? (existing?.currentTime ?? 0) : 0;
    let sessionWatched = 0;
    let isPlaying = false;
    let lastTick: number | null = null;

    const startTracking = () => {
      if (!isPlaying) {
        isPlaying = true;
        lastTick = document.hidden ? null : Date.now();
      }
    };

    const pauseTracking = () => {
      tick();
      isPlaying = false;
      lastTick = null;
    };

    const tick = () => {
      if (!isPlaying) return;
      const now = Date.now();
      if (lastTick !== null && !document.hidden) {
        const delta = (now - lastTick) / 1000;
        elapsed = Math.min(duration, elapsed + delta);
        sessionWatched += delta;
      }
      lastTick = document.hidden ? null : now;
    };

    const save = () => {
      // Do not log anything unless the user has actively watched for at least 10s
      if (sessionWatched < MIN_WATCH_SECONDS) return;

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
          currentTime: Math.floor(elapsed),
          duration,
          progressPercent: Math.min(100, Math.round((elapsed / duration) * 100)),
          updatedAt: Date.now(),
        };

        writeHistory(history);
      } catch (e) {
        console.error('Failed to sync watch history:', e);
      }
    };

    // 1. Detect iframe click (user clicked Play inside the player)
    const handleWindowBlur = () => {
      if (document.activeElement?.tagName === 'IFRAME') {
        startTracking();
      }
    };

    // 2. Listen for embed postMessage events (play, pause, timeupdate)
    const handleMessage = (event: MessageEvent) => {
      try {
        const payload =
          typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (!payload) return;

        const state = String(
          payload.event || payload.type || payload.state || ''
        ).toLowerCase();

        if (state.includes('play') || state.includes('timeupdate')) {
          startTracking();
        } else if (state.includes('pause') || state.includes('end')) {
          pauseTracking();
          save();
        }
      } catch {
        // Ignore unrelated window messages
      }
    };

    const onVisibility = () => {
      tick();
      if (document.hidden) {
        lastTick = null;
      } else if (isPlaying) {
        lastTick = Date.now();
      }
      save();
    };

    const timer = setInterval(() => {
      tick();
      save();
    }, 5000);

    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('message', handleMessage);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onVisibility);

    return () => {
      clearInterval(timer);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('message', handleMessage);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onVisibility);
      tick();
      save();
    };
  }, [id, mediaType, title, posterPath, runtimeMinutes, season, episode]);

  return null;
}