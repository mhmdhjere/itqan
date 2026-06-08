import { NextResponse } from "next/server";
import { getSurahAyahs, getSurahMeta } from "@/lib/quran";

type RouteContext = {
  params: Promise<{ surah: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { surah: surahParam } = await context.params;
  const surah = Number.parseInt(surahParam, 10);

  if (!Number.isFinite(surah) || surah < 1 || surah > 114) {
    return NextResponse.json({ error: "Invalid surah number" }, { status: 400 });
  }

  const meta = getSurahMeta(surah);
  const ayahs = getSurahAyahs(surah);

  return NextResponse.json({ surah: meta, ayahs });
}
