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
    <header className="sticky top-0 z-40 w-full bg-black/80 backdrop-blur-xl border-b border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 md:px-10 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl font-black tracking-tighter text-white group-hover:text-neutral-300 transition">
            VOLTARIX
          </span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md relative hidden sm:block">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movies, TV shows..."
            className="w-full bg-neutral-900/90 border border-neutral-800 rounded-full px-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition shadow-inner"
          />
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-xs shadow-md">
            H
          </div>
          <span className="text-xs font-semibold text-neutral-400 hover:text-white transition hidden md:block cursor-pointer">
            Sign Out
          </span>
        </div>
      </div>
    </header>
  );
}