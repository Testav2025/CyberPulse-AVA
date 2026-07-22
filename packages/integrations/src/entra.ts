import { getGraphClient } from "./graph-client";

export interface EntraUserProfile {
  id: string;
  displayName: string;
  userPrincipalName: string;
  jobTitle?: string;
  department?: string;
}

export async function getUserProfile(userId: string): Promise<EntraUserProfile | null> {
  const client = getGraphClient();
  try {
    const user = await client.api(`/users/${userId}`).get();
    if (!user) return null;
    return {
      id: user.id,
      displayName: user.displayName,
      userPrincipalName: user.userPrincipalName,
      jobTitle: user.jobTitle,
      department: user.department,
    };
  } catch (error) {
    console.error("Failed to fetch Entra user profile", error);
    return null;
  }
}
