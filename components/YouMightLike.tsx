'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function YouMightLike() {
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || '';
        if (apiKey) {
          const stored = localStorage.getItem('voltarix_watch_history');
          let endpoint = 'trending/movie/day';
          
          if (stored) {
            const history = JSON.parse(stored);
            if (history.length > 0) {
              endpoint = `${history[0].mediaType}/${history[0].id}/recommendations`;
            }
          }

          const res = await fetch(`https://api.themoviedb.org/3/${endpoint}?api_key=${apiKey}`);
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            setRecommendations(data.results);
            return;
          }
        }
      } catch (err) {
        console.error(err);
      }

      // Fallback sample items so the row is always guaranteed to render
      setRecommendations([
        { id: 27205, title: 'Inception', media_type: 'movie', poster_path: '/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg', vote_average: 8.4, release_date: '2010' },
        { id: 157336, title: 'Interstellar', media_type: 'movie', poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', vote_average: 8.6, release_date: '2014' },
        { id: 1396, name: 'Breaking Bad', media_type: 'tv', poster_path: '/ggFHVNu6YYI5L9pCfOacjizRGt.jpg', vote_average: 8.9, first_air_date: '2008' },
        { id: 66732, name: 'Stranger Things', media_type: 'tv', poster_path: '/49WJfeN0moxb9IPfGn8AIqMGskD.jpg', vote_average: 8.6, first_air_date: '2016' },
      ]);
    }

    loadData();
  }, []);

  if (recommendations.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-xl md:text-2xl font-bold tracking-wide text-white">You Might Like</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 custom-scrollbar scroll-smooth">
        {recommendations.map((item) => {
          const posterPath = item.poster_path
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : '/placeholder.png';
          const name = item.title || item.name;
          const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
          const linkHref = `/${mediaType}/${item.id}`;

          return (
            <Link
              key={item.id}
              href={linkHref}
              className="flex-none w-[180px] md:w-[220px] group relative bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800/80 hover:border-neutral-600 transition-all shadow-lg hover:scale-105"
            >
              <div className="relative aspect-[2/3] w-full overflow-hidden">
                <img
                  src={posterPath}
                  alt={name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                
                {/* Movie / TV Show Badge Tag */}
                <span className="absolute top-2 left-2 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-black/70 backdrop-blur-md rounded-md text-white border border-white/15 shadow">
                  {mediaType === 'movie' ? 'Movie' : 'TV Show'}
                </span>
              </div>

              <div className="p-3">
                <h3 className="text-sm font-semibold text-white truncate">{name}</h3>
                <div className="flex items-center justify-between text-xs text-neutral-400 mt-1">
                  <span>★ {item.vote_average?.toFixed(1) || 'N/A'}</span>
                  <span>{item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4) || ''}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}