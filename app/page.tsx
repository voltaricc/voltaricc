import Header from '@/components/Header';
import ContinueWatching from '@/components/ContinueWatching';
import YouMightLike from '@/components/YouMightLike';
import HeroSlider from '@/components/HeroSlider';
import PosterCard from '@/components/PosterCard';

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
      <HeroSlider items={heroItems} />
      <ContinueWatching />
      <YouMightLike />

      <div className="max-w-7xl mx-auto px-4 md:px-12 space-y-12 mt-10">
        {trendingMovies.results?.length > 0 && (
          <HomeMediaRow title="Trending Movies" items={trendingMovies.results} mediaType="movie" />
        )}
        {trendingTV.results?.length > 0 && (
          <HomeMediaRow title="Trending TV Shows" items={trendingTV.results} mediaType="tv" />
        )}
        {actionMovies.results?.length > 0 && (
          <HomeMediaRow title="Action & Adventure" items={actionMovies.results} mediaType="movie" />
        )}
        {scifiTV.results?.length > 0 && (
          <HomeMediaRow title="Sci-Fi & Fantasy" items={scifiTV.results} mediaType="tv" />
        )}
        {animation.results?.length > 0 && (
          <HomeMediaRow title="Animation" items={animation.results} mediaType="movie" />
        )}
        {comedyMovies.results?.length > 0 && (
          <HomeMediaRow title="Comedies" items={comedyMovies.results} mediaType="movie" />
        )}
        {horrorMovies.results?.length > 0 && (
          <HomeMediaRow title="Horror & Thrillers" items={horrorMovies.results} mediaType="movie" />
        )}
      </div>
    </main>
  );
}

function HomeMediaRow({ title, items, mediaType }: { title: string; items: any[]; mediaType: 'movie' | 'tv' }) {
  if (!items || items.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-xl md:text-2xl font-bold tracking-wide text-white">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 custom-scrollbar scroll-smooth">
        {items.map((item) => {
          const name = item.title || item.name || 'Untitled';
          const resolvedMediaType: 'movie' | 'tv' = item.media_type === 'tv' || item.media_type === 'movie' ? item.media_type : mediaType;
          const linkHref = resolvedMediaType === 'movie' ? `/watch/${item.id}` : `/tv/${item.id}`;
          const releaseYear = item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4) || '';

          return (
            <PosterCard
              key={`${resolvedMediaType}-${item.id}`}
              href={linkHref}
              mediaId={item.id}
              mediaType={resolvedMediaType}
              title={name}
              posterPath={item.poster_path}
              rating={item.vote_average}
              subtitle={releaseYear}
              className="flex-none w-[180px] md:w-[220px]"
            />
          );
        })}
      </div>
    </section>
  );
}