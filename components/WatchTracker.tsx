'use client';

import { useEffect } from 'react';
import { makeKey, readHistory, writeHistory } from '@/lib/watchHistory';

const MIN_WATCH_SECONDS = 10; // Ignore brief clicks or accidental page visits
const SAVE_INTERVAL_MS = 5000;  // Save every 5s during active playback

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
    let lastSavedSecond = -1;
    let receivedNativeTime = false;

    const startTracking = () => {
      if (!isPlaying) {
        isPlaying = true;
        lastTick = document.hidden ? null : Date.now();
      }
    };

    const tick = () => {
      if (!isPlaying) return;
      const now = Date.now();
      if (lastTick !== null && !document.hidden) {
        const delta = (now - lastTick) / 1000;
        if (delta > 0 && delta < 30) {
          sessionWatched += delta;
          // Only advance currentTime via wall-clock if player isn't sending exact timestamps
          if (!receivedNativeTime) {
            currentTime = Math.min(duration, currentTime + delta);
          }
        }
      }
      lastTick = document.hidden ? null : now;
    };

    const pauseTracking = () => {
      tick();
      isPlaying = false;
      lastTick = null;
    };

    const save = (force = false) => {
      if (sessionWatched < MIN_WATCH_SECONDS) return;

      const flooredTime = Math.floor(currentTime);
      if (!force && flooredTime === lastSavedSecond) return;

      try {
        const history = readHistory();
        if (history[stringId]) delete history[stringId];

        const progressPercent = Math.min(
          100,
          Math.max(1, Math.round((currentTime / duration) * 100))
        );

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
          progressPercent,
          updatedAt: Date.now(),
        };

        writeHistory(history);
        lastSavedSecond = flooredTime;
      } catch (e) {
        console.error('Failed to sync watch history:', e);
      }
    };

    // 1. Guaranteed Fallback: Detect when user clicks inside the iframe player
    const handleWindowBlur = () => {
      if (document.activeElement?.tagName === 'IFRAME') {
        startTracking();
      }
    };

    // 2. Native Sync: Listen to vidy.st / player postMessage events
    const handleMessage = (event: MessageEvent) => {
      if (event.origin === window.location.origin) return;

      try {
        const raw =
          typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (!raw || typeof raw !== 'object') return;

        // Ignore heavy MEDIA_DATA history dumps
        if (raw.type === 'MEDIA_DATA') return;

        const payload =
          raw.data && typeof raw.data === 'object' ? { ...raw, ...raw.data } : raw;

        const eventName = String(
          payload.event || payload.type || payload.state || ''
        ).toLowerCase();

        if (typeof payload.duration === 'number' && payload.duration > 0) {
          duration = payload.duration;
        }

        if (typeof payload.currentTime === 'number' && payload.currentTime >= 0) {
          receivedNativeTime = true;
          currentTime = Math.min(duration, payload.currentTime);
        }

        if (
          eventName === 'play' ||
          eventName === 'playing' ||
          eventName === 'resume'
        ) {
          startTracking();
        } else if (eventName === 'timeupdate' || eventName === 'progress') {
          if (!isPlaying) {
            startTracking();
          } else {
            tick();
          }
        } else if (eventName === 'pause') {
          pauseTracking();
          save(true);
        } else if (eventName === 'ended') {
          pauseTracking();
          currentTime = duration;
          save(true);
        }
      } catch {
        // Ignore unrelated window messages
      }
    };

    const onVisibility = () => {
      tick();
      if (document.hidden) {
        lastTick = null;
        save(true);
      } else if (isPlaying) {
        lastTick = Date.now();
      }
    };

    const timer = setInterval(() => {
      if (!isPlaying) return;
      tick();
      save(false);
    }, SAVE_INTERVAL_MS);

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
      save(true);
    };
  }, [id, mediaType, title, posterPath, runtimeMinutes, season, episode]);

  return null;
}