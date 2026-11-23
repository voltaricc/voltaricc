'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import PosterCard from '@/components/PosterCard';

type SearchItem = {
  id: number;
  media_type?: string;
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
};

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [problem, setProblem] = useState('');

  useEffect(() => {
    if (!query) return;
    let cancelled = false;

    async function fetchResults() {
      setLoading(true);
      setProblem('');
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          cache: 'no-store',
        });

        if (!res.ok) {
          throw new Error(`The search came back with error code ${res.status}.`);
        }

        const type = res.headers.get('content-type') || '';
        if (!type.includes('application/json')) {
          throw new Error(
            'The search sent back a web page instead of results. Something in the project may be redirecting it.'
          );
        }

        const data = await res.json();
        if (!cancelled) setResults(data.results || []);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setResults([]);
          setProblem(err instanceof Error ? err.message : 'Something went wrong.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchResults();
    return () => {
      cancelled = true;
    };
  }, [query]);

  const shown = results.filter(
    (item) =>
      item.poster_path && (item.media_type === 'movie' || item.media_type === 'tv')
  );

  return (
    <div className="px-6 md:px-10 py-8">
      <h1 className="text-xl md:text-2xl font-bold text-white mb-6">
        Search results for: <span className="text-sky-400">&quot;{query}&quot;</span>
      </h1>

      {loading ? (
        <div className="text-neutral-400 text-sm">Searching...</div>
      ) : problem ? (
        <div className="text-red-400 text-sm">{problem}</div>
      ) : shown.length === 0 ? (
        <div className="text-neutral-400 text-sm">No results found.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {shown.map((item) => {
            const resolvedType: 'movie' | 'tv' =
              item.media_type === 'tv' ? 'tv' : 'movie';
            const title = item.title || item.name || 'Untitled';
            const date = item.release_date || item.first_air_date;

            return (
              <PosterCard
                key={`${resolvedType}-${item.id}`}
                href={resolvedType === 'movie' ? `/watch/${item.id}` : `/tv/${item.id}`}
                mediaId={item.id}
                mediaType={resolvedType}
                title={title}
                posterPath={item.poster_path}
                rating={item.vote_average}
                subtitle={date?.slice(0, 4)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-black text-white font-sans pt-28 md:pt-32 pb-24">
      <Header />
      <Suspense fallback={<div className="p-10 text-neutral-400">Loading search...</div>}>
        <SearchResults />
      </Suspense>
    </main>
  );
}