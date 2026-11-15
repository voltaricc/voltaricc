'use client';

import { useEffect, useState } from 'react';

interface AmbientPlayerWrapperProps {
  embedUrl: string;
  title: string;
  imagePath?: string | null;
}

const DEFAULT_PALETTE = [
  'rgb(56, 189, 248)',  // Sky blue
  'rgb(14, 165, 233)',  // Vivid cyan
  'rgb(99, 102, 241)',  // Indigo
  'rgb(30, 58, 138)',   // Deep blue
];

export default function AmbientPlayerWrapper({
  embedUrl,
  title,
  imagePath,
}: AmbientPlayerWrapperProps) {
  const [palette, setPalette] = useState<string[]>(DEFAULT_PALETTE);
  const [isPlaying, setIsPlaying] = useState(true);
  const [phase, setPhase] = useState(0);
  const [pulseBoost, setPulseBoost] = useState(false);

  // 1. Sample an 8x8 grid (64 regions) from the TMDB artwork for a richer palette
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

          // Keep vibrant, well-lit tones and skip muddy darks/washed-out whites
          if (brightness > 90 && brightness < 680 && saturation > 25) {
            extracted.push(`rgb(${r}, ${g}, ${b})`);
          }
        }

        if (extracted.length >= 3) {
          // Pick up to 8 evenly spaced colours across the image
          const step = Math.max(1, Math.floor(extracted.length / 8));
          const sampled = extracted.filter((_, idx) => idx % step === 0).slice(0, 8);
          setPalette(sampled);
        }
      } catch {
        // Fallback smoothly to default palette
      }
    };
  }, [imagePath]);

  // 2. Listen for player postMessage events (play, pause, timeupdate) & iframe focus
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
        if (state.includes('pause') || state.includes('end') || state.includes('buffer')) {
          setIsPlaying(false);
        }

        // If the embed emits timeupdate ticks, advance the colour phase immediately
        if (state.includes('timeupdate') || typeof payload.currentTime === 'number') {
          setIsPlaying(true);
          setPhase((prev) => (prev + 1) % palette.length);
        }
      } catch {
        // Ignore unrelated window messages
      }
    };

    // Detect when the user clicks inside the iframe player
    const handleWindowBlur = () => {
      if (document.activeElement?.tagName === 'IFRAME') {
        setIsPlaying(true);
        setPulseBoost(true);
        setTimeout(() => setPulseBoost(false), 600);
      }
    };

    window.addEventListener('message', handleMessage);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [palette.length]);

  // 3. High-frequency ambient light cycle (every 1.4s during playback)
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setPhase((prev) => (prev + 1) % palette.length);
    }, 1400);

    return () => clearInterval(interval);
  }, [isPlaying, palette.length]);

  const primaryColor = palette[phase % palette.length];
  const secondaryColor = palette[(phase + 2) % palette.length];
  const tertiaryColor = palette[(phase + 4) % palette.length];

  return (
    <div className="relative">
      {/* High-Frequency Dynamic Ambient Light Orbs */}
      <div
        aria-hidden="true"
        className={`pointer-events-none select-none transition-all duration-700 ${
          isPlaying
            ? pulseBoost
              ? 'opacity-95 scale-105'
              : 'opacity-80 scale-100'
            : 'opacity-25 scale-95'
        }`}
      >
        {/* Top-Left / Primary Colour Wash */}
        <div
          className="absolute -top-12 -left-12 w-3/4 h-3/4 rounded-full blur-[100px] saturate-200 transition-colors duration-1000 ease-in-out"
          style={{ backgroundColor: primaryColor }}
        />

        {/* Bottom-Right / Secondary Colour Wash */}
        <div
          className="absolute -bottom-12 -right-12 w-3/4 h-3/4 rounded-full blur-[100px] saturate-200 transition-colors duration-1000 ease-in-out"
          style={{ backgroundColor: secondaryColor }}
        />

        {/* Centre Atmospheric Halo */}
        <div
          className="absolute -inset-6 rounded-[2.5rem] blur-[75px] opacity-65 saturate-150 transition-colors duration-1000 ease-in-out"
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