'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthButton from './AuthButton';

export default function Header() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-neutral-800/80 px-6 py-3.5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          {/* Custom Voltaricc "V" Orbit & Star Icon */}
          <div className="relative w-8 h-8 flex items-center justify-center">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full text-white fill-current overflow-visible"
            >
              {/* Star / Sparkle */}
              <path d="M 72 15 Q 72 25 82 25 Q 72 25 72 35 Q 72 25 62 25 Q 72 25 72 15 Z" fill="#38bdf8" />
              
              {/* Orbit Ellipse */}
              <ellipse
                cx="50"
                cy="58"
                rx="42"
                ry="14"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="4"
                transform="rotate(-20 50 58)"
              />

              {/* Main Stylized "V" */}
              <polygon points="25,30 50,85 75,30 62,30 50,62 38,30" fill="white" />
            </svg>
          </div>

          {/* VOLTARICC Custom Typography with Lambda "A" */}
          <span className="text-lg font-light tracking-[0.35em] text-white flex items-center gap-[0.05em] group-hover:text-sky-400 transition duration-200">
            VOLT
            <span className="inline-block font-normal text-sky-400 transform scale-y-90">
              ^
            </span>
            RICC
          </span>
        </Link>

        <Link
          href="/library"
          className="text-xs uppercase font-semibold tracking-widest text-neutral-400 hover:text-sky-400 transition hidden md:block"
        >
          My Library
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies, TV shows..."
          className="w-full bg-neutral-900/90 border border-neutral-800 text-white text-xs rounded-lg px-4 py-2 focus:outline-none focus:border-sky-400 transition placeholder:text-neutral-500"
        />
      </form>

      <div className="shrink-0 flex items-center gap-4">
        <Link
          href="/library"
          className="text-xs uppercase font-semibold tracking-widest text-neutral-400 hover:text-sky-400 transition md:hidden"
        >
          Library
        </Link>
        <AuthButton />
      </div>
    </header>
  );
}