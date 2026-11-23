import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mediaType = searchParams.get('mediaType');
  const id = searchParams.get('id');

  if (!mediaType || !id || (mediaType !== 'movie' && mediaType !== 'tv')) {
    return NextResponse.json({ results: [] }, { status: 400 });
  }

  const apiKey = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ results: [] }, { status: 500 });
  }

  try {
    const recRes = await fetch(
      `https://api.themoviedb.org/3/${mediaType}/${id}/recommendations?api_key=${apiKey}&language=en-GB&page=1`,
      { next: { revalidate: 3600 } }
    );

    if (recRes.ok) {
      const recData = await recRes.json();
      if (Array.isArray(recData.results) && recData.results.length > 0) {
        return NextResponse.json({ results: recData.results });
      }
    }

    // Fallback to TMDB /similar endpoint if /recommendations returns no results
    const simRes = await fetch(
      `https://api.themoviedb.org/3/${mediaType}/${id}/similar?api_key=${apiKey}&language=en-GB&page=1`,
      { next: { revalidate: 3600 } }
    );

    if (!simRes.ok) {
      return NextResponse.json({ results: [] });
    }

    const simData = await simRes.json();
    return NextResponse.json({ results: simData.results || [] });
  } catch (error) {
    console.error('Recommendations fetch error:', error);
    return NextResponse.json({ results: [] });
  }
}