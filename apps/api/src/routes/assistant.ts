import { Router, type IRouter } from "express";
import { db, assistantMessagesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import {
  SendAssistantMessageBody,
  SendAssistantMessageResponse,
  GetAssistantHistoryQueryParams,
  GetAssistantHistoryResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const ASSISTANT_RESPONSES: Record<string, string[]> = {
  general: [
    "Your overall security posture is currently at 78/100. The main areas for improvement are completing your pending security training modules and ensuring all your devices maintain compliance.",
    "Based on your current CyberScore, I recommend focusing on the two overdue mandatory training modules first — they contribute 15 points to your score.",
    "I can see 3 active high-severity alerts that need your attention. Would you like me to walk you through the remediation steps for each one?",
  ],
  alerts: [
    "You currently have 2 critical and 5 high-severity alerts active. The critical alerts relate to suspicious sign-in activity from an unrecognised location.",
    "The most urgent alert is the MFA bypass attempt detected 2 hours ago. I recommend reviewing your recent sign-in logs in Entra ID immediately.",
    "I've analysed your active alerts — 3 of them share the same root cause and can be resolved together. Shall I show you the remediation steps?",
  ],
  devices: [
    "You have 1 non-compliant device — your laptop is missing the latest security patch. This is reducing your device compliance score by 15 points.",
    "All mobile devices are compliant. The primary compliance issue is with Windows devices that haven't synced with Intune in the last 7 days.",
    "Your device compliance rate is 87%. To reach 100%, 3 devices need OS updates and 1 device needs BitLocker encryption enabled.",
  ],
  training: [
    "You have 2 mandatory training modules overdue. Completing them would improve your CyberScore by 18 points and bring your training score to 85.",
    "Your training streak is 3 days. Keep going — completing one module per day this week will put you in the top 10% of your department.",
    "The Phishing Awareness module is most relevant to your current alert history. It takes 20 minutes and contributes 10 points to your score.",
  ],
  score: [
    "Your CyberScore of 78 breaks down as: Identity Security 82, Device Compliance 75, Training Progress 68, Risk Exposure 71. Training is your lowest component.",
    "Your score has improved by 4 points over the last 30 days. At this rate, you'll reach an A grade in approximately 6 weeks.",
    "To reach a score of 85 this month, focus on: completing 2 training modules (+12pts), resolving the non-compliant device (+8pts), and dismissing the low-severity Pentera findings (+5pts).",
  ],
};

function getAssistantResponse(context: string | undefined, message: string): string {
  const ctx = context ?? "general";
  const responses = ASSISTANT_RESPONSES[ctx] ?? ASSISTANT_RESPONSES.general;

  // Simple keyword matching for more relevant responses
  const lowerMsg = message.toLowerCase();
  if (lowerMsg.includes("score") || lowerMsg.includes("cyberscore")) {
    return ASSISTANT_RESPONSES.score[Math.floor(Math.random() * ASSISTANT_RESPONSES.score.length)];
  }
  if (lowerMsg.includes("alert") || lowerMsg.includes("threat")) {
    return ASSISTANT_RESPONSES.alerts[Math.floor(Math.random() * ASSISTANT_RESPONSES.alerts.length)];
  }
  if (lowerMsg.includes("device") || lowerMsg.includes("complian")) {
    return ASSISTANT_RESPONSES.devices[Math.floor(Math.random() * ASSISTANT_RESPONSES.devices.length)];
  }
  if (lowerMsg.includes("train") || lowerMsg.includes("learn") || lowerMsg.includes("module")) {
    return ASSISTANT_RESPONSES.training[Math.floor(Math.random() * ASSISTANT_RESPONSES.training.length)];
  }

  return responses[Math.floor(Math.random() * responses.length)];
}

router.post("/assistant/chat", async (req, res): Promise<void> => {
  const body = SendAssistantMessageBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const userMsgId = randomUUID();
  const assistantMsgId = randomUUID();
  const now = new Date();

  await db.insert(assistantMessagesTable).values({
    id: userMsgId,
    userId: req.user.id,
    role: "user",
    content: body.data.message,
  });

  const responseText = getAssistantResponse(body.data.context, body.data.message);

  const [assistantMsg] = await db.insert(assistantMessagesTable).values({
    id: assistantMsgId,
    userId: req.user.id,
    role: "assistant",
    content: responseText,
  }).returning();

  const suggestedActions: string[] = [];
  const ctx = body.data.context ?? "general";
  if (ctx === "alerts" || body.data.message.toLowerCase().includes("alert")) {
    suggestedActions.push("View active alerts", "Show critical alerts only", "Resolve all low-severity alerts");
  } else if (ctx === "training" || body.data.message.toLowerCase().includes("train")) {
    suggestedActions.push("Show overdue modules", "Start Phishing Awareness module", "View leaderboard");
  } else if (ctx === "devices") {
    suggestedActions.push("Show non-compliant devices", "View compliance report", "Check encryption status");
  } else {
    suggestedActions.push("Explain my CyberScore", "Show active threats", "What should I do next?");
  }

  res.json(SendAssistantMessageResponse.parse({
    message: {
      id: assistantMsg.id,
      role: "assistant",
      content: assistantMsg.content,
      createdAt: assistantMsg.createdAt.toISOString(),
    },
    suggestedActions,
  }));
});

router.get("/assistant/history", async (req, res): Promise<void> => {
  const params = GetAssistantHistoryQueryParams.safeParse(req.query);
  const limit = params.success ? (params.data.limit ?? 20) : 20;

  const messages = await db
    .select()
    .from(assistantMessagesTable)
    .where(eq(assistantMessagesTable.userId, req.user.id))
    .orderBy(desc(assistantMessagesTable.createdAt))
    .limit(limit);

  res.json(GetAssistantHistoryResponse.parse(
    messages.reverse().map(m => ({
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    }))
  ));
});

export default router;
