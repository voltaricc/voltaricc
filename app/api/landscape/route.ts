import { NextRequest, NextResponse } from 'next/server';

// Fetches a widescreen backdrop for movies or an episode still for TV shows from TMDB
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mediaType = searchParams.get('mediaType');
  const id = searchParams.get('id');
  const season = Number(searchParams.get('season') || '1') || 1;
  const episode = Number(searchParams.get('episode') || '1') || 1;

  // Validate required query parameters before calling TMDB
  if (!id || (mediaType !== 'movie' && mediaType !== 'tv')) {
    return NextResponse.json({ landscapePath: null }, { status: 400 });
  }

  const apiKey = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ landscapePath: null }, { status: 500 });
  }

  try {
    if (mediaType === 'movie') {
      const movieRes = await fetch(
        `https://api.themoviedb.org/3/movie/${encodeURIComponent(id)}?api_key=${apiKey}`,
        { next: { revalidate: 86400 } }
      );

      if (!movieRes.ok) {
        return NextResponse.json({ landscapePath: null });
      }

      const movieData = await movieRes.json();
      return NextResponse.json({
        landscapePath: movieData.backdrop_path || movieData.poster_path || null,
      });
    }

    // For TV shows, fetch both show details and the active season to locate still_path
    const [showRes, seasonRes] = await Promise.all([
      fetch(
        `https://api.themoviedb.org/3/tv/${encodeURIComponent(id)}?api_key=${apiKey}`,
        { next: { revalidate: 86400 } }
      ),
      fetch(
        `https://api.themoviedb.org/3/tv/${encodeURIComponent(id)}/season/${season}?api_key=${apiKey}`,
        { next: { revalidate: 86400 } }
      ),
    ]);

    const showData = showRes.ok ? await showRes.json() : null;
    const seasonData = seasonRes.ok ? await seasonRes.json() : null;

    const matchedEpisode = Array.isArray(seasonData?.episodes)
      ? seasonData.episodes.find((ep: any) => ep.episode_number === episode)
      : null;

    const landscapePath =
      matchedEpisode?.still_path ||
      showData?.backdrop_path ||
      showData?.poster_path ||
      null;

    return NextResponse.json({ landscapePath });
  } catch (error) {
    console.error('Error fetching landscape thumbnail path:', error);
    return NextResponse.json({ landscapePath: null });
  }
}