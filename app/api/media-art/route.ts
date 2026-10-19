import { NextResponse } from 'next/server';

const BASE = 'https://api.themoviedb.org/3';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const id = searchParams.get('id') ?? '';
  const season = searchParams.get('season') ?? '1';
  const episode = searchParams.get('episode') ?? '1';

  // Only accept plain numbers and the two media types.
  const isNum = (v: string) => /^\d{1,9}$/.test(v);
  if (!isNum(id) || !isNum(season) || !isNum(episode) || (type !== 'movie' && type !== 'tv')) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  const key = process.env.TMDB_API_KEY;
  if (!key) {
    return NextResponse.json({ error: 'Missing TMDB_API_KEY' }, { status: 500 });
  }

  try {
    if (type === 'movie') {
      const res = await fetch(`${BASE}/movie/${id}?api_key=${key}`, {
        next: { revalidate: 86400 },
      });
      if (!res.ok) throw new Error(`TMDb responded ${res.status}`);
      const data = await res.json();
      return NextResponse.json({ image: data.backdrop_path ?? data.poster_path ?? null });
    }

    const res = await fetch(`${BASE}/tv/${id}/season/${season}?api_key=${key}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error(`TMDb responded ${res.status}`);
    const data = await res.json();

    const episodes: { episode_number: number; name?: string; still_path?: string | null }[] =
      data.episodes ?? [];
    const current = episodes.find((e) => e.episode_number === Number(episode));

    return NextResponse.json({
      image: current?.still_path ?? null,
      episodeName: current?.name ?? null,
      totalEpisodes: episodes.length || null,
    });
  } catch (err) {
    console.error('media-art failed:', err);
    return NextResponse.json({ image: null }, { status: 502 });
  }
}