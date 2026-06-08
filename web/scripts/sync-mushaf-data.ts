/**
 * Downloads mushaf-layout page JSON into public/mushaf/.
 * Run: npx tsx scripts/sync-mushaf-data.ts
 */
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const BASE =
  "https://raw.githubusercontent.com/zonetecde/mushaf-layout/refs/heads/main/mushaf";
const OUT_DIR = path.join(process.cwd(), "public", "mushaf");
const TOTAL_PAGES = 604;
const CONCURRENCY = 12;

async function fetchPage(page: number) {
  const padded = String(page).padStart(3, "0");
  const url = `${BASE}/page-${padded}.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed page ${page}: ${res.status}`);
  return res.text();
}

async function run() {
  await mkdir(OUT_DIR, { recursive: true });

  let done = 0;
  for (let start = 1; start <= TOTAL_PAGES; start += CONCURRENCY) {
    const batch = Array.from(
      { length: Math.min(CONCURRENCY, TOTAL_PAGES - start + 1) },
      (_, i) => start + i,
    );
    await Promise.all(
      batch.map(async (page) => {
        const padded = String(page).padStart(3, "0");
        const outPath = path.join(OUT_DIR, `page-${padded}.json`);
        if (!existsSync(outPath)) {
          const text = await fetchPage(page);
          await writeFile(outPath, text, "utf8");
        }
        done += 1;
        if (done % 50 === 0 || done === TOTAL_PAGES) {
          console.log(`Mushaf pages: ${done}/${TOTAL_PAGES}`);
        }
      }),
    );
  }

  console.log(`Done. Files in ${OUT_DIR}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
