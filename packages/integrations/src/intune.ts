import { getGraphClient } from "./graph-client";

export interface IntuneDevice {
  id: string;
  deviceName: string;
  operatingSystem: string;
  osVersion: string;
  complianceState: string;
  lastSyncDateTime: string;
  isEncrypted: boolean;
}

export async function getUserDevices(userId: string): Promise<IntuneDevice[]> {
  const client = getGraphClient();
  try {
    const response = await client.api(`/users/${userId}/managedDevices`).get();
    if (!response || !response.value) return [];
    
    return response.value.map((device: any) => ({
      id: device.id,
      deviceName: device.deviceName,
      operatingSystem: device.operatingSystem,
      osVersion: device.osVersion,
      complianceState: device.complianceState,
      lastSyncDateTime: device.lastSyncDateTime,
      isEncrypted: device.isEncrypted ?? true, // Mock default
    }));
  } catch (error) {
    console.error("Failed to fetch Intune devices", error);
    return [];
  }
}
