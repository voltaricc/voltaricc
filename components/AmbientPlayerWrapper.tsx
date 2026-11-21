'use client';

import { useEffect, useRef, useState } from 'react';
import { makeKey, readHistory } from '@/lib/watchHistory';

interface AmbientPlayerWrapperProps {
  embedUrl: string;
  title: string;
  imagePath?: string | null;
  mediaId?: string | number;
  mediaType?: 'movie' | 'tv';
  season?: number;
  episode?: number;
}

const DEFAULT_PALETTE = [
  'rgb(56, 189, 248)',  // Sky blue
  'rgb(14, 165, 233)',  // Vivid cyan
  'rgb(99, 102, 241)',  // Indigo
  'rgb(37, 99, 235)',   // Royal blue
];

function toRgba(rgb: string, alpha: number): string {
  return rgb.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
}

export default function AmbientPlayerWrapper({
  embedUrl,
  title,
  imagePath,
  mediaId,
  mediaType,
  season,
  episode,
}: AmbientPlayerWrapperProps) {
  const [palette, setPalette] = useState<string[]>(DEFAULT_PALETTE);
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState(0);
  const [pulseBoost, setPulseBoost] = useState(false);
  const [resolvedUrl, setResolvedUrl] = useState(embedUrl);

  const lastPhaseTickRef = useRef(0);

  // 1. Append saved &progress={seconds} to vidy.st URL if user previously watched this title
  useEffect(() => {
    if (!mediaId || !mediaType) {
      setResolvedUrl(embedUrl);
      return;
    }

    try {
      const stringId = String(mediaId);
      const key = makeKey(mediaType, stringId);
      const history = readHistory();
      const saved = history[key] || history[stringId];

      const matchesEpisode =
        mediaType === 'movie' ||
        (saved?.season === season && saved?.episode === episode);

      // Resume if saved time is > 15s and < 95% complete
      if (
        saved &&
        matchesEpisode &&
        saved.currentTime > 15 &&
        (saved.progressPercent ?? 0) < 95
      ) {
        const url = new URL(embedUrl);
        url.searchParams.set('progress', String(Math.floor(saved.currentTime)));
        setResolvedUrl(url.toString());
        return;
      }
    } catch {
      // Fallback to base embedUrl
    }

    setResolvedUrl(embedUrl);
  }, [embedUrl, mediaId, mediaType, season, episode]);

  // 2. Sample an 8x8 grid from the TMDB artwork for an authentic colour palette
  useEffect(() => {
    if (!imagePath) return;

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = `https://image.tmdb.org/t/p/w300${imagePath}`;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        canvas.width = 8;
        canvas.height = 8;
        ctx.drawImage(img, 0, 0, 8, 8);

        const data = ctx.getImageData(0, 0, 8, 8).data;
        const extracted: string[] = [];

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          const brightness = r + g + b;
          const saturation = Math.max(r, g, b) - Math.min(r, g, b);

          if (brightness > 85 && brightness < 690 && saturation > 22) {
            extracted.push(`rgb(${r}, ${g}, ${b})`);
          }
        }

        if (extracted.length >= 3) {
          const step = Math.max(1, Math.floor(extracted.length / 8));
          const sampled = extracted.filter((_, idx) => idx % step === 0).slice(0, 8);
          setPalette(sampled);
        }
      } catch {
        // Fallback smoothly to default palette
      }
    };
  }, [imagePath]);

  // Reset state when switching episodes/movies
  useEffect(() => {
    setIsPlaying(false);
    setPhase(0);
  }, [embedUrl]);

  // 3. Exact sync with vidy.st PLAYER_EVENT JSON strings
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (typeof event.data !== 'string') return;
      if (!event.data.includes('"event"')) return;

      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'MEDIA_DATA') return;

        switch (payload.event) {
          case 'play':
            setIsPlaying(true);
            setPulseBoost(true);
            setTimeout(() => setPulseBoost(false), 500);
            break;

          case 'pause':
          case 'ended':
            setIsPlaying(false);
            break;

          case 'timeupdate': {
            setIsPlaying(true);
            const now = Date.now();
            // Throttle colour shifts to once every 2.2s for 60fps video decoding
            if (now - lastPhaseTickRef.current >= 2200) {
              lastPhaseTickRef.current = now;
              setPhase((prev) => (prev + 1) % palette.length);
            }
            break;
          }
        }
      } catch {
        // Ignore non-JSON messages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [palette.length]);

  const primaryColor = palette[phase % palette.length];
  const secondaryColor = palette[(phase + 2) % palette.length];

  return (
    <div className="relative">
      {/* Hardware-Accelerated Radial Ambient Glow */}
      <div
        aria-hidden="true"
        style={{
          transform: 'translate3d(0, 0, 0)',
          willChange: 'opacity, transform',
          background: `
            radial-gradient(circle at 22% 28%, ${toRgba(primaryColor, 0.58)} 0%, transparent 62%),
            radial-gradient(circle at 78% 72%, ${toRgba(secondaryColor, 0.55)} 0%, transparent 62%)
          `,
        }}
        className={`pointer-events-none select-none absolute -inset-12 md:-inset-16 rounded-[3rem] transition-all duration-1000 ease-out ${
          isPlaying
            ? pulseBoost
              ? 'opacity-100 scale-[1.03]'
              : 'opacity-95 scale-100'
            : 'opacity-30 scale-[0.98]'
        }`}
      />

      {/* Crisp Inner Bezel Rim Glow */}
      <div
        aria-hidden="true"
        style={{
          transform: 'translate3d(0, 0, 0)',
          backgroundColor: toRgba(primaryColor, 0.45),
        }}
        className={`pointer-events-none select-none absolute -inset-1.5 rounded-3xl blur-xl transition-colors duration-1000 ease-out ${
          isPlaying ? 'opacity-95' : 'opacity-25'
        }`}
      />

      {/* Main Video Player Frame */}
      <div
        style={{ transform: 'translate3d(0, 0, 0)' }}
        className="relative w-full aspect-video bg-neutral-950 rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
      >
        <iframe
          src={resolvedUrl}
          className="w-full h-full border-0"
          allowFullScreen
          allow="encrypted-media; autoplay *; fullscreen *"
          title={title}
        />
      </div>
    </div>
  );
}