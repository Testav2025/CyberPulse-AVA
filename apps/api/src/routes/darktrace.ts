import { Router, type IRouter } from "express";
import { db, darktraceSummaryTable, darktraceIncidentsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  GetDarktraceSummaryResponse,
  GetDarktraceIncidentsResponse,
  GetDarktraceIncidentsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/darktrace/summary", async (req, res): Promise<void> => {
  const [summary] = await db.select().from(darktraceSummaryTable).limit(1);

  if (!summary) {
    res.status(404).json({ error: "Darktrace summary not found" });
    return;
  }

  res.json(GetDarktraceSummaryResponse.parse({
    ...summary,
    lastUpdated: summary.updatedAt.toISOString(),
  }));
});

router.get("/darktrace/incidents", async (req, res): Promise<void> => {
  const params = GetDarktraceIncidentsQueryParams.safeParse(req.query);
  const limit = params.success ? (params.data.limit ?? 10) : 10;

  const incidents = await db
    .select()
    .from(darktraceIncidentsTable)
    .orderBy(desc(darktraceIncidentsTable.createdAt))
    .limit(limit);

  res.json(GetDarktraceIncidentsResponse.parse(
    incidents.map(i => ({
      id: i.id,
      title: i.title,
      score: i.score,
      category: i.category,
      deviceHostname: i.deviceHostname,
      deviceIp: i.deviceIp ?? null,
      createdAt: i.createdAt.toISOString(),
      status: i.status,
      mitreTactics: i.mitreTactics ? i.mitreTactics.split("|").filter(Boolean) : [],
    }))
  ));
});

export default router;
