import { getTVDetails } from '@/lib/tmdb';
import Header from '@/components/Header';
import WatchlistButton from '@/components/WatchlistButton';
import WatchTracker from '@/components/WatchTracker';
import Link from 'next/link';
import { connection } from 'next/server';

export default async function TVWatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ season?: string; episode?: string; quality?: string }>;
}) {
  await connection();

  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const id = resolvedParams.id;
  const quality = resolvedSearchParams.quality || 'hd';
  const show = await getTVDetails(id);

  const currentSeason = parseInt(resolvedSearchParams.season || '1', 10);
  const currentEpisode = parseInt(resolvedSearchParams.episode || '1', 10);

  let embedUrl = `https://vidsrc.to/embed/tv/${id}/${currentSeason}/${currentEpisode}`;
  if (quality === 'backup') {
    embedUrl = `https://vidsrc.me/embed/tv?tmdb=${id}&season=${currentSeason}&episode=${currentEpisode}`;
  }

  const seasonData = show.seasons?.find((s: any) => s.season_number === currentSeason) || show.seasons?.[0];
  const episodeCount = seasonData?.episode_count || 10;

  return (
    <main className="min-h-screen bg-black text-white font-sans pb-16">
      <Header />
      <WatchTracker
        mediaId={id}
        mediaType="tv"
        title={show.name}
        posterPath={show.poster_path}
        season={currentSeason}
        episode={currentEpisode}
      />

      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-6">
        {/* Navigation Breadcrumb */}
        <Link
          href="/"
          className="text-xs font-semibold uppercase tracking-widest text-neutral-400 hover:text-sky-400 mb-5 inline-flex items-center gap-1.5 transition"
        >
          ← Retour à l'accueil
        </Link>

        {/* Title Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">{show.name}</h1>
            <span className="bg-sky-500/10 text-sky-400 border border-sky-400/30 text-[10px] font-black px-2.5 py-0.5 rounded-full tracking-widest uppercase">
              Full HD
            </span>
          </div>

          <WatchlistButton
            mediaId={id}
            mediaType="tv"
            title={show.name}
            posterPath={show.poster_path}
            voteAverage={show.vote_average}
            releaseDate={show.first_air_date}
          />
        </div>

        <p className="text-xs text-sky-400 font-bold mb-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 inline-block" />
          Saison {currentSeason} • Épisode {currentEpisode}
        </p>

        {/* Player Source Switcher Bar */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3 mb-4 flex flex-wrap items-center justify-between gap-3 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider mr-1 hidden sm:inline">
              Serveur :
            </span>
            <Link
              href={`/tv/${id}?season=${currentSeason}&episode=${currentEpisode}&quality=hd`}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                quality === 'hd'
                  ? 'bg-sky-500 text-black shadow-md shadow-sky-500/20'
                  : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              <span>⚡</span> Serveur Principal (HD)
            </Link>
            <Link
              href={`/tv/${id}?season=${currentSeason}&episode=${currentEpisode}&quality=backup`}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                quality === 'backup'
                  ? 'bg-sky-500 text-black shadow-md shadow-sky-500/20'
                  : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              <span>🔄</span> Serveur de Secours
            </Link>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Flux prêt
          </div>
        </div>

        {/* Refined Video Player Frame */}
        <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-neutral-800/80 shadow-[0_0_35px_rgba(56,189,248,0.12)]">
          <iframe
            src={embedUrl}
            className="w-full h-full border-none"
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture"
          />
        </div>

        {/* Season & Episode Selector */}
        <div className="mt-6 bg-neutral-900/80 border border-neutral-800 p-6 rounded-2xl backdrop-blur-sm">
          <h2 className="text-xs font-bold mb-4 text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-3 bg-sky-400 rounded-full inline-block" />
            Sélectionner un épisode
          </h2>

          <div className="flex gap-2 overflow-x-auto pb-4 mb-4 border-b border-neutral-800 scrollbar-none">
            {show.seasons?.filter((s: any) => s.season_number > 0).map((s: any) => (
              <Link
                key={s.id}
                href={`/tv/${id}?season=${s.season_number}&episode=1&quality=${quality}`}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  s.season_number === currentSeason
                    ? 'bg-sky-500 text-black shadow-md shadow-sky-500/20'
                    : 'bg-neutral-950 text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
                }`}
              >
                Saison {s.season_number}
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {Array.from({ length: episodeCount }, (_, i) => i + 1).map((ep) => (
              <Link
                key={ep}
                href={`/tv/${id}?season=${currentSeason}&episode=${ep}&quality=${quality}`}
                className={`py-2 rounded-lg text-center text-xs font-bold transition border ${
                  ep === currentEpisode
                    ? 'bg-sky-500 border-sky-400 text-black shadow-md shadow-sky-500/20'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                E{ep}
              </Link>
            ))}
          </div>
        </div>

        {/* Overview */}
        <div className="mt-6 bg-neutral-900/60 border border-neutral-800/80 p-6 rounded-2xl backdrop-blur-sm">
          <p className="text-neutral-300 text-sm leading-relaxed">{show.overview}</p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-neutral-400 border-t border-neutral-800/60 pt-4">
            <span className="text-sky-400 font-extrabold flex items-center gap-1">
              ★ {show.vote_average?.toFixed(1)} / 10
            </span>
            <span>•</span>
            <span>{show.first_air_date?.slice(0, 4)}</span>
            <span>•</span>
            <span>{show.number_of_seasons} Saisons</span>
          </div>
        </div>
      </div>
    </main>
  );
}