'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase/client';
import { RowHeading } from './MediaRow';

type HistoryItem = {
  media_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  season: number | null;
  episode: number | null;
};

type Art = {
  image: string | null;
  episodeName?: string | null;
  totalEpisodes?: number | null;
};

type Card = HistoryItem & Partial<Art>;

export default function ContinueWatching() {
  const [items, setItems] = useState<Card[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const supabase = getSupabase();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('watch_history')
          .select('media_id, media_type, title, poster_path, season, episode')
          .eq('user_id', user.id)
          .order('watched_at', { ascending: false })
          .limit(30);

        if (error) throw error;
        if (cancelled || !data) return;

        // Newest first, one card per title.
        const seen = new Set<string>();
        const unique = (data as HistoryItem[])
          .filter((row) => {
            const key = `${row.media_type}-${row.media_id}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .slice(0, 12);

        // Show the cards straight away, then fill in the thumbnails.
        setItems(unique);

        const arts: Art[] = await Promise.all(
          unique.map(async (item) => {
            try {
              const qs = new URLSearchParams({
                type: item.media_type,
                id: String(item.media_id),
                season: String(item.season || 1),
                episode: String(item.episode || 1),
              });
              const res = await fetch(`/api/media-art?${qs.toString()}`);
              if (!res.ok) return { image: null };
              return (await res.json()) as Art;
            } catch {
              return { image: null };
            }
          })
        );

        if (!cancelled) {
          setItems(unique.map((item, i) => ({ ...item, ...arts[i] })));
        }
      } catch (err) {
        console.error('Could not load watch history:', err);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!items.length) return null;

  return (
    <section>
      <RowHeading>Continue Watching</RowHeading>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
        {items.map((item) => {
          const isTv = item.media_type === 'tv';
          const season = item.season || 1;
          const episode = item.episode || 1;

          // Wide thumbnail if we have one, otherwise the poster.
          const src = item.image
            ? `https://image.tmdb.org/t/p/original${item.image}`
            : item.poster_path
              ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
              : null;

          const total = item.totalEpisodes ?? null;
          const percent = isTv && total ? Math.min(100, Math.round((episode / total) * 100)) : null;

          const line = isTv
            ? `S${season} · E${episode}${total ? ` of ${total}` : ''}${
                item.episodeName ? ` · ${item.episodeName}` : ''
              }`
            : 'Movie';

          return (
            <Link
              key={`${item.media_type}-${item.media_id}`}
              href={isTv ? `/tv/${item.media_id}?season=${season}&episode=${episode}` : `/watch/${item.media_id}`}
              className="group shrink-0 w-64 md:w-72"
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 transition duration-300 group-hover:border-sky-500/60">
                {src ? (
                  <Image
                    src={src}
                    alt={item.title}
                    fill
                    sizes="(min-width: 768px) 288px, 256px"
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center p-3 text-center text-xs text-neutral-500">
                    {item.title}
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-500 text-black shadow-lg shadow-sky-500/30">
                    <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5 fill-current" aria-hidden="true">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </div>

                {percent !== null && (
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-neutral-700/80">
                    <div className="h-full bg-sky-400" style={{ width: `${percent}%` }} />
                  </div>
                )}
              </div>

              <div className="pt-2">
                <h3 className="truncate text-sm font-semibold text-neutral-100">{item.title}</h3>
                <p className="truncate text-[11px] font-semibold text-sky-400">{line}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}