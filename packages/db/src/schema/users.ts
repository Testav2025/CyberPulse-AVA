import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  displayName: text("display_name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("Employee"),
  department: text("department").notNull().default("IT"),
  jobTitle: text("job_title"),
  avatarUrl: text("avatar_url"),
  theme: text("theme").notNull().default("dark"),
  teamsWebhookUrl: text("teams_webhook_url"),
  teamsEnabled: boolean("teams_enabled").notNull().default(false),
  alertsEnabled: boolean("alerts_enabled").notNull().default(true),
  alertMinSeverity: text("alert_min_severity").notNull().default("high"),
  scoreChangesEnabled: boolean("score_changes_enabled").notNull().default(true),
  weeklyDigestEnabled: boolean("weekly_digest_enabled").notNull().default(true),
  weeklyDigestDay: text("weekly_digest_day").notNull().default("monday"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ createdAt: true, updatedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
