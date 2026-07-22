import { Router, type IRouter } from "express";
import { db, trainingModulesTable, trainingEnrollmentsTable, usersTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import {
  GetTrainingModulesResponse,
  GetTrainingModulesQueryParams,
  GetTrainingModuleParams,
  GetTrainingModuleResponse,
  GetTrainingProgressResponse,
  EnrollTrainingModuleParams,
  EnrollTrainingModuleResponse,
  CompleteTrainingModuleParams,
  CompleteTrainingModuleResponse,
  GetTrainingLeaderboardQueryParams,
  GetTrainingLeaderboardResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function mapModule(m: typeof trainingModulesTable.$inferSelect, enrollment?: typeof trainingEnrollmentsTable.$inferSelect | null) {
  return {
    id: m.id,
    title: m.title,
    description: m.description,
    category: m.category,
    durationMinutes: m.durationMinutes,
    difficulty: m.difficulty,
    status: enrollment ? enrollment.status : "not_started",
    completionRate: m.completionRate,
    userProgress: enrollment ? enrollment.progress : null,
    scoreContribution: m.scoreContribution,
    tags: m.tags ? m.tags.split("|").filter(Boolean) : [],
    isMandatory: m.isMandatory,
    dueDate: m.dueDate ?? null,
  };
}

router.get("/training/modules", async (req, res): Promise<void> => {
  const params = GetTrainingModulesQueryParams.safeParse(req.query);
  const { category, status = "all" } = params.success ? params.data : {};

  const [modules, enrollments] = await Promise.all([
    db.select().from(trainingModulesTable),
    db.select().from(trainingEnrollmentsTable).where(eq(trainingEnrollmentsTable.userId, req.user.id)),
  ]);

  const enrollmentMap = new Map(enrollments.map(e => [e.moduleId, e]));

  let filtered = modules.map(m => mapModule(m, enrollmentMap.get(m.id)));

  if (category) {
    filtered = filtered.filter(m => m.category === category);
  }
  if (status && status !== "all") {
    filtered = filtered.filter(m => m.status === status);
  }

  res.json(GetTrainingModulesResponse.parse(filtered));
});

router.get("/training/modules/:id", async (req, res): Promise<void> => {
  const params = GetTrainingModuleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [mod, enrollment] = await Promise.all([
    db.select().from(trainingModulesTable).where(eq(trainingModulesTable.id, params.data.id)).then(r => r[0]),
    db.select().from(trainingEnrollmentsTable)
      .where(and(eq(trainingEnrollmentsTable.moduleId, params.data.id), eq(trainingEnrollmentsTable.userId, req.user.id)))
      .then(r => r[0]),
  ]);

  if (!mod) {
    res.status(404).json({ error: "Module not found" });
    return;
  }

  res.json(GetTrainingModuleResponse.parse(mapModule(mod, enrollment)));
});

router.get("/training/progress", async (req, res): Promise<void> => {
  const [allModules, enrollments] = await Promise.all([
    db.select().from(trainingModulesTable),
    db.select().from(trainingEnrollmentsTable).where(eq(trainingEnrollmentsTable.userId, req.user.id)),
  ]);

  const completed = enrollments.filter(e => e.status === "completed").length;
  const inProgress = enrollments.filter(e => e.status === "in_progress").length;
  const total = allModules.length;
  const notStarted = total - completed - inProgress;
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const totalPoints = completed * 10;

  const mandatoryModules = allModules.filter(m => m.isMandatory);
  const mandatoryCompleted = mandatoryModules.filter(m => {
    const e = enrollments.find(e => e.moduleId === m.id);
    return e?.status === "completed";
  }).length;

  res.json(GetTrainingProgressResponse.parse({
    completed,
    inProgress,
    notStarted,
    total,
    completionPercentage,
    totalPoints,
    currentStreak: 3,
    mandatoryCompleted,
    mandatoryTotal: mandatoryModules.length,
  }));
});

router.post("/training/modules/:id/enroll", async (req, res): Promise<void> => {
  const params = EnrollTrainingModuleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const existing = await db.select().from(trainingEnrollmentsTable)
    .where(and(eq(trainingEnrollmentsTable.moduleId, params.data.id), eq(trainingEnrollmentsTable.userId, req.user.id)))
    .then(r => r[0]);

  if (existing) {
    res.json(EnrollTrainingModuleResponse.parse({
      moduleId: existing.moduleId,
      userId: existing.userId,
      status: existing.status,
      progress: existing.progress,
      enrolledAt: existing.enrolledAt.toISOString(),
      completedAt: existing.completedAt ? existing.completedAt.toISOString() : null,
    }));
    return;
  }

  const [enrollment] = await db.insert(trainingEnrollmentsTable).values({
    id: randomUUID(),
    moduleId: params.data.id,
    userId: req.user.id,
    status: "in_progress",
    progress: 0,
  }).returning();

  res.json(EnrollTrainingModuleResponse.parse({
    moduleId: enrollment.moduleId,
    userId: enrollment.userId,
    status: enrollment.status,
    progress: enrollment.progress,
    enrolledAt: enrollment.enrolledAt.toISOString(),
    completedAt: null,
  }));
});

router.post("/training/modules/:id/complete", async (req, res): Promise<void> => {
  const params = CompleteTrainingModuleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const existing = await db.select().from(trainingEnrollmentsTable)
    .where(and(eq(trainingEnrollmentsTable.moduleId, params.data.id), eq(trainingEnrollmentsTable.userId, req.user.id)))
    .then(r => r[0]);

  const now = new Date();

  if (existing) {
    const [updated] = await db.update(trainingEnrollmentsTable)
      .set({ status: "completed", progress: 100, completedAt: now })
      .where(eq(trainingEnrollmentsTable.id, existing.id))
      .returning();

    res.json(CompleteTrainingModuleResponse.parse({
      moduleId: updated.moduleId,
      userId: updated.userId,
      status: updated.status,
      progress: updated.progress,
      enrolledAt: updated.enrolledAt.toISOString(),
      completedAt: updated.completedAt ? updated.completedAt.toISOString() : null,
    }));
    return;
  }

  const [enrollment] = await db.insert(trainingEnrollmentsTable).values({
    id: randomUUID(),
    moduleId: params.data.id,
    userId: req.user.id,
    status: "completed",
    progress: 100,
    completedAt: now,
  }).returning();

  res.json(CompleteTrainingModuleResponse.parse({
    moduleId: enrollment.moduleId,
    userId: enrollment.userId,
    status: enrollment.status,
    progress: enrollment.progress,
    enrolledAt: enrollment.enrolledAt.toISOString(),
    completedAt: enrollment.completedAt ? enrollment.completedAt.toISOString() : null,
  }));
});

router.get("/training/leaderboard", async (req, res): Promise<void> => {
  const params = GetTrainingLeaderboardQueryParams.safeParse(req.query);
  const limit = params.success ? (params.data.limit ?? 10) : 10;

  const users = await db.select().from(usersTable).limit(limit);

  const leaderboard = users.map((u, i) => ({
    rank: i + 1,
    userId: u.id,
    displayName: u.displayName,
    department: u.department,
    avatarUrl: u.avatarUrl ?? null,
    totalPoints: Math.max(0, 100 - i * 8),
    completedModules: Math.max(0, 10 - i),
  }));

  res.json(GetTrainingLeaderboardResponse.parse(leaderboard));
});

export default router;
