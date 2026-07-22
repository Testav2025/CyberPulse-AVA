import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const cyberScoresTable = pgTable("cyber_scores", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  overallScore: integer("overall_score").notNull().default(0),
  grade: text("grade").notNull().default("C"),
  identityScore: integer("identity_score").notNull().default(0),
  deviceScore: integer("device_score").notNull().default(0),
  trainingScore: integer("training_score").notNull().default(0),
  riskScore: integer("risk_score").notNull().default(0),
  trend: text("trend").notNull().default("stable"),
  calculatedAt: timestamp("calculated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cyberScoreHistoryTable = pgTable("cyber_score_history", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  score: integer("score").notNull(),
  grade: text("grade").notNull(),
  date: text("date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCyberScoreSchema = createInsertSchema(cyberScoresTable).omit({ calculatedAt: true });
export type InsertCyberScore = z.infer<typeof insertCyberScoreSchema>;
export type CyberScore = typeof cyberScoresTable.$inferSelect;

export const insertCyberScoreHistorySchema = createInsertSchema(cyberScoreHistoryTable).omit({ createdAt: true });
export type InsertCyberScoreHistory = z.infer<typeof insertCyberScoreHistorySchema>;
export type CyberScoreHistory = typeof cyberScoreHistoryTable.$inferSelect;
