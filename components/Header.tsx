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
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-neutral-900 px-3 md:px-10 py-3 md:py-4 flex items-center justify-between gap-2 md:gap-6">
      {/* Logo */}
      <Link href="/" className="text-base md:text-2xl font-black tracking-wider text-white hover:text-sky-400 transition shrink-0">
        VOLTARIX
      </Link>

      {/* Search Bar - Fully visible on Mobile, Tablet & Desktop */}
      <form onSubmit={handleSearch} className="flex-1 max-w-sm md:max-w-md mx-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search..."
          className="w-full bg-neutral-900 border border-neutral-800 text-white text-xs md:text-sm rounded-xl px-3 md:px-4 py-2 focus:outline-none focus:border-neutral-600 transition shadow-inner"
        />
      </form>

      {/* Profile / Avatar */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-sky-500 flex items-center justify-center font-bold text-white text-xs shadow-md">
          H
        </div>
      </div>
    </header>
  );
}