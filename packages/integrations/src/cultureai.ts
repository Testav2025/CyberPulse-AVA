// CultureAI Integration Fallback/Connector

export interface CultureAIMetrics {
  phishingPassRate: number;
  reportedEmails: number;
  trainingEngagement: number;
}

export async function getUserBehaviorMetrics(userEmail: string): Promise<CultureAIMetrics> {
  const isLive = process.env.LIVE_INTEGRATIONS === "true";
  if (!isLive) {
    console.warn("[CultureAI] Mocking behavior metrics for", userEmail);
    return {
      phishingPassRate: 100,
      reportedEmails: 0,
      trainingEngagement: 100,
    };
  }

  // TODO: Add real CultureAI API implementation using CULTUREAI_BASE_URL and Key
  console.warn("Real CultureAI requested but not configured yet. Returning mocks.");
  return {
    phishingPassRate: 100,
    reportedEmails: 0,
    trainingEngagement: 100,
  };
}
