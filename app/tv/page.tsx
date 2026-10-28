import Header from '@/components/Header';
import Link from 'next/link';

export default async function TVShowsPage() {
  const apiKey = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;
  let shows: any[] = [];

  if (apiKey) {
    try {
      const res = await fetch(`https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}`, {
        next: { revalidate: 3600 },
      });
      const data = await res.json();
      shows = data.results || [];
    } catch (e) {
      console.error('Failed to fetch TV shows:', e);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white pb-40">
      <Header />
      <div className="max-w-7xl mx-auto px-4 md:px-10 pt-8 space-y-6">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Popular TV Shows</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {shows.map((show) => (
            <Link
              key={show.id}
              href={`/tv/${show.id}?season=1&episode=1`}
              className="group bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 hover:border-neutral-600 transition-all duration-300 hover:scale-[1.02] shadow-lg flex flex-col"
            >
              <div className="aspect-[2/3] w-full bg-neutral-950 relative overflow-hidden">
                {show.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
                    alt={show.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500 p-2 text-center">
                    {show.name}
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-xs font-semibold text-white line-clamp-1">{show.name}</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">
                  {show.first_air_date?.split('-')[0]} • ★ {show.vote_average?.toFixed(1)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}