import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { requireAdminSession } from "@/lib/api/auth";
import { badRequest } from "@/lib/api/errors";
import { writeConfigAuditLog } from "@/lib/config/audit";
import { createUser, listUsers } from "@/lib/queries/admin-users";
import { createUserSchema } from "@/lib/validations/user";

export async function GET() {
  const authResult = await requireAdminSession();
  if ("error" in authResult) return authResult.error;

  const userList = await listUsers();
  return NextResponse.json({ users: userList });
}

export async function POST(request: Request) {
  const authResult = await requireAdminSession();
  if ("error" in authResult) return authResult.error;

  const body = await request.json();
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const db = getDb();
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, parsed.data.email.toLowerCase()))
    .limit(1);

  if (existing) {
    return badRequest("A user with this email already exists");
  }

  const user = await createUser(parsed.data);

  await writeConfigAuditLog({
    adminUserId: authResult.adminId,
    entityType: "user",
    entityId: user.id,
    field: "created",
    newValue: {
      email: user.email,
      name: user.name,
      role: user.role,
    },
    changeReason: "User invited via admin panel",
  });

  return NextResponse.json({ user }, { status: 201 });
}
