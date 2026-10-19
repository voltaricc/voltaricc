'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

const ITEMS: { href: string; label: string; icon: ReactNode }[] = [
  {
    href: '/',
    label: 'Home',
    icon: <path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  },
  {
    href: '/movies',
    label: 'Movies',
    icon: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M7 4v16M17 4v16M3 9h4M17 9h4M3 15h4M17 15h4" />
      </>
    ),
  },
  {
    href: '/tv',
    label: 'TV',
    icon: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 3l4 4 4-4" />
      </>
    ),
  },
  {
    href: '/library',
    label: 'Library',
    icon: <path d="M6 3h12v18l-6-4-6 4z" />,
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-neutral-800 bg-black/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="flex">
        {ITEMS.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold uppercase tracking-wider transition ${
                  active ? 'text-sky-400' : 'text-neutral-500 hover:text-white'
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {item.icon}
                </svg>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}