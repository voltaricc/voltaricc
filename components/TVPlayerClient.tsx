'use client';

import { useRouter } from 'next/navigation';

export default function TVPlayerClient({
  showId,
  seasons,
  currentSeason,
  currentEpisode,
  episodes,
}: {
  showId: string;
  seasons: any[];
  currentSeason: string;
  currentEpisode: string;
  episodes: any[];
}) {
  const router = useRouter();

  const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSeason = e.target.value;
    router.push(`/tv/${showId}?season=${newSeason}&episode=1`);
  };

  const handleEpisodeClick = (epNum: number) => {
    router.push(`/tv/${showId}?season=${currentSeason}&episode=${epNum}`);
  };

  return (
    <div className="space-y-4 bg-neutral-900/60 border border-neutral-800/80 p-5 rounded-2xl backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-bold">Épisodes</h2>
        
        {/* Sélecteur de saison */}
        <select
          value={currentSeason}
          onChange={handleSeasonChange}
          className="bg-neutral-950 border border-neutral-800 text-white text-xs font-bold rounded-xl px-4 py-2.5 focus:outline-none focus:border-neutral-600 transition"
        >
          {seasons
            .filter((s) => s.season_number > 0)
            .map((season) => (
              <option key={season.id} value={season.season_number}>
                {season.name} ({season.episode_count} épisodes)
              </option>
            ))}
        </select>
      </div>

      {/* Grille des épisodes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-2">
        {episodes.map((ep) => {
          const isSelected = String(ep.episode_number) === String(currentEpisode);
          return (
            <button
              key={ep.id}
              onClick={() => handleEpisodeClick(ep.episode_number)}
              className={`text-left p-3 rounded-xl border transition flex flex-col justify-between gap-2 ${
                isSelected
                  ? 'bg-white text-black border-white font-bold shadow-lg shadow-white/10'
                  : 'bg-neutral-950/80 text-neutral-300 border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-900'
              }`}
            >
              <div className="flex items-center justify-between w-full text-xs">
                <span>Épisode {ep.episode_number}</span>
                <span className={isSelected ? 'text-neutral-700' : 'text-neutral-500'}>
                  {ep.runtime ? `${ep.runtime}m` : ''}
                </span>
              </div>
              <p className={`text-xs line-clamp-1 ${isSelected ? 'text-black' : 'text-white font-medium'}`}>
                {ep.name}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}