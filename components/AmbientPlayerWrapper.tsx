'use client';

import { useEffect, useState } from 'react';

interface AmbientPlayerWrapperProps {
  embedUrl: string;
  title: string;
  imagePath?: string | null;
}

const DEFAULT_PALETTE = [
  'rgb(56, 189, 248)',  // Sky blue fallback
  'rgb(14, 165, 233)',
  'rgb(30, 58, 138)',
];

export default function AmbientPlayerWrapper({
  embedUrl,
  title,
  imagePath,
}: AmbientPlayerWrapperProps) {
  const [palette, setPalette] = useState<string[]>(DEFAULT_PALETTE);
  const [isPlaying, setIsPlaying] = useState(true);
  const [phase, setPhase] = useState(0);

  // 1. Extract dominant colours from the TMDB artwork via a hidden Canvas
  useEffect(() => {
    if (!imagePath) return;

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = `https://image.tmdb.org/t/p/w300${imagePath}`;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Downscale to a 4x4 grid to quickly sample dominant regions
        canvas.width = 4;
        canvas.height = 4;
        ctx.drawImage(img, 0, 0, 4, 4);

        const data = ctx.getImageData(0, 0, 4, 4).data;
        const extracted: string[] = [];

        // Sample 4 distinct quadrants (top-left, top-right, bottom-left, center)
        const sampleIndices = [0, 3, 12, 10];
        for (const idx of sampleIndices) {
          const offset = idx * 4;
          const r = data[offset];
          const g = data[offset + 1];
          const b = data[offset + 2];

          // Avoid near-black pixels so the glow stays vibrant
          if (r + g + b > 60) {
            extracted.push(`rgb(${r}, ${g}, ${b})`);
          }
        }

        if (extracted.length >= 2) {
          setPalette(extracted);
        }
      } catch {
        // Fallback smoothly to default sky palette if canvas is tainted
      }
    };
  }, [imagePath]);

  // 2. Listen for vidy.st / player postMessage events (play/pause) if emitted
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const payload =
          typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (!payload) return;

        const state = String(
          payload.event || payload.type || payload.state || ''
        ).toLowerCase();

        if (state.includes('play')) setIsPlaying(true);
        if (state.includes('pause') || state.includes('end')) setIsPlaying(false);
      } catch {
        // Ignore unrelated window messages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // 3. Cycle ambient colour shifts gently during active playback
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setPhase((prev) => (prev + 1) % palette.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [isPlaying, palette.length]);

  const primaryColor = palette[phase % palette.length];
  const secondaryColor = palette[(phase + 1) % palette.length];
  const tertiaryColor = palette[(phase + 2) % palette.length];

  return (
    <div className="relative">
      {/* Dynamic Shifting Ambient Light Orbs */}
      <div
        aria-hidden="true"
        className={`pointer-events-none select-none transition-opacity duration-1000 ${
          isPlaying ? 'opacity-70' : 'opacity-30'
        }`}
      >
        {/* Top-Left / Primary Colour Wash */}
        <div
          className="absolute -top-12 -left-12 w-3/4 h-3/4 rounded-full blur-[110px] saturate-200 transition-colors duration-[4000ms] ease-in-out"
          style={{ backgroundColor: primaryColor }}
        />

        {/* Bottom-Right / Secondary Colour Wash */}
        <div
          className="absolute -bottom-12 -right-12 w-3/4 h-3/4 rounded-full blur-[110px] saturate-200 transition-colors duration-[4000ms] ease-in-out"
          style={{ backgroundColor: secondaryColor }}
        />

        {/* Centre Atmospheric Halo */}
        <div
          className="absolute -inset-6 rounded-[2.5rem] blur-[80px] opacity-60 saturate-150 transition-colors duration-[4000ms] ease-in-out"
          style={{ backgroundColor: tertiaryColor }}
        />
      </div>

      {/* Main Video Player Frame */}
      <div className="relative w-full aspect-video bg-neutral-950 rounded-2xl overflow-hidden border border-white/15 shadow-2xl">
        <iframe
          src={embedUrl}
          className="w-full h-full border-0"
          allowFullScreen
          allow="encrypted-media; autoplay *; fullscreen *"
          title={title}
        />
      </div>
    </div>
  );
}