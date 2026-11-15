'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      try {
        const supabase = getSupabase();
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
          setUser(session?.user ?? null);
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (e) {
        console.error('Failed to load auth session:', e);
      }
    }
    checkUser();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSignOut = async () => {
    try {
      const supabase = getSupabase();
      await supabase.auth.signOut();
      setUser(null);
      setDropdownOpen(false);
      router.refresh();
    } catch (e) {
      console.error('Error signing out:', e);
    }
  };

  return (
    <div className="fixed top-6 inset-x-0 z-50 px-4 md:px-12 pointer-events-none flex justify-center">
      <header className="w-full max-w-7xl bg-neutral-950/40 backdrop-blur-2xl border border-white/10 rounded-full px-4 md:px-8 py-2.5 md:py-3 flex items-center justify-between gap-4 shadow-2xl shadow-black/80 pointer-events-auto">
        {/* Logo */}
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

        {/* Auth / Profile Section */}
        <div className="flex items-center gap-3 shrink-0 relative">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#F5EFE6] border border-white/20 hover:border-sky-400/80 flex items-center justify-center overflow-hidden shadow-md hover:shadow-sky-500/20 transition-all duration-300 cursor-pointer"
                aria-label="User profile menu"
              >
                <svg viewBox="0 0 100 100" className="w-full h-full" aria-label="Voltarix Profile">
                  <rect width="100" height="100" fill="#F5EFE6" />
                  <path
                    d="M 27 56 C 14 63, 9 72, 16 76"
                    fill="none"
                    stroke="#0B1320"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <polygon points="23,28 41,28 50,55 59,28 77,28 50,86" fill="#0B1320" />
                  <path
                    d="M 16 76 C 32 84, 78 65, 90 46 C 95 38, 86 35, 70 39"
                    fill="none"
                    stroke="#0B1320"
                    strokeWidth="4.2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 86 14 Q 86 22 94 22 Q 86 22 86 30 Q 86 22 78 22 Q 86 22 86 14 Z"
                    fill="#0B1320"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl py-2 z-50 text-xs">
                  <div className="px-4 py-2 border-b border-neutral-800 text-neutral-400 truncate">
                    {user.email}
                  </div>
                  <Link
                    href="/library"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-neutral-200 hover:bg-neutral-800 hover:text-white transition"
                  >
                    My Library
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-red-400 hover:bg-neutral-800 hover:text-red-300 transition cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-sky-500 hover:bg-sky-400 text-black font-bold px-4 py-2 rounded-full text-xs transition shadow-md"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>
    </div>
  );
}