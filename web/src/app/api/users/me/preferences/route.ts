import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { unauthorized } from "@/lib/api/errors";
import {
  getUserPreferences,
  updateUserPreferences,
} from "@/lib/queries/user-preferences";

const patchSchema = z.object({
  quran_display_mode: z.enum(["structured", "mushaf"]).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const preferences = await getUserPreferences(session.user.id);
  return NextResponse.json({ preferences });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const preferences = await updateUserPreferences(
    session.user.id,
    parsed.data,
  );
  return NextResponse.json({ preferences });
}
