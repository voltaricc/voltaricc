'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Genre = { id: number; name: string };

type Props = {
  basePath: string;
  genres: Genre[];
  current?: string;
};

export default function GenreFilter({ basePath, genres, current }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function choose(id?: number) {
    setOpen(false);
    router.push(id ? `${basePath}?genre=${id}` : basePath);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Filter by genre"
        aria-expanded={open}
        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
          current
            ? 'border-sky-400 bg-sky-500/10 text-sky-300'
            : 'border-neutral-800 text-neutral-300 hover:border-sky-400 hover:text-white'
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 4h18l-7 8v6l-4 2v-8L3 4z" />
        </svg>
        Filter
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-64 max-h-80 overflow-y-auto rounded-xl border border-neutral-800 bg-neutral-950 p-2 shadow-xl shadow-black">
            <button
              type="button"
              onClick={() => choose()}
              className={`w-full rounded-lg px-3 py-2 text-left text-xs font-semibold transition ${
                !current ? 'bg-sky-500 text-black' : 'text-neutral-300 hover:bg-neutral-900'
              }`}
            >
              All genres
            </button>
            {genres.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => choose(g.id)}
                className={`w-full rounded-lg px-3 py-2 text-left text-xs font-semibold transition ${
                  current === String(g.id)
                    ? 'bg-sky-500 text-black'
                    : 'text-neutral-300 hover:bg-neutral-900'
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}