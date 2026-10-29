import Header from '@/components/Header';
import BrowseView from '@/components/BrowseView';

export default async function TVShowsPage({
  searchParams,
}: {
  searchParams: Promise<{ genre?: string; page?: string }>;
}) {
  const sp = await searchParams;

  return (
    <main className="min-h-screen bg-black text-white pb-40">
      <Header />
      <BrowseView type="tv" genre={sp.genre} page={sp.page} />
    </main>
  );
}