'use client';

import { useState } from 'react';
import { useWatchlist } from '@/context/WatchlistContext';

type Props = {
  mediaId: number | string;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath?: string | null;
  voteAverage?: number | null;
};

export default function WatchlistButton({
  mediaId,
  mediaType,
  title,
  posterPath,
  voteAverage,
}: Props) {
  const { isInWatchlist, toggleWatchlist, isAuthenticated } = useWatchlist();
  const [loading, setLoading] = useState(false);

  const numericId = Number(mediaId);
  const added = isInWatchlist(numericId, mediaType);

  const handleToggle = async () => {
    if (loading) return;

    if (!isAuthenticated) {
      alert('Please sign in to manage your library.');
      return;
    }

    setLoading(true);
    try {
      await toggleWatchlist({
        media_id: numericId,
        media_type: mediaType,
        title,
        poster_path: posterPath ?? null,
        vote_average: voteAverage ?? null,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
        added
          ? 'bg-sky-500/20 border-sky-400 text-sky-300 hover:bg-sky-500/30'
          : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-600 hover:text-white'
      }`}
    >
      <span>{added ? '✓ In Library' : '+ Add to Library'}</span>
    </button>
  );
}