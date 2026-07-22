import { pgTable, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const darktraceSummaryTable = pgTable("darktrace_summary", {
  id: text("id").primaryKey(),
  threatScore: integer("threat_score").notNull().default(0),
  activeIncidents: integer("active_incidents").notNull().default(0),
  modelBreaches: integer("model_breaches").notNull().default(0),
  anomalousDevices: integer("anomalous_devices").notNull().default(0),
  criticalBreaches: integer("critical_breaches").notNull().default(0),
  highBreaches: integer("high_breaches").notNull().default(0),
  trend: text("trend").notNull().default("stable"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const darktraceIncidentsTable = pgTable("darktrace_incidents", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  score: real("score").notNull().default(0),
  category: text("category").notNull(),
  deviceHostname: text("device_hostname").notNull(),
  deviceIp: text("device_ip"),
  status: text("status").notNull().default("active"),
  mitreTactics: text("mitre_tactics"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDarktraceSummarySchema = createInsertSchema(darktraceSummaryTable).omit({ updatedAt: true });
export type InsertDarktraceSummary = z.infer<typeof insertDarktraceSummarySchema>;

export const insertDarktraceIncidentSchema = createInsertSchema(darktraceIncidentsTable).omit({ createdAt: true });
export type InsertDarktraceIncident = z.infer<typeof insertDarktraceIncidentSchema>;
