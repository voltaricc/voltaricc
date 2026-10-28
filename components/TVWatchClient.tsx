'use client';

import { useSearchParams } from 'next/navigation';

export default function TVWatchClient({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const season = searchParams.get('season') || '1';
  const episode = searchParams.get('episode') || '1';

  const embedUrl = `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`;

  return (
    <div className="w-full aspect-video bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl relative">
      <iframe
        src={embedUrl}
        className="w-full h-full border-0"
        allowFullScreen
        title="TV Show Player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  );
}