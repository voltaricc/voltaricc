import { getTrendingMovies, getTrendingTV } from '@/lib/tmdb';
import Header from '@/components/Header';
import Link from 'next/link';
import { connection } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export default async function HomePage() {
  await connection();

  // Fetch Supabase Session & Continue Watching
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  let continueWatching: any[] = [];
  if (user) {
    const { data } = await supabase
      .from('watch_history')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(10);

    if (data) continueWatching = data;
  }

  // Fetch TMDB Content
  const movies = await getTrendingMovies();
  const tvShows = await getTrendingTV();

  const featuredMovie = movies[0];

  // Derive New Releases (sorted by release date)
  const newReleases = [...movies].sort((a, b) => {
    return new Date(b.release_date || 0).getTime() - new Date(a.release_date || 0).getTime();
  });

  return (
    <main className="min-h-screen bg-black text-white font-sans pb-16">
      <Header />

      {/* Featured Hero Banner */}
      {featuredMovie && (
        <section className="relative w-full h-[55vh] md:h-[65vh] flex items-end p-6 md:p-12 mb-8 overflow-hidden border-b border-neutral-900">
          <div className="absolute inset-0 z-0">
            <img
              src={`https://image.tmdb.org/t/p/original${featuredMovie.backdrop_path || featuredMovie.poster_path}`}
              alt={featuredMovie.title}
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          </div>

          <div className="relative z-10 max-w-2xl">
            <span className="bg-sky-500 text-black text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest mb-3 inline-block">
              Featured Title
            </span>
            <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tight text-white">
              {featuredMovie.title}
            </h1>
            <p className="text-neutral-300 text-xs md:text-sm line-clamp-2 mb-6 leading-relaxed">
              {featuredMovie.overview}
            </p>
            <Link
              href={`/watch/${featuredMovie.id}`}
              className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-black font-extrabold text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg transition duration-200 shadow-lg shadow-sky-500/20"
            >
              ▶ Watch Now
            </Link>
          </div>
        </section>
      )}

      <div className="space-y-10 px-6 md:px-10">
        {/* ROW 1: Continue Watching (Only displays when user is signed in & has watch history) */}
        {continueWatching.length > 0 && (
          <section>
            <h2 className="text-lg md:text-xl font-bold mb-4 text-white flex items-center gap-2">
              <span className="w-1.5 h-4 bg-sky-400 rounded-full inline-block" />
              Continue Watching
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
              {continueWatching.map((item) => (
                <Link
                  key={`${item.media_type}-${item.media_id}`}
                  href={
                    item.media_type === 'tv'
                      ? `/tv/${item.media_id}?season=${item.last_season || 1}&episode=${item.last_episode || 1}`
                      : `/watch/${item.media_id}`
                  }
                  className="shrink-0 w-36 md:w-44"
                >
                  <div className="group relative bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 hover:border-sky-500/50 transition duration-300 hover:-translate-y-1">
                    <div className="aspect-[2/3] w-full bg-neutral-950 relative">
                      <img
                        src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <span className="bg-sky-500 text-black font-bold text-xs px-3 py-1.5 rounded-full">
                          ▶ Resume
                        </span>
                      </div>
                    </div>
                    <div className="p-2.5">
                      <h3 className="font-semibold text-xs truncate text-neutral-100 group-hover:text-sky-400 transition">
                        {item.title}
                      </h3>
                      {item.media_type === 'tv' && (
                        <p className="text-[10px] text-sky-400 font-medium mt-0.5">
                          S{item.last_season || 1} E{item.last_episode || 1}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ROW 2: Popular Movies */}
        <section>
          <h2 className="text-lg md:text-xl font-bold mb-4 text-white flex items-center gap-2">
            <span className="w-1.5 h-4 bg-sky-400 rounded-full inline-block" />
            Popular Movies
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
            {movies.map((movie: any) => (
              <Link key={movie.id} href={`/watch/${movie.id}`} className="shrink-0 w-36 md:w-44">
                <div className="group relative bg-neutral-900/60 rounded-xl overflow-hidden border border-neutral-800 hover:border-sky-500/50 transition duration-300 hover:-translate-y-1">
                  <div className="aspect-[2/3] w-full overflow-hidden bg-neutral-950">
                    <img
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                  <div className="p-2.5">
                    <h3 className="font-semibold text-xs truncate text-neutral-100 group-hover:text-sky-400 transition">
                      {movie.title}
                    </h3>
                    <div className="flex items-center justify-between mt-1 text-[10px] text-neutral-400">
                      <span>{movie.release_date?.slice(0, 4)}</span>
                      <span className="text-sky-400 font-semibold">
                        ★ {movie.vote_average?.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ROW 3: Popular TV Shows */}
        <section>
          <h2 className="text-lg md:text-xl font-bold mb-4 text-white flex items-center gap-2">
            <span className="w-1.5 h-4 bg-sky-400 rounded-full inline-block" />
            Popular TV Shows
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
            {tvShows.map((show: any) => (
              <Link key={show.id} href={`/tv/${show.id}`} className="shrink-0 w-36 md:w-44">
                <div className="group relative bg-neutral-900/60 rounded-xl overflow-hidden border border-neutral-800 hover:border-sky-500/50 transition duration-300 hover:-translate-y-1">
                  <div className="aspect-[2/3] w-full overflow-hidden bg-neutral-950">
                    <img
                      src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
                      alt={show.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                  <div className="p-2.5">
                    <h3 className="font-semibold text-xs truncate text-neutral-100 group-hover:text-sky-400 transition">
                      {show.name}
                    </h3>
                    <div className="flex items-center justify-between mt-1 text-[10px] text-neutral-400">
                      <span>{show.first_air_date?.slice(0, 4)}</span>
                      <span className="text-sky-400 font-semibold">
                        ★ {show.vote_average?.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ROW 4: New Releases */}
        <section>
          <h2 className="text-lg md:text-xl font-bold mb-4 text-white flex items-center gap-2">
            <span className="w-1.5 h-4 bg-sky-400 rounded-full inline-block" />
            New Releases
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
            {newReleases.map((movie: any) => (
              <Link key={movie.id} href={`/watch/${movie.id}`} className="shrink-0 w-36 md:w-44">
                <div className="group relative bg-neutral-900/60 rounded-xl overflow-hidden border border-neutral-800 hover:border-sky-500/50 transition duration-300 hover:-translate-y-1">
                  <div className="aspect-[2/3] w-full overflow-hidden bg-neutral-950">
                    <img
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                  <div className="p-2.5">
                    <h3 className="font-semibold text-xs truncate text-neutral-100 group-hover:text-sky-400 transition">
                      {movie.title}
                    </h3>
                    <div className="flex items-center justify-between mt-1 text-[10px] text-neutral-400">
                      <span>{movie.release_date?.slice(0, 4)}</span>
                      <span className="text-sky-400 font-semibold">
                        ★ {movie.vote_average?.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}