import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/api/auth";
import { badRequest } from "@/lib/api/errors";
import { loadAdminConfig, patchAdminConfig } from "@/lib/config/admin";

const patchSchema = z.object({
  updates: z
    .array(
      z.object({
        key: z.string().min(1),
        value: z.unknown(),
      }),
    )
    .min(1),
});

export async function GET() {
  const authResult = await requireAdminSession();
  if ("error" in authResult) return authResult.error;

  const config = await loadAdminConfig();
  return NextResponse.json({ config });
}

export async function PATCH(request: Request) {
  const authResult = await requireAdminSession();
  if ("error" in authResult) return authResult.error;

  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  await patchAdminConfig(parsed.data.updates, authResult.adminId);
  const config = await loadAdminConfig();
  return NextResponse.json({ config });
}
