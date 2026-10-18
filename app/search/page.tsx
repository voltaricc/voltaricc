import { searchMulti } from '@/lib/tmdb';
import Header from '@/components/Header';
import Link from 'next/link';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || '';
  const results = query ? await searchMulti(query) : [];

  return (
    <main className="min-h-screen bg-neutral-950 text-white font-sans pb-12">
      <Header />

      <section className="px-6 md:px-10 pt-8">
        <h1 className="text-2xl font-bold mb-6 text-neutral-100">
          Search Results for: <span className="text-red-500">"{query}"</span>
        </h1>

        {results.length === 0 ? (
          <p className="text-neutral-400">No movies or TV shows found matching your search.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {results.map((item: any) => {
              const isMovie = item.media_type === 'movie';
              const title = isMovie ? item.title : item.name;
              const date = isMovie ? item.release_date : item.first_air_date;
              const linkHref = isMovie ? `/watch/${item.id}` : `/tv/${item.id}`;

              return (
                <Link key={`${item.media_type}-${item.id}`} href={linkHref}>
                  <div className="group relative bg-neutral-900 rounded-xl overflow-hidden shadow-md border border-neutral-800 hover:border-neutral-700 transition duration-300 hover:-translate-y-1 cursor-pointer">
                    <div className="aspect-[2/3] w-full overflow-hidden bg-neutral-800 relative">
                      {/* Media Type Badge */}
                      <span className={`absolute top-2 left-2 z-10 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded shadow ${
                        isMovie ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
                      }`}>
                        {isMovie ? 'Movie' : 'TV Series'}
                      </span>

                      {item.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500">
                          No Poster
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm truncate text-neutral-100 group-hover:text-red-400 transition">
                        {title}
                      </h3>
                      <div className="flex items-center justify-between mt-1 text-xs text-neutral-400">
                        <span>{date?.slice(0, 4) || 'N/A'}</span>
                        <span className="text-amber-400 font-medium">
                          ★ {item.vote_average?.toFixed(1) || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}