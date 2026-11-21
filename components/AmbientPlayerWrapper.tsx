'use client';

import { useEffect, useRef, useState } from 'react';

interface AmbientPlayerWrapperProps {
  embedUrl: string;
  title: string;
  imagePath?: string | null;
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
}: AmbientPlayerWrapperProps) {
  const [palette, setPalette] = useState<string[]>(DEFAULT_PALETTE);
  const [isPlaying, setIsPlaying] = useState(true);
  const [phase, setPhase] = useState(0);
  const [pulseBoost, setPulseBoost] = useState(false);

  const isHoveringPlayerRef = useRef(false);
  const receivedPostMessageRef = useRef(false);
  const lastPhaseTickRef = useRef(0);

  // 1. Sample an 8x8 grid from the TMDB artwork for an authentic colour palette
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

  // Reset playback state when switching episodes or movies
  useEffect(() => {
    setIsPlaying(true);
    setPhase(0);
    receivedPostMessageRef.current = false;
  }, [embedUrl]);

  // 2. Throttled sync with embed postMessage events & iframe click detection
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const raw =
          typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (!raw || typeof raw !== 'object') return;

        const eventName = String(
          raw.event || raw.type || raw.state || raw.action || raw.data?.event || ''
        ).toLowerCase();

        const hasTime =
          typeof raw.currentTime === 'number' || typeof raw.data?.currentTime === 'number';

        if (!eventName && !hasTime) return;

        receivedPostMessageRef.current = true;

        if (
          eventName.includes('play') ||
          eventName.includes('resume') ||
          eventName.includes('playing')
        ) {
          setIsPlaying(true);
          setPulseBoost(true);
          setTimeout(() => setPulseBoost(false), 500);
        } else if (
          eventName.includes('pause') ||
          eventName.includes('end') ||
          eventName.includes('stop') ||
          eventName.includes('buffer') ||
          eventName.includes('waiting')
        ) {
          setIsPlaying(false);
        }

        // Throttle timeupdate ticks to once every 2.2s so video decoding never stutters
        if (eventName.includes('timeupdate') || eventName.includes('progress') || hasTime) {
          const now = Date.now();
          if (now - lastPhaseTickRef.current >= 2200) {
            lastPhaseTickRef.current = now;
            setIsPlaying(true);
            setPhase((prev) => (prev + 1) % palette.length);
          }
        }
      } catch {
        // Ignore unrelated messages
      }
    };

    const handleWindowBlur = () => {
      if (
        !receivedPostMessageRef.current &&
        (isHoveringPlayerRef.current || document.activeElement?.tagName === 'IFRAME')
      ) {
        setIsPlaying((prev) => !prev);
        setPulseBoost(true);
        setTimeout(() => setPulseBoost(false), 550);

        setTimeout(() => {
          if (document.activeElement?.tagName === 'IFRAME') {
            window.focus();
          }
        }, 250);
      }
    };

    window.addEventListener('message', handleMessage);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [palette.length]);

  // 3. Gentle 2.4s colour cycle while playing (low CPU/GPU overhead)
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastPhaseTickRef.current >= 2000) {
        lastPhaseTickRef.current = now;
        setPhase((prev) => (prev + 1) % palette.length);
      }
    }, 2400);

    return () => clearInterval(interval);
  }, [isPlaying, palette.length]);

  const primaryColor = palette[phase % palette.length];
  const secondaryColor = palette[(phase + 2) % palette.length];

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        isHoveringPlayerRef.current = true;
      }}
      onMouseLeave={() => {
        isHoveringPlayerRef.current = false;
      }}
    >
      {/* Hardware-Accelerated Radial Ambient Glow (Zero heavy blur filter lag) */}
      <div
        aria-hidden="true"
        style={{
          transform: 'translate3d(0, 0, 0)',
          willChange: 'opacity, transform',
          background: `
            radial-gradient(circle at 22% 28%, ${toRgba(primaryColor, 0.55)} 0%, transparent 62%),
            radial-gradient(circle at 78% 72%, ${toRgba(secondaryColor, 0.52)} 0%, transparent 62%)
          `,
        }}
        className={`pointer-events-none select-none absolute -inset-12 md:-inset-16 rounded-[3rem] transition-all duration-1000 ease-out ${
          isPlaying
            ? pulseBoost
              ? 'opacity-100 scale-[1.03]'
              : 'opacity-90 scale-100'
            : 'opacity-25 scale-[0.98]'
        }`}
      />

      {/* Crisp Inner Bezel Rim Glow (Lightweight 24px blur on GPU layer) */}
      <div
        aria-hidden="true"
        style={{
          transform: 'translate3d(0, 0, 0)',
          backgroundColor: toRgba(primaryColor, 0.42),
        }}
        className={`pointer-events-none select-none absolute -inset-1.5 rounded-3xl blur-xl transition-colors duration-1000 ease-out ${
          isPlaying ? 'opacity-90' : 'opacity-20'
        }`}
      />

      {/* Main Video Player Frame (Isolated GPU Compositing Layer) */}
      <div
        style={{ transform: 'translate3d(0, 0, 0)' }}
        className="relative w-full aspect-video bg-neutral-950 rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
      >
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