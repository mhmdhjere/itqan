/**
 * Builds ayah-to-page index from bundled mushaf JSON.
 * Run: npx tsx scripts/build-mushaf-index.ts
 */
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type MushafWord = { location: string };
type MushafLine = {
  type: string;
  words?: MushafWord[];
};
type MushafPage = { page: number; lines: MushafLine[] };

const MUSHAF_DIR = path.join(process.cwd(), "public", "mushaf");
const OUT_FILE = path.join(process.cwd(), "src", "data", "ayah-to-page.json");

async function run() {
  const files = (await readdir(MUSHAF_DIR))
    .filter((f) => f.startsWith("page-") && f.endsWith(".json"))
    .sort();

  if (files.length === 0) {
    throw new Error(`No page JSON in ${MUSHAF_DIR}. Run: npx tsx scripts/sync-mushaf-data.ts`);
  }

  const index: Record<string, number> = {};

  for (const file of files) {
    const pageNum = Number(file.replace("page-", "").replace(".json", ""));
    const raw = await readFile(path.join(MUSHAF_DIR, file), "utf8");
    const data = JSON.parse(raw) as MushafPage;

    for (const line of data.lines) {
      if (line.type !== "text" || !line.words) continue;
      for (const word of line.words) {
        const [surah, ayah] = word.location.split(":").map(Number);
        if (!surah || !ayah) continue;
        const key = `${surah}:${ayah}`;
        if (index[key] === undefined) index[key] = pageNum;
      }
    }
  }

  await mkdir(path.dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(index), "utf8");
  console.log(`Wrote ${Object.keys(index).length} ayah entries → ${OUT_FILE}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
