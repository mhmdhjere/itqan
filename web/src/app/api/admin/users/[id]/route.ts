import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api/auth";
import { badRequest, notFound } from "@/lib/api/errors";
import { writeConfigAuditLog } from "@/lib/config/audit";
import { getUserById, updateUser } from "@/lib/queries/admin-users";
import { updateUserSchema } from "@/lib/validations/user";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireAdminSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;

  if (id === authResult.adminId) {
    return badRequest("You cannot modify your own account from this panel");
  }

  const existing = await getUserById(id);
  if (!existing) return notFound();

  const body = await request.json();
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const user = await updateUser(id, parsed.data);
  if (!user) return notFound();

  for (const [field, newValue] of Object.entries(parsed.data)) {
    const oldValue = existing[field as keyof typeof existing];
    if (oldValue !== newValue) {
      await writeConfigAuditLog({
        adminUserId: authResult.adminId,
        entityType: "user",
        entityId: user.id,
        field,
        oldValue,
        newValue,
      });
    }
  }

  return NextResponse.json({ user });
}
