'use client';

import { useState, useEffect } from 'react';
import { getSupabase } from '@/lib/supabase/client';

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

  useEffect(() => {
    async function checkWatchlist() {
      try {
        const supabase = getSupabase();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);

        const { data } = await supabase
          .from('watchlist')
          .select('id')
          .eq('user_id', user.id)
          .eq('media_id', mediaId)
          .eq('media_type', mediaType)
          .limit(1)
          .maybeSingle();

        if (data) setInWatchlist(true);
      } catch (err) {
        console.error('Could not check watchlist:', err);
      } finally {
        setLoading(false);
      }
    }

    checkWatchlist();
  }, [mediaId, mediaType]);

  const toggleWatchlist = async () => {
    if (!userId) {
      alert('Please sign in to add titles to My List.');
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabase();

      if (inWatchlist) {
        const { error } = await supabase
          .from('watchlist')
          .delete()
          .eq('user_id', userId)
          .eq('media_id', mediaId)
          .eq('media_type', mediaType);
        if (error) throw error;
        setInWatchlist(false);
      } else {
        const { error } = await supabase.from('watchlist').insert({
          user_id: userId,
          media_id: mediaId,
          media_type: mediaType,
          title,
          poster_path: posterPath || null,
          vote_average: voteAverage || null,
          release_date: releaseDate || null,
        });
        if (error) throw error;
        setInWatchlist(true);
      }
    } catch (err) {
      console.error('Could not update watchlist:', err);
      alert('Something went wrong saving that. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleWatchlist}
      disabled={loading}
      className={`px-4 py-2 rounded-lg font-semibold text-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-60 ${
        inWatchlist
          ? 'bg-neutral-900 text-sky-300 border border-sky-400/40 hover:bg-neutral-800'
          : 'bg-sky-500 hover:bg-sky-400 text-black shadow-lg shadow-sky-500/20'
      }`}
    >
      {inWatchlist ? '✓ Saved in My List' : '+ Add to My List'}
    </button>
  );
}