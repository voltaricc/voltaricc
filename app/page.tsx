import Link from 'next/link';
import Header from '@/components/Header';
import ContinueWatching from '@/components/ContinueWatching';
import HeroSlider from '@/components/HeroSlider';

// Robust fetch helper using URL to handle query parameters correctly
async function fetchTMDB(endpoint: string, apiKey: string) {
  if (!apiKey) return { results: [] };
  try {
    const url = new URL(`https://api.themoviedb.org/3/${endpoint}`);
    url.searchParams.set('api_key', apiKey);

    const res = await fetch(url.toString(), {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error(`TMDB error: ${res.status} for endpoint: ${endpoint}`);
      return { results: [] };
    }

    const data = await res.json();
    return data || { results: [] };
  } catch (err) {
    console.error('TMDB Fetch Error:', err);
    return { results: [] };
  }
}

export default async function HomePage() {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.TMDB_API_KEY || '';

  let heroItems: any[] = [];
  let trendingMovies: any = { results: [] };
  let trendingTV: any = { results: [] };
  let actionMovies: any = { results: [] };
  let scifiTV: any = { results: [] };
  let animation: any = { results: [] };
  let comedyMovies: any = { results: [] };
  let horrorMovies: any = { results: [] };

  try {
    if (apiKey) {
      // 1. Fetch Hero Items
      const trendingRes = await fetchTMDB('trending/all/day', apiKey);
      const trending = trendingRes.results?.slice(0, 5) || [];

      heroItems = await Promise.all(
        trending.map(async (item: any) => {
          const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
          try {
            const imgData = await fetchTMDB(`${mediaType}/${item.id}/images`, apiKey);
            const logo = imgData.logos?.find((l: any) => l.iso_639_1 === 'en') || imgData.logos?.[0];
            return {
              ...item,
              media_type: mediaType,
              title: item.title || item.name,
              logo_path: logo?.file_path || null,
            };
          } catch {
            return {
              ...item,
              media_type: mediaType,
              title: item.title || item.name,
              logo_path: null,
            };
          }
        })
      );
    }

    // 2. Fetch Trending & Genre Rows concurrently
    [
      trendingMovies,
      trendingTV,
      actionMovies,
      scifiTV,
      animation,
      comedyMovies,
      horrorMovies,
    ] = await Promise.all([
      fetchTMDB('trending/movie/day', apiKey),
      fetchTMDB('trending/tv/day', apiKey),
      fetchTMDB('discover/movie?with_genres=28&sort_by=popularity.desc', apiKey),
      fetchTMDB('discover/tv?with_genres=10765&sort_by=popularity.desc', apiKey),
      fetchTMDB('discover/movie?with_genres=16&sort_by=popularity.desc', apiKey),
      fetchTMDB('discover/movie?with_genres=35&sort_by=popularity.desc', apiKey),
      fetchTMDB('discover/movie?with_genres=27&sort_by=popularity.desc', apiKey),
    ]);
  } catch (e) {
    console.error('HomePage rendering error:', e);
  }

  return (
    <main className="min-h-screen bg-black text-white pb-40">
      <Header />

      {/* Sliding Hero Banner */}
      <HeroSlider items={heroItems} />

      {/* Continue Watching Row */}
      <ContinueWatching />

      {/* Content Rows Container */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 space-y-12 mt-10">
        {trendingMovies.results?.length > 0 && (
          <MediaRow title="Trending Movies" items={trendingMovies.results} mediaType="movie" />
        )}
        {trendingTV.results?.length > 0 && (
          <MediaRow title="Trending TV Shows" items={trendingTV.results} mediaType="tv" />
        )}
        {actionMovies.results?.length > 0 && (
          <MediaRow title="Action & Adventure" items={actionMovies.results} mediaType="movie" />
        )}
        {scifiTV.results?.length > 0 && (
          <MediaRow title="Sci-Fi & Fantasy" items={scifiTV.results} mediaType="tv" />
        )}
        {animation.results?.length > 0 && (
          <MediaRow title="Animation" items={animation.results} mediaType="movie" />
        )}
        {comedyMovies.results?.length > 0 && (
          <MediaRow title="Comedies" items={comedyMovies.results} mediaType="movie" />
        )}
        {horrorMovies.results?.length > 0 && (
          <MediaRow title="Horror & Thrillers" items={horrorMovies.results} mediaType="movie" />
        )}
      </div>
    </main>
  );
}

// Reusable Media Row
function MediaRow({ title, items, mediaType }: { title: string; items: any[]; mediaType: 'movie' | 'tv' }) {
  if (!items || items.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-xl md:text-2xl font-bold tracking-wide text-white">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 custom-scrollbar scroll-smooth">
        {items.map((item) => {
          const posterPath = item.poster_path
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : '/placeholder.png';
          const name = item.title || item.name;
          const resolvedMediaType = item.media_type || mediaType;
          const linkHref = `/${resolvedMediaType}/${item.id}`;

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
                  {resolvedMediaType === 'movie' ? 'Movie' : 'TV Show'}
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