import type { MushafPageData } from "@/lib/mushaf/types";

const cache = new Map<number, MushafPageData>();
const MAX_CACHE = 8;

export async function fetchMushafPage(page: number): Promise<MushafPageData> {
  const cached = cache.get(page);
  if (cached) return cached;

  const padded = String(page).padStart(3, "0");
  const res = await fetch(`/mushaf/page-${padded}.json`);
  if (!res.ok) throw new Error(`Mushaf page ${page} not found`);
  const data = (await res.json()) as MushafPageData;

  cache.set(page, data);
  if (cache.size > MAX_CACHE) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }

  return data;
}

export function clearMushafPageCache() {
  cache.clear();
}
