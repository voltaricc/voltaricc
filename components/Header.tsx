'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="fixed top-6 inset-x-0 z-50 px-4 md:px-12 pointer-events-none flex justify-center">
      <header className="w-full max-w-7xl bg-neutral-950/40 backdrop-blur-2xl border border-white/10 rounded-full px-4 md:px-8 py-2.5 md:py-3 flex items-center justify-between gap-4 shadow-2xl shadow-black/80 pointer-events-auto">
        {/* Logo with Tilt Warp Font */}
        <Link 
          href="/" 
          className="text-lg md:text-2xl font-normal tracking-wide text-white hover:text-sky-400 transition-colors shrink-0"
          style={{ fontFamily: "'Tilt Warp', cursive" }}
        >
          VOLTARIX
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-sm md:max-w-md mx-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full bg-neutral-900/80 border border-neutral-800 text-white text-xs md:text-sm rounded-full px-4 py-1.5 focus:outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-inner"
          />
        </form>

        {/* Profile / Avatar */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-sky-500 flex items-center justify-center font-bold text-white text-xs shadow-md shadow-sky-500/20">
            H
          </div>
        </div>
      </header>
    </div>
  );
}