'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Link from 'next/link';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;

    async function fetchResults() {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/multi?api_key=2ba31f5df8b898a96d11e5504fa770c9&query=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        setResults(data.results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [query]);

  return (
    <div className="px-6 md:px-10 py-8">
      <h1 className="text-xl md:text-2xl font-bold text-white mb-6">
        Search results for: <span className="text-sky-400">"{query}"</span>
      </h1>

      {loading ? (
        <div className="text-neutral-400 text-sm">Searching...</div>
      ) : results.length === 0 ? (
        <div className="text-neutral-400 text-sm">No results found.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {results.map((item: any) => {
            if (!item.poster_path) return null;
            const isMovie = item.media_type === 'movie';
            const title = item.title || item.name;
            const date = item.release_date || item.first_air_date;

            return (
              <Link
                key={item.id}
                href={isMovie ? `/watch/${item.id}` : `/tv/${item.id}`}
                className="group relative bg-neutral-900/60 rounded-xl overflow-hidden border border-neutral-800 hover:border-sky-500/50 transition duration-300"
              >
                <div className="aspect-[2/3] w-full overflow-hidden bg-neutral-950">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="p-2.5">
                  <h3 className="font-semibold text-xs truncate text-neutral-100 group-hover:text-sky-400 transition">
                    {title}
                  </h3>
                  <div className="flex items-center justify-between mt-1 text-[10px] text-neutral-400">
                    <span>{date?.slice(0, 4)}</span>
                    <span className="text-sky-400 font-semibold">
                      ★ {item.vote_average?.toFixed(1)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-black text-white font-sans pb-16">
      <Header />
      <Suspense fallback={<div className="p-10 text-neutral-400">Loading search...</div>}>
        <SearchResults />
      </Suspense>
    </main>
  );
}