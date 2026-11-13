'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function FloatingNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Movies', href: '/movies' },
    { label: 'TV', href: '/tv' },
    { label: 'Library', href: '/library' },
    { label: 'History', href: '/history' },
  ];

  return (
    <nav aria-label="Floating Navigation" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
      <div className="flex items-center gap-1 sm:gap-2 px-3 py-2 bg-neutral-950/40 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl shadow-black/80">
        {navItems.map((item) => {
          const isActive = mounted && pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                isActive
                  ? 'bg-white text-black shadow-md shadow-white/20 scale-105'
                  : 'text-neutral-400 hover:text-sky-400 hover:bg-sky-500/10'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}