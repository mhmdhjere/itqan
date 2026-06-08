import { count, desc, eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { getDb } from "@/db";
import { users } from "@/db/schema";

export type AdminUserDto = {
  id: string;
  email: string;
  name: string;
  role: "teacher" | "admin";
  status: "active" | "suspended";
  createdAt: string;
  lastLoginAt: string | null;
};

export async function listUsers(): Promise<AdminUserDto[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      status: users.status,
      createdAt: users.createdAt,
      lastLoginAt: users.lastLoginAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));

  return rows.map((row) => ({
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    lastLoginAt: row.lastLoginAt?.toISOString() ?? null,
  }));
}

export async function getUserById(id: string) {
  const db = getDb();
  const [row] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      status: users.status,
      createdAt: users.createdAt,
      lastLoginAt: users.lastLoginAt,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (!row) return null;

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    lastLoginAt: row.lastLoginAt?.toISOString() ?? null,
  } satisfies AdminUserDto;
}

export async function createUser(data: {
  email: string;
  name: string;
  password: string;
  role: "teacher" | "admin";
}) {
  const db = getDb();
  const passwordHash = await bcrypt.hash(data.password, 12);

  const [created] = await db
    .insert(users)
    .values({
      email: data.email.toLowerCase(),
      name: data.name,
      passwordHash,
      role: data.role,
      status: "active",
    })
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      status: users.status,
      createdAt: users.createdAt,
      lastLoginAt: users.lastLoginAt,
    });

  return {
    id: created.id,
    email: created.email,
    name: created.name,
    role: created.role,
    status: created.status,
    createdAt: created.createdAt.toISOString(),
    lastLoginAt: created.lastLoginAt?.toISOString() ?? null,
  } satisfies AdminUserDto;
}

export async function updateUser(
  id: string,
  data: {
    name?: string;
    role?: "teacher" | "admin";
    status?: "active" | "suspended";
  },
) {
  const db = getDb();
  const [updated] = await db
    .update(users)
    .set(data)
    .where(eq(users.id, id))
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      status: users.status,
      createdAt: users.createdAt,
      lastLoginAt: users.lastLoginAt,
    });

  if (!updated) return null;

  return {
    id: updated.id,
    email: updated.email,
    name: updated.name,
    role: updated.role,
    status: updated.status,
    createdAt: updated.createdAt.toISOString(),
    lastLoginAt: updated.lastLoginAt?.toISOString() ?? null,
  } satisfies AdminUserDto;
}

export async function countActiveTeachers() {
  const db = getDb();
  const [row] = await db
    .select({ total: count() })
    .from(users)
    .where(eq(users.role, "teacher"));
  return row?.total ?? 0;
}
