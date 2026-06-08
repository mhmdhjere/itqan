import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["teacher", "admin"]);
export const userStatusEnum = pgEnum("user_status", ["active", "suspended"]);
export const reviewSourceEnum = pgEnum("review_source", ["manual", "algorithm"]);
export const sessionTypeEnum = pgEnum("session_type", ["regular", "review"]);
export const noteScopeEnum = pgEnum("note_scope", [
  "verse",
  "session",
  "student",
]);
export const configValueTypeEnum = pgEnum("config_value_type", [
  "number",
  "string",
  "boolean",
  "json",
]);
export const configCategoryEnum = pgEnum("config_category", [
  "mastery",
  "review",
  "live_session",
  "display",
  "feature_flags",
  "system",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("teacher"),
  status: userStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  preferencesJson: jsonb("preferences_json")
    .$type<{ quran_display_mode?: "structured" | "mushaf" }>()
    .default({}),
});

export const circles = pgTable("circles", {
  id: uuid("id").primaryKey().defaultRandom(),
  teacherId: uuid("teacher_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const students = pgTable("students", {
  id: uuid("id").primaryKey().defaultRandom(),
  circleId: uuid("circle_id")
    .notNull()
    .references(() => circles.id, { onDelete: "cascade" }),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  contactInfo: varchar("contact_info", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
});

export const memorizationPlans = pgTable("memorization_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id")
    .notNull()
    .unique()
    .references(() => students.id, { onDelete: "cascade" }),
  currentSurah: integer("current_surah").notNull(),
  currentStartAyah: integer("current_start_ayah").notNull(),
  currentEndAyah: integer("current_end_ayah").notNull(),
  nextSurah: integer("next_surah").notNull(),
  nextStartAyah: integer("next_start_ayah").notNull(),
  nextEndAyah: integer("next_end_ayah").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const reviewTargets = pgTable("review_targets", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  surah: integer("surah").notNull(),
  startAyah: integer("start_ayah").notNull(),
  endAyah: integer("end_ayah").notNull(),
  priority: integer("priority").notNull().default(0),
  source: reviewSourceEnum("source").notNull().default("manual"),
  lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const recitationSessions = pgTable("recitation_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  circleId: uuid("circle_id")
    .notNull()
    .references(() => circles.id, { onDelete: "cascade" }),
  teacherId: uuid("teacher_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  startedAt: timestamp("started_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  durationSeconds: integer("duration_seconds"),
  sessionType: sessionTypeEnum("session_type").notNull().default("regular"),
  summaryJson: jsonb("summary_json"),
});

export const sessionPassages = pgTable("session_passages", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => recitationSessions.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull().default(0),
  surah: integer("surah").notNull(),
  startAyah: integer("start_ayah").notNull(),
  endAyah: integer("end_ayah").notNull(),
});

export const verseRecords = pgTable("verse_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => recitationSessions.id, { onDelete: "cascade" }),
  surah: integer("surah").notNull(),
  ayah: integer("ayah").notNull(),
  statusSlug: varchar("status_slug", { length: 64 }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const mistakes = pgTable("mistakes", {
  id: uuid("id").primaryKey().defaultRandom(),
  verseRecordId: uuid("verse_record_id")
    .notNull()
    .references(() => verseRecords.id, { onDelete: "cascade" }),
  subcategorySlug: varchar("subcategory_slug", { length: 64 }).notNull(),
  note: text("note"),
});

export const notes = pgTable("notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  scope: noteScopeEnum("scope").notNull(),
  refId: uuid("ref_id").notNull(),
  body: text("body").notNull(),
  teacherId: uuid("teacher_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const appConfig = pgTable("app_config", {
  key: varchar("key", { length: 128 }).primaryKey(),
  valueJson: jsonb("value_json").notNull(),
  valueType: configValueTypeEnum("value_type").notNull(),
  category: configCategoryEnum("category").notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedBy: uuid("updated_by").references(() => users.id, {
    onDelete: "set null",
  }),
});

export const verseStatusDefinitions = pgTable("verse_status_definitions", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  labelEn: varchar("label_en", { length: 128 }).notNull(),
  labelAr: varchar("label_ar", { length: 128 }),
  scorePoints: integer("score_points").notNull(),
  color: varchar("color", { length: 32 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  isDefaultImplicit: boolean("is_default_implicit").notNull().default(false),
});

export const mistakeCategories = pgTable("mistake_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  labelEn: varchar("label_en", { length: 128 }).notNull(),
  labelAr: varchar("label_ar", { length: 128 }),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const mistakeSubcategories = pgTable("mistake_subcategories", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => mistakeCategories.id, { onDelete: "cascade" }),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  labelEn: varchar("label_en", { length: 128 }).notNull(),
  labelAr: varchar("label_ar", { length: 128 }),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const studentMasterySnapshots = pgTable(
  "student_mastery_snapshots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    surah: integer("surah").notNull(),
    ayah: integer("ayah").notNull(),
    state: varchar("state", { length: 32 }).notNull(),
    score: integer("score").notNull(),
    topMistakes: jsonb("top_mistakes").$type<string[]>().notNull().default([]),
    lastRecitedAt: timestamp("last_recited_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
);

export const featureFlags = pgTable("feature_flags", {
  key: varchar("key", { length: 128 }).primaryKey(),
  enabled: boolean("enabled").notNull().default(false),
  description: text("description"),
  scope: varchar("scope", { length: 32 }).notNull().default("global"),
});

export const parentReportShares = pgTable("parent_report_shares", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  teacherId: uuid("teacher_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 64 }).notNull().unique(),
  periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
  periodEnd: timestamp("period_end", { withTimezone: true }).notNull(),
  payloadJson: jsonb("payload_json").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const configAuditLog = pgTable("config_audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  adminUserId: uuid("admin_user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  entityType: varchar("entity_type", { length: 64 }).notNull(),
  entityId: varchar("entity_id", { length: 128 }),
  field: varchar("field", { length: 128 }).notNull(),
  oldValue: jsonb("old_value"),
  newValue: jsonb("new_value"),
  changeReason: text("change_reason"),
  changedAt: timestamp("changed_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
