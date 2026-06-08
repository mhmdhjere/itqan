import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api/auth";
import { badRequest } from "@/lib/api/errors";
import {
  listFeatureFlags,
  patchFeatureFlags,
} from "@/lib/config/feature-flags";
import { z } from "zod";

const patchSchema = z.object({
  flags: z.array(
    z.object({
      key: z.string().min(1),
      enabled: z.boolean(),
    }),
  ),
});

export async function GET() {
  const authResult = await requireAdminSession();
  if ("error" in authResult) return authResult.error;

  const flags = await listFeatureFlags();
  return NextResponse.json({ flags });
}

export async function PATCH(request: Request) {
  const authResult = await requireAdminSession();
  if ("error" in authResult) return authResult.error;

  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid flags");
  }

  await patchFeatureFlags(parsed.data.flags, authResult.adminId);
  const flags = await listFeatureFlags();
  return NextResponse.json({ flags });
}
