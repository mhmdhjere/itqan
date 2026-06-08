import { NextResponse } from "next/server";
import { getSurahIndex } from "@/lib/quran";

export async function GET() {
  return NextResponse.json({ surahs: getSurahIndex() });
}
