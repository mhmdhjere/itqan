import { NextResponse } from "next/server";
import { requireTeacherSession } from "@/lib/api/auth";
import { notFound } from "@/lib/api/errors";
import { guardStudent } from "@/lib/api/guards";
import {
  getWeakAyahDetail,
  getWeakAyatForStudent,
} from "@/lib/queries/weak-ayat";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const authResult = await requireTeacherSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;
  const denied = await guardStudent(id, authResult.teacherId);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const surah = Number(searchParams.get("surah"));
  const ayah = Number(searchParams.get("ayah"));
  const limit = Number(searchParams.get("limit") ?? "20");

  if (surah && ayah) {
    const detail = await getWeakAyahDetail(
      id,
      authResult.teacherId,
      surah,
      ayah,
    );
    if (!detail) return notFound();
    return NextResponse.json({ ayah: detail });
  }

  const weakAyat = await getWeakAyatForStudent(
    id,
    authResult.teacherId,
    Number.isFinite(limit) ? limit : 20,
  );
  if (weakAyat === null) return notFound();

  return NextResponse.json({ weakAyat });
}
