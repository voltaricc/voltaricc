import Header from '@/components/Header';
import ContinueWatching from '@/components/ContinueWatching';
import HeroSlider, { HeroItem } from '@/components/HeroSlider';

export default async function HomePage() {
  const apiKey = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;

  let trendingItems: HeroItem[] = [];

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/trending/all/day?api_key=${apiKey}`,
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const topResults = data.results.slice(0, 5);

      // Fetch official transparent title logos for each trending item
      trendingItems = await Promise.all(
        topResults.map(async (item: any) => {
          let logoPath = null;
          try {
            const imgRes = await fetch(
              `https://api.themoviedb.org/3/${item.media_type}/${item.id}/images?api_key=${apiKey}&include_image_language=en,null`,
              { next: { revalidate: 3600 } }
            );
            const imgData = await imgRes.json();
            const enLogo =
              imgData.logos?.find((l: any) => l.iso_639_1 === 'en') ||
              imgData.logos?.[0];
            if (enLogo) logoPath = enLogo.file_path;
          } catch (err) {
            // Fallback to text title if logo fetch fails
          }
          return {
            ...item,
            logo_path: logoPath,
          };
        })
      );
    }
  } catch (e) {
    console.error('Failed to fetch trending hero items:', e);
  }

  return (
    <main className="min-h-screen bg-black text-white font-sans pb-16">
      <Header />

      {/* Sliding Hero Carousel with Branded Title Artwork */}
      <HeroSlider items={trendingItems} />

      {/* Main Content Rows */}
      <div className="max-w-7xl mx-auto px-4 md:px-10 space-y-6 pt-6">
        <ContinueWatching />
      </div>
    </main>
  );
}