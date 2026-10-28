import Header from '@/components/Header';
import ContinueWatching from '@/components/ContinueWatching';
import HeroSlider from '@/components/HeroSlider';

export default async function HomePage() {
  const apiKey = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;

  let heroItems: any[] = [];
  if (apiKey) {
    try {
      const res = await fetch(`https://api.themoviedb.org/3/trending/all/day?api_key=${apiKey}`, {
        next: { revalidate: 3600 },
      });
      const data = await res.json();
      const trending = data.results?.slice(0, 5) || [];

      // Fetch official title logo art for each trending item
      heroItems = await Promise.all(
        trending.map(async (item: any) => {
          const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
          try {
            const imgRes = await fetch(
              `https://api.themoviedb.org/3/${mediaType}/${item.id}/images?api_key=${apiKey}&include_image_language=en,null`
            );
            const imgData = await imgRes.json();
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
    } catch (e) {
      console.error('Failed to fetch hero slider items:', e);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white pb-40">
      <Header />

      {/* Sliding Hero Banner with Official Title Logos */}
      <HeroSlider items={heroItems} />

      {/* Continue Watching Row (automatically hidden until you start watching something) */}
      <ContinueWatching />
    </main>
  );
}