'use client';

import { useRef } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AuthButton from './AuthButton';
import BottomNav from './BottomNav';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/movies', label: 'Movies' },
  { href: '/tv', label: 'TV Shows' },
  { href: '/library', label: 'My Library' },
  { href: '/history', label: 'History' },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);

  // The search box is "uncontrolled" on purpose: React doesn't rewrite its text
  // on every keystroke, which is what makes the cursor jump on some phones and
  // flip the letters around.
  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = inputRef.current?.value.trim();
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
      inputRef.current?.blur();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-neutral-800/80 px-4 md:px-6 py-3 flex items-center gap-3 md:gap-6">
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="relative w-8 h-8 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current overflow-visible">
              <path d="M 72 15 Q 72 25 82 25 Q 72 25 72 35 Q 72 25 62 25 Q 72 25 72 15 Z" fill="#38bdf8" />
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
              <polygon points="25,30 50,85 75,30 62,30 50,62 38,30" fill="white" />
            </svg>
          </div>
          <span className="hidden sm:flex text-lg font-light tracking-[0.35em] text-white items-center gap-[0.05em] group-hover:text-sky-400 transition duration-200">
            VOLT
            <span className="inline-block font-normal text-sky-400 transform scale-y-90">^</span>
            RICC
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-5" aria-label="Main">
          {LINKS.map((link) => {
            const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs uppercase font-semibold tracking-widest py-1 border-b-2 transition ${
                  active
                    ? 'text-white border-sky-400'
                    : 'text-neutral-400 border-transparent hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <form onSubmit={handleSearch} className="flex-1 md:max-w-md md:ml-auto" role="search">
          <input
            ref={inputRef}
            type="text"
            inputMode="search"
            enterKeyHint="search"
            defaultValue=""
            placeholder="Search movies, TV shows..."
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            dir="ltr"
            className="w-full bg-neutral-900/90 border border-neutral-800 text-white text-base md:text-xs rounded-lg px-4 py-2 focus:outline-none focus:border-sky-400 transition placeholder:text-neutral-500"
          />
        </form>

        <div className="shrink-0 flex items-center">
          <AuthButton />
        </div>
      </header>

      <BottomNav />
    </>
  );
}