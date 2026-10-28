'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function FloatingNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Movies', href: '/movies' },
    { label: 'TV Shows', href: '/tv' },
    { label: 'My Library', href: '/library' },
    { label: 'History', href: '/history' },
  ];

  return (
    <nav aria-label="Floating Navigation" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
      <div className="flex items-center gap-1 sm:gap-2 px-3 py-2 bg-neutral-900/80 backdrop-blur-xl border border-neutral-800/80 rounded-full shadow-2xl shadow-black/80">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                isActive
                  ? 'bg-white text-black shadow-md shadow-white/20 scale-105'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
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