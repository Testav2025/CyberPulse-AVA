import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  GetNotificationPreferencesResponse,
  UpdateNotificationPreferencesBody,
  UpdateNotificationPreferencesResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/notifications/preferences", async (req, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user.id));

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(GetNotificationPreferencesResponse.parse({
    teamsEnabled: user.teamsEnabled,
    teamsWebhookUrl: user.teamsWebhookUrl ?? null,
    alertsEnabled: user.alertsEnabled,
    alertMinSeverity: user.alertMinSeverity,
    scoreChangesEnabled: user.scoreChangesEnabled,
    weeklyDigestEnabled: user.weeklyDigestEnabled,
    weeklyDigestDay: user.weeklyDigestDay,
  }));
});

router.put("/notifications/preferences", async (req, res): Promise<void> => {
  const body = UpdateNotificationPreferencesBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [user] = await db
    .update(usersTable)
    .set({
      teamsEnabled: body.data.teamsEnabled,
      teamsWebhookUrl: body.data.teamsWebhookUrl ?? null,
      alertsEnabled: body.data.alertsEnabled,
      alertMinSeverity: body.data.alertMinSeverity ?? "high",
      scoreChangesEnabled: body.data.scoreChangesEnabled,
      weeklyDigestEnabled: body.data.weeklyDigestEnabled,
      weeklyDigestDay: body.data.weeklyDigestDay ?? "monday",
    })
    .where(eq(usersTable.id, req.user.id))
    .returning();

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(UpdateNotificationPreferencesResponse.parse({
    teamsEnabled: user.teamsEnabled,
    teamsWebhookUrl: user.teamsWebhookUrl ?? null,
    alertsEnabled: user.alertsEnabled,
    alertMinSeverity: user.alertMinSeverity,
    scoreChangesEnabled: user.scoreChangesEnabled,
    weeklyDigestEnabled: user.weeklyDigestEnabled,
    weeklyDigestDay: user.weeklyDigestDay,
  }));
});

export default router;
