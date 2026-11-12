export const HISTORY_KEY = 'voltarix_history';
export const HISTORY_EVENT = 'voltarix_history_updated';

export interface HistoryEntry {
  storageKey: string;
  id: string;
  mediaType: 'movie' | 'tv';
  season?: number;
  episode?: number;
  title: string;
  posterPath?: string | null;
  currentTime: number;
  duration: number;
  progressPercent: number;
  updatedAt: number;
}

export function makeKey(mediaType: 'movie' | 'tv', id: string | number) {
  return `${mediaType}-${String(id)}`;
}

export function readHistory(): Record<string, HistoryEntry> {
  if (typeof window === 'undefined') return {};
  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function writeHistory(history: Record<string, HistoryEntry>) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  window.dispatchEvent(new Event(HISTORY_EVENT));
}

export function getSortedHistory(): HistoryEntry[] {
  return Object.entries(readHistory())
    .map(([key, item]) => ({
      ...item,
      storageKey: item.storageKey || key,
    }))
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

export function resumeHref(item: HistoryEntry): string {
  return item.mediaType === 'movie'
    ? `/watch/${item.id}`
    : `/tv/${item.id}?season=${item.season || 1}&episode=${item.episode || 1}`;
}