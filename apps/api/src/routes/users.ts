import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  GetCurrentUserResponse,
  UpdateCurrentUserBody,
  UpdateCurrentUserResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();


router.get("/users/me", async (req, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user.id));

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(GetCurrentUserResponse.parse({
    ...user,
    avatarUrl: user.avatarUrl ?? null,
    jobTitle: user.jobTitle ?? null,
    teamsWebhookUrl: user.teamsWebhookUrl ?? null,
    createdAt: user.createdAt.toISOString(),
  }));
});

router.patch("/users/me", async (req, res): Promise<void> => {
  const parsed = UpdateCurrentUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [user] = await db
    .update(usersTable)
    .set(parsed.data)
    .where(eq(usersTable.id, req.user.id))
    .returning();

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(UpdateCurrentUserResponse.parse({
    ...user,
    avatarUrl: user.avatarUrl ?? null,
    jobTitle: user.jobTitle ?? null,
    teamsWebhookUrl: user.teamsWebhookUrl ?? null,
    createdAt: user.createdAt.toISOString(),
  }));
});

export default router;
