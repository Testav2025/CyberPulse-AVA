import { Router, type IRouter } from "express";
import { db, penteraSummaryTable, penteraFindingsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import {
  GetPenteraSummaryResponse,
  GetPenteraFindingsResponse,
  GetPenteraFindingsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/pentera/summary", async (req, res): Promise<void> => {
  const [summary] = await db.select().from(penteraSummaryTable).limit(1);

  if (!summary) {
    res.status(404).json({ error: "Pentera summary not found" });
    return;
  }

  res.json(GetPenteraSummaryResponse.parse({
    ...summary,
    lastAssessment: summary.lastAssessment.toISOString(),
  }));
});

router.get("/pentera/findings", async (req, res): Promise<void> => {
  const params = GetPenteraFindingsQueryParams.safeParse(req.query);
  const { severity = "all", limit = 20 } = params.success ? params.data : {};

  const filters = [];
  if (severity && severity !== "all") {
    filters.push(eq(penteraFindingsTable.severity, severity));
  }

  const findings = await db
    .select()
    .from(penteraFindingsTable)
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(desc(penteraFindingsTable.discoveredAt))
    .limit(limit ?? 20);

  res.json(GetPenteraFindingsResponse.parse(
    findings.map(f => ({
      id: f.id,
      title: f.title,
      description: f.description ?? null,
      severity: f.severity,
      category: f.category,
      cvssScore: f.cvssScore ?? null,
      affectedSystem: f.affectedSystem ?? null,
      status: f.status,
      remediationGuidance: f.remediationGuidance ?? null,
      discoveredAt: f.discoveredAt.toISOString(),
    }))
  ));
});

export default router;
