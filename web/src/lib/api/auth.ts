import { auth } from "@/auth";
import { forbidden, unauthorized } from "./errors";

export async function requireTeacherSession() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: unauthorized() } as const;
  }
  return {
    session,
    teacherId: session.user.id,
  } as const;
}

export async function requireAdminSession() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: unauthorized() } as const;
  }
  if (session.user.role !== "admin") {
    return { error: forbidden() } as const;
  }
  return {
    session,
    adminId: session.user.id,
  } as const;
}
