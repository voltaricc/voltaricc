'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

interface WatchlistButtonProps {
  mediaId: string;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath: string;
  voteAverage: number;
  releaseDate: string;
}

export default function WatchlistButton({
  mediaId,
  mediaType,
  title,
  posterPath,
  voteAverage,
  releaseDate,
}: WatchlistButtonProps) {
  const [inWatchlist, setInWatchlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  useEffect(() => {
    async function checkWatchlist() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUserId(user.id);

      const { data } = await supabase
        .from('watchlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('media_id', mediaId)
        .eq('media_type', mediaType)
        .single();

      if (data) setInWatchlist(true);
      setLoading(false);
    }

    checkWatchlist();
  }, [mediaId, mediaType]);

  const toggleWatchlist = async () => {
    if (!userId) {
      alert('Please sign in with Google to add titles to your Watchlist!');
      return;
    }

    setLoading(true);

    if (inWatchlist) {
      await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', userId)
        .eq('media_id', mediaId)
        .eq('media_type', mediaType);

      setInWatchlist(false);
    } else {
      await supabase.from('watchlist').insert({
        user_id: userId,
        media_id: mediaId,
        media_type: mediaType,
        title,
        poster_path: posterPath,
        vote_average: voteAverage,
        release_date: releaseDate,
      });

      setInWatchlist(true);
    }

    setLoading(false);
  };

  return (
    <button
      onClick={toggleWatchlist}
      disabled={loading}
      className={`px-4 py-2 rounded-lg font-semibold text-sm transition flex items-center gap-2 cursor-pointer ${
        inWatchlist
          ? 'bg-neutral-800 text-green-400 border border-green-500/30 hover:bg-neutral-700'
          : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20'
      }`}
    >
      {inWatchlist ? '✓ Saved in My List' : '+ Add to My List'}
    </button>
  );
}