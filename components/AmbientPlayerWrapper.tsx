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

  // 1. Sample an 8x8 grid from the TMDB artwork for an authentic colour palette
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

  // 2. Sync with embed postMessage events & smart iframe click/focus detection
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const raw =
          typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (!raw || typeof raw !== 'object') return;

        // Inspect top-level and nested player payloads (Player.js, Vidstack, JW, etc.)
        const eventName = String(
          raw.event || raw.type || raw.state || raw.action || raw.data?.event || ''
        ).toLowerCase();

        if (!eventName && typeof raw.currentTime !== 'number' && typeof raw.data?.currentTime !== 'number') {
          return;
        }

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

        // Advance colour phase on playback timeupdate ticks
        if (
          eventName.includes('timeupdate') ||
          eventName.includes('progress') ||
          typeof raw.currentTime === 'number' ||
          typeof raw.data?.currentTime === 'number'
        ) {
          setIsPlaying(true);
          setPhase((prev) => (prev + 1) % palette.length);
        }
      } catch {
        // Ignore non-JSON messages from browser extensions
      }
    };

    // Fallback sync: when the user clicks inside the cross-origin iframe, window blurs.
    // Re-focusing the parent window immediately after lets us detect subsequent play/pause clicks!
    const handleWindowBlur = () => {
      if (
        !receivedPostMessageRef.current &&
        (isHoveringPlayerRef.current || document.activeElement?.tagName === 'IFRAME')
      ) {
        setIsPlaying((prev) => !prev);
        setPulseBoost(true);
        setTimeout(() => setPulseBoost(false), 550);

        // Return focus shortly after so the next click inside the iframe also triggers blur
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

  // 3. Smooth dynamic colour cycle while playing (every 1.2s)
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setPhase((prev) => (prev + 1) % palette.length);
    }, 1200);

    return () => clearInterval(interval);
  }, [isPlaying, palette.length]);

  const primaryColor = palette[phase % palette.length];
  const secondaryColor = palette[(phase + 2) % palette.length];
  const tertiaryColor = palette[(phase + 4) % palette.length];

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
      {/* Enhanced Dynamic Ambient Light Orbs */}
      <div
        aria-hidden="true"
        className={`pointer-events-none select-none transition-all duration-700 ${
          isPlaying
            ? pulseBoost
              ? 'opacity-100 scale-[1.04]'
              : 'opacity-95 scale-100'
            : 'opacity-30 scale-[0.97]'
        }`}
      >
        {/* Top-Left / Primary Colour Wash */}
        <div
          className="absolute -top-14 -left-14 w-3/4 h-3/4 rounded-full blur-[105px] saturate-[2.4] transition-colors duration-1000 ease-in-out"
          style={{ backgroundColor: primaryColor }}
        />

        {/* Bottom-Right / Secondary Colour Wash */}
        <div
          className="absolute -bottom-14 -right-14 w-3/4 h-3/4 rounded-full blur-[105px] saturate-[2.4] transition-colors duration-1000 ease-in-out"
          style={{ backgroundColor: secondaryColor }}
        />

        {/* Mid Atmospheric Halo */}
        <div
          className="absolute -inset-8 rounded-[2.5rem] blur-[80px] opacity-80 saturate-200 transition-colors duration-1000 ease-in-out"
          style={{ backgroundColor: tertiaryColor }}
        />

        {/* Crisp Inner Bezel Rim Glow (Boosts perceived intensity right around the video) */}
        <div
          className="absolute -inset-2 rounded-3xl blur-2xl opacity-75 saturate-[2.5] transition-colors duration-1000 ease-in-out"
          style={{ backgroundColor: primaryColor }}
        />
      </div>

      {/* Main Video Player Frame */}
      <div className="relative w-full aspect-video bg-neutral-950 rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
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