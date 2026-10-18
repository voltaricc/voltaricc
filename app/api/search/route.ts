import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim();

  if (!q) return NextResponse.json({ results: [] });

  const key = process.env.TMDB_API_KEY;
  if (!key) {
    return NextResponse.json({ results: [], error: 'Missing TMDB_API_KEY' }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/multi?api_key=${key}&query=${encodeURIComponent(q)}`
    );
    if (!res.ok) throw new Error(`TMDb responded ${res.status}`);
    const data = await res.json();
    return NextResponse.json({ results: data.results ?? [] });
  } catch (err) {
    console.error('Search failed:', err);
    return NextResponse.json({ results: [], error: 'Search failed' }, { status: 502 });
  }
}