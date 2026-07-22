import { Router, type IRouter } from "express";
import { db, securityAlertsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import {
  GetAlertsResponse,
  GetAlertsQueryParams,
  GetAlertParams,
  GetAlertResponse,
  UpdateAlertStatusParams,
  UpdateAlertStatusBody,
  UpdateAlertStatusResponse,
  GetRecentAlertsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function mapAlert(a: typeof securityAlertsTable.$inferSelect) {
  return {
    id: a.id,
    title: a.title,
    description: a.description ?? null,
    severity: a.severity,
    status: a.status,
    source: a.source,
    category: a.category,
    affectedEntity: a.affectedEntity ?? null,
    remediationSteps: a.remediationSteps ?? null,
    createdAt: a.createdAt.toISOString(),
    resolvedAt: a.resolvedAt ? a.resolvedAt.toISOString() : null,
  };
}

router.get("/alerts/recent", async (req, res): Promise<void> => {
  const recent = await db
    .select()
    .from(securityAlertsTable)
    .where(eq(securityAlertsTable.status, "active"))
    .orderBy(desc(securityAlertsTable.createdAt))
    .limit(5);

  res.json(GetRecentAlertsResponse.parse(recent.map(mapAlert)));
});

router.get("/alerts", async (req, res): Promise<void> => {
  const params = GetAlertsQueryParams.safeParse(req.query);
  const { severity = "all", status = "all", limit = 20 } = params.success ? params.data : {};

  const filters = [];
  if (severity && severity !== "all") filters.push(eq(securityAlertsTable.severity, severity));
  if (status && status !== "all") filters.push(eq(securityAlertsTable.status, status));

  const alerts = await db
    .select()
    .from(securityAlertsTable)
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(desc(securityAlertsTable.createdAt))
    .limit(limit ?? 20);

  res.json(GetAlertsResponse.parse(alerts.map(mapAlert)));
});

router.get("/alerts/:id", async (req, res): Promise<void> => {
  const params = GetAlertParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [alert] = await db.select().from(securityAlertsTable).where(eq(securityAlertsTable.id, params.data.id));
  if (!alert) {
    res.status(404).json({ error: "Alert not found" });
    return;
  }

  res.json(GetAlertResponse.parse(mapAlert(alert)));
});

router.patch("/alerts/:id/status", async (req, res): Promise<void> => {
  const pathParams = UpdateAlertStatusParams.safeParse(req.params);
  if (!pathParams.success) {
    res.status(400).json({ error: pathParams.error.message });
    return;
  }

  const body = UpdateAlertStatusBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {
    status: body.data.status,
  };
  if (body.data.status === "resolved") {
    updateData.resolvedAt = new Date();
    if (body.data.resolutionNote) updateData.resolutionNote = body.data.resolutionNote;
  }

  const [alert] = await db
    .update(securityAlertsTable)
    .set(updateData)
    .where(eq(securityAlertsTable.id, pathParams.data.id))
    .returning();

  if (!alert) {
    res.status(404).json({ error: "Alert not found" });
    return;
  }

  res.json(UpdateAlertStatusResponse.parse(mapAlert(alert)));
});

export default router;
