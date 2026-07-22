import { pgTable, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const penteraSummaryTable = pgTable("pentera_summary", {
  id: text("id").primaryKey(),
  riskScore: integer("risk_score").notNull().default(0),
  totalFindings: integer("total_findings").notNull().default(0),
  criticalFindings: integer("critical_findings").notNull().default(0),
  highFindings: integer("high_findings").notNull().default(0),
  mediumFindings: integer("medium_findings").notNull().default(0),
  lowFindings: integer("low_findings").notNull().default(0),
  attackSurface: text("attack_surface").notNull().default("medium"),
  remediatedSinceLastScan: integer("remediated_since_last_scan").notNull().default(0),
  lastAssessment: timestamp("last_assessment", { withTimezone: true }).notNull().defaultNow(),
});

export const penteraFindingsTable = pgTable("pentera_findings", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  severity: text("severity").notNull(),
  category: text("category").notNull(),
  cvssScore: real("cvss_score"),
  affectedSystem: text("affected_system"),
  status: text("status").notNull().default("open"),
  remediationGuidance: text("remediation_guidance"),
  discoveredAt: timestamp("discovered_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPenteraSummarySchema = createInsertSchema(penteraSummaryTable).omit({ lastAssessment: true });
export type InsertPenteraSummary = z.infer<typeof insertPenteraSummarySchema>;

export const insertPenteraFindingSchema = createInsertSchema(penteraFindingsTable).omit({ discoveredAt: true });
export type InsertPenteraFinding = z.infer<typeof insertPenteraFindingSchema>;
