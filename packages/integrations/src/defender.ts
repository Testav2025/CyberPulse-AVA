import { getGraphClient } from "./graph-client";

export interface DefenderAlert {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  createdDateTime: string;
}

export async function getUserAlerts(userPrincipalName: string): Promise<DefenderAlert[]> {
  const client = getGraphClient();
  try {
    // Note: Defender API endpoints might differ based on exact license. 
    // This uses the unified security API.
    const response = await client.api(`/security/alerts_v2?$filter=userPrincipalName eq '${userPrincipalName}'`).get();
    if (!response || !response.value) return [];
    
    return response.value.map((alert: any) => ({
      id: alert.id,
      title: alert.title,
      description: alert.description,
      severity: alert.severity,
      status: alert.status,
      createdDateTime: alert.createdDateTime,
    }));
  } catch (error) {
    console.error("Failed to fetch Defender alerts", error);
    return [];
  }
}
