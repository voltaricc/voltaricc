import Header from '@/components/Header';
import BrowseView from '@/components/BrowseView';

export default async function MoviesPage({
  searchParams,
}: {
  searchParams: Promise<{ genre?: string; page?: string }>;
}) {
  const sp = await searchParams;
  return (
    <main className="min-h-screen bg-black text-white font-sans pb-16">
      <Header />
      <BrowseView type="movie" genre={sp.genre} page={sp.page} />
    </main>
  );
}