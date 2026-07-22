import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const trainingModulesTable = pgTable("training_modules", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  durationMinutes: integer("duration_minutes").notNull().default(15),
  difficulty: text("difficulty").notNull().default("beginner"),
  completionRate: integer("completion_rate").notNull().default(0),
  scoreContribution: integer("score_contribution").notNull().default(5),
  tags: text("tags"),
  isMandatory: boolean("is_mandatory").notNull().default(false),
  dueDate: text("due_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const trainingEnrollmentsTable = pgTable("training_enrollments", {
  id: text("id").primaryKey(),
  moduleId: text("module_id").notNull(),
  userId: text("user_id").notNull(),
  status: text("status").notNull().default("enrolled"),
  progress: integer("progress").notNull().default(0),
  enrolledAt: timestamp("enrolled_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const insertTrainingModuleSchema = createInsertSchema(trainingModulesTable).omit({ createdAt: true });
export type InsertTrainingModule = z.infer<typeof insertTrainingModuleSchema>;
export type TrainingModule = typeof trainingModulesTable.$inferSelect;

export const insertTrainingEnrollmentSchema = createInsertSchema(trainingEnrollmentsTable).omit({ enrolledAt: true });
export type InsertTrainingEnrollment = z.infer<typeof insertTrainingEnrollmentSchema>;
export type TrainingEnrollment = typeof trainingEnrollmentsTable.$inferSelect;
