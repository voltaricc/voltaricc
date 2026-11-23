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
  'rgb(59, 130, 246)',  // Bright blue
];

// Converts an "rgb(r, g, b)" string into "rgba(r, g, b, alpha)" for radial gradients
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
      // Fall back to base embedUrl if parsing fails
    }

    setResolvedUrl(embedUrl);
  }, [embedUrl, mediaId, mediaType, season, episode]);

  // 2. Sample an 8x8 grid from the TMDB artwork to pick vivid colours for the glow
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

          // Keep reasonably lit, colourful pixels so the ambient glow pops
          if (brightness > 65 && brightness < 720 && saturation > 18) {
            extracted.push(`rgb(${r}, ${g}, ${b})`);
          }
        }

        if (extracted.length >= 3) {
          const step = Math.max(1, Math.floor(extracted.length / 8));
          const sampled = extracted.filter((_, idx) => idx % step === 0).slice(0, 8);
          setPalette(sampled);
        }
      } catch {
        // Keep current palette if canvas read is restricted
      }
    };
  }, [imagePath]);

  // Reset playback state and colour cycle phase when switching media or episodes
  useEffect(() => {
    setIsPlaying(false);
    setPhase(0);
  }, [embedUrl]);

  // 3. Sync glow intensity and colour phase with vidy.st / player postMessage events
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
            setTimeout(() => setPulseBoost(false), 600);
            break;

          case 'pause':
          case 'ended':
            setIsPlaying(false);
            break;

          case 'timeupdate': {
            setIsPlaying(true);
            const now = Date.now();
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
      {/* Wide, Edge-Free Radial Ambient Glow (High intensity near player, transparent by 74%) */}
      <div
        aria-hidden="true"
        style={{
          transform: 'translate3d(0, 0, 0)',
          willChange: 'opacity, transform',
          background: `
            radial-gradient(ellipse 56% 52% at 28% 35%, ${toRgba(primaryColor, 0.82)} 0%, ${toRgba(primaryColor, 0.38)} 45%, transparent 74%),
            radial-gradient(ellipse 56% 52% at 72% 65%, ${toRgba(secondaryColor, 0.78)} 0%, ${toRgba(secondaryColor, 0.34)} 45%, transparent 74%)
          `,
        }}
        className={`pointer-events-none select-none absolute -inset-24 md:-inset-32 transition-all duration-700 ease-out ${
          isPlaying
            ? pulseBoost
              ? 'opacity-100 scale-[1.04]'
              : 'opacity-100 scale-100'
            : 'opacity-65 scale-[0.99]'
        }`}
      />

      {/* Strong Inner Bezel Rim Glow hugging the video frame */}
      <div
        aria-hidden="true"
        style={{
          transform: 'translate3d(0, 0, 0)',
          backgroundColor: toRgba(primaryColor, 0.72),
        }}
        className={`pointer-events-none select-none absolute -inset-2 rounded-3xl blur-2xl transition-all duration-700 ease-out ${
          isPlaying ? 'opacity-100' : 'opacity-55'
        }`}
      />

      {/* Main Video Player Frame */}
      <div
        style={{ transform: 'translate3d(0, 0, 0)' }}
        className="relative w-full aspect-video bg-neutral-950 rounded-2xl overflow-hidden border border-white/25 shadow-2xl"
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