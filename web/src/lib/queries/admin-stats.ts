import { count } from "drizzle-orm";
import { getDb } from "@/db";
import { circles } from "@/db/schema";
import { countActiveTeachers } from "./admin-users";
import { countAuditLogSince, listAuditLog } from "./audit-log";

export async function getAdminOverview() {
  const db = getDb();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [[circleRow], teacherCount, configChanges7d, recentAudit] =
    await Promise.all([
      db.select({ total: count() }).from(circles),
      countActiveTeachers(),
      countAuditLogSince(sevenDaysAgo),
      listAuditLog({ limit: 5 }),
    ]);

  return {
    teacherCount,
    circleCount: circleRow?.total ?? 0,
    configChanges7d,
    recentAudit,
  };
}
