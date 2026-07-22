import { Client } from "@microsoft/microsoft-graph-client";
import "isomorphic-fetch";

// Fallback mock client for when integrations are disabled or credentials are not set
export class MockGraphClient {
  api(path: string) {
    return {
      get: async () => {
        console.warn(`[MockGraphClient] Mocking GET ${path}`);
        return null;
      },
      post: async (data: any) => {
        console.warn(`[MockGraphClient] Mocking POST ${path}`);
        return null;
      }
    };
  }
}

let sharedClient: Client | MockGraphClient | null = null;

export function getGraphClient(): Client | MockGraphClient {
  if (sharedClient) return sharedClient;

  const isLive = process.env.LIVE_INTEGRATIONS === "true";
  
  if (!isLive) {
    sharedClient = new MockGraphClient();
    return sharedClient;
  }

  // TODO: Add real authentication provider (e.g. ClientSecretCredential + TokenCredentialAuthenticationProvider)
  // when credentials are provided. For now, fall back to mock.
  console.warn("Real Graph Client requested, but credentials flow is not yet fully configured. Falling back to MockGraphClient.");
  sharedClient = new MockGraphClient();
  return sharedClient;
}
