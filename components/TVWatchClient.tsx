'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import WatchTracker from '@/components/WatchTracker';

interface Season {
  season_number: number;
  episode_count: number;
  name: string;
}

interface TVWatchClientProps {
  id: string;
  imdbId: string;
  tvName: string;
  posterPath: string;
  backdropPath: string;
  seasons: Season[];
  initialSeason: number;
  initialEpisode: number;
}

export default function TVWatchClient({
  id,
  imdbId,
  tvName,
  posterPath,
  backdropPath,
  seasons,
  initialSeason,
  initialEpisode,
}: TVWatchClientProps) {
  const [season, setSeason] = useState<number>(initialSeason);
  const [episode, setEpisode] = useState<number>(initialEpisode);
  const [episodeStill, setEpisodeStill] = useState<string>(backdropPath || posterPath);

  // Fetch specific episode still image when season or episode changes
  useEffect(() => {
    if (!id) return;
    async function fetchEpisodeStill() {
      try {
        const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
        const res = await fetch(`https://api.themoviedb.org/3/tv/${id}/season/${season}/episode/${episode}?api_key=${apiKey}`);
        const data = await res.json();
        if (data && data.still_path) {
          setEpisodeStill(data.still_path);
        } else {
          setEpisodeStill(backdropPath || posterPath);
        }
      } catch (err) {
        setEpisodeStill(backdropPath || posterPath);
      }
    }
    fetchEpisodeStill();
  }, [id, season, episode, backdropPath, posterPath]);

  const currentSeasonObj = seasons.find((s) => s.season_number === season) || seasons[0] || { episode_count: 1 };
  const maxEpisodes = currentSeasonObj.episode_count || 1;
  const episodesList = Array.from({ length: maxEpisodes }, (_, i) => i + 1);

  const handleSeasonChange = (newSeason: number) => {
    setSeason(newSeason);
    setEpisode(1);
    window.history.replaceState(null, '', `?season=${newSeason}&episode=1`);
  };

  const handleEpisodeChange = (newEpisode: number) => {
    setEpisode(newEpisode);
    window.history.replaceState(null, '', `?season=${season}&episode=${newEpisode}`);
  };

  const embedUrl = `https://framextv.tech/embed/tv/${id}/${season}/${episode}`;

  return (
    <main className="min-h-screen bg-black text-white font-sans pb-16">
      <Header />

      {tvName && (
        <WatchTracker
          mediaId={id}
          mediaType="tv"
          title={tvName}
          posterPath={episodeStill} // Saves the specific episode thumbnail
          season={season}
          episode={episode}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-neutral-900/80 border border-neutral-800 p-4 rounded-xl">
          <div>
            <h1 className="text-sm font-semibold text-neutral-300">
              {tvName ? `Watching ${tvName} — S${season} E${episode}` : 'Streaming via FrameX TV Engine'}
            </h1>
            <p className="text-xs text-neutral-500">Select your season and episode below.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="season-select" className="text-xs text-neutral-400 font-medium">Season:</label>
              <select
                id="season-select"
                value={season}
                onChange={(e) => handleSeasonChange(Number(e.target.value))}
                className="bg-neutral-800 text-neutral-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-neutral-700 focus:outline-none focus:border-sky-500"
              >
                {seasons.map((s) => (
                  <option key={s.season_number} value={s.season_number} className="bg-neutral-900 text-white">
                    Season {s.season_number} ({s.episode_count} Eps)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="episode-select" className="text-xs text-neutral-400 font-medium">Episode:</label>
              <select
                id="episode-select"
                value={episode}
                onChange={(e) => handleEpisodeChange(Number(e.target.value))}
                className="bg-neutral-800 text-neutral-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-neutral-700 focus:outline-none focus:border-sky-500"
              >
                {episodesList.map((e) => (
                  <option key={e} value={e} className="bg-neutral-900 text-white">
                    Episode {e}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 shadow-2xl">
          <iframe
            key={`${id}-${season}-${episode}`}
            src={embedUrl}
            className="w-full h-full border-0"
            allowFullScreen
            title="TV Video Player"
            referrerPolicy="origin"
          />
        </div>

        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-sky-400 transition">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}