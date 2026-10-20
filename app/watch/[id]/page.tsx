'use client';

import { use, useEffect, useState } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import WatchTracker from '@/components/WatchTracker';

export default function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [imdbId, setImdbId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [movieData, setMovieData] = useState<{ title: string; poster_path: string } | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchMovieDetails() {
      try {
        const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
        const [movieRes, extRes] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`),
          fetch(`https://api.themoviedb.org/3/movie/${id}/external_ids?api_key=${apiKey}`)
        ]);

        const movieJson = await movieRes.json();
        const extJson = await extRes.json();

        if (movieJson && !movieJson.status_message) {
          setMovieData({
            title: movieJson.title || movieJson.original_title || '',
            poster_path: movieJson.poster_path || '',
          });
        }

        setImdbId(extJson.imdb_id || id);
      } catch (err) {
        console.error('Failed to fetch Movie details:', err);
        setImdbId(id);
      } finally {
        setLoading(false);
      }
    }

    fetchMovieDetails();
  }, [id]);

  const embedUrl = imdbId ? `https://framextv.tech/embed/${imdbId}` : '';

  return (
    <main className="min-h-screen bg-black text-white font-sans pb-16">
      <Header />

      {movieData && (
        <WatchTracker
          mediaId={id}
          mediaType="movie"
          title={movieData.title}
          posterPath={movieData.poster_path}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between bg-neutral-900/80 border border-neutral-800 p-4 rounded-xl">
          <div>
            <h1 className="text-sm font-semibold text-neutral-300">
              {movieData?.title ? `Watching ${movieData.title}` : 'Streaming via FrameX TV Engine'}
            </h1>
            <p className="text-xs text-neutral-500">High-bitrate HTML5 responsive player stream.</p>
          </div>
        </div>

        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 shadow-2xl">
          {loading ? (
            <div className="flex items-center justify-center w-full h-full text-neutral-400 text-sm">
              Loading player...
            </div>
          ) : (
            <iframe
              src={embedUrl}
              className="w-full h-full border-0"
              allowFullScreen
              title="Video Player"
              referrerPolicy="origin"
            />
          )}
        </div>

        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-sky-400 transition"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}