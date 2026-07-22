import { Router, type IRouter } from "express";
import { db, cyberScoresTable, cyberScoreHistoryTable, securityAlertsTable, devicesTable, trainingEnrollmentsTable, darktraceSummaryTable, penteraSummaryTable } from "@workspace/db";
import { eq, desc, and, gte } from "drizzle-orm";
import {
  GetCyberScoreResponse,
  GetCyberScoreHistoryResponse,
  GetCyberScoreHistoryQueryParams,
  GetSecuritySummaryResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/cyberscore", async (req, res): Promise<void> => {
  const [score] = await db.select().from(cyberScoresTable).where(eq(cyberScoresTable.userId, req.user.id));

  if (!score) {
    res.status(404).json({ error: "Score not found" });
    return;
  }

  res.json(GetCyberScoreResponse.parse({
    ...score,
    lastCalculated: score.calculatedAt.toISOString(),
  }));
});

router.get("/cyberscore/history", async (req, res): Promise<void> => {
  const params = GetCyberScoreHistoryQueryParams.safeParse(req.query);
  const days = params.success ? (params.data.days ?? 30) : 30;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const history = await db
    .select()
    .from(cyberScoreHistoryTable)
    .where(
      and(
        eq(cyberScoreHistoryTable.userId, req.user.id),
        gte(cyberScoreHistoryTable.createdAt, cutoff)
      )
    )
    .orderBy(cyberScoreHistoryTable.date);

  res.json(GetCyberScoreHistoryResponse.parse(
    history.map(h => ({ date: h.date, score: h.score, grade: h.grade }))
  ));
});

router.get("/cyberscore/summary", async (req, res): Promise<void> => {
  const [[score], alerts, allDevices, enrollments, [dtSummary], [ptSummary]] = await Promise.all([
    db.select().from(cyberScoresTable).where(eq(cyberScoresTable.userId, req.user.id)),
    db.select().from(securityAlertsTable),
    db.select().from(devicesTable),
    db.select().from(trainingEnrollmentsTable).where(eq(trainingEnrollmentsTable.userId, req.user.id)),
    db.select().from(darktraceSummaryTable).limit(1),
    db.select().from(penteraSummaryTable).limit(1),
  ]);

  const activeAlerts = alerts.filter(a => a.status === "active");
  const criticalAlerts = activeAlerts.filter(a => a.severity === "critical").length;
  const highAlerts = activeAlerts.filter(a => a.severity === "high").length;
  const compliantDevices = allDevices.filter(d => d.complianceState === "compliant").length;
  const totalModules = 12;
  const completedModules = enrollments.filter(e => e.status === "completed").length;
  const completionPct = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  res.json(GetSecuritySummaryResponse.parse({
    cyberScore: score?.overallScore ?? 0,
    cyberScoreGrade: score?.grade ?? "C",
    cyberScoreTrend: score?.trend ?? "stable",
    activeAlerts: activeAlerts.length,
    criticalAlerts,
    highAlerts,
    compliantDevices,
    totalDevices: allDevices.length,
    trainingCompletion: completionPct,
    criticalFindings: ptSummary?.criticalFindings ?? 0,
    darktraceThreatScore: dtSummary?.threatScore ?? null,
    penteraRiskScore: ptSummary?.riskScore ?? null,
    lastUpdated: new Date().toISOString(),
  }));
});

export default router;
