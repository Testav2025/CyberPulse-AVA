import { Router, type IRouter } from "express";
import { db, devicesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  GetDevicesResponse,
  GetDevicesQueryParams,
  GetDeviceParams,
  GetDeviceResponse,
  GetComplianceSummaryResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function mapDevice(d: typeof devicesTable.$inferSelect) {
  return {
    id: d.id,
    deviceName: d.deviceName,
    platform: d.platform,
    osVersion: d.osVersion,
    complianceState: d.complianceState,
    lastSyncDateTime: d.lastSyncDateTime.toISOString(),
    userId: d.userId,
    userDisplayName: d.userDisplayName,
    userEmail: d.userEmail,
    managedBy: d.managedBy,
    encryptionEnabled: d.encryptionEnabled,
    firewallEnabled: d.firewallEnabled,
    antivirusEnabled: d.antivirusEnabled,
    osUpdateStatus: d.osUpdateStatus,
    nonComplianceReasons: d.nonComplianceReasons
      ? d.nonComplianceReasons.split("|").filter(Boolean)
      : [],
  };
}

router.get("/devices", async (req, res): Promise<void> => {
  const params = GetDevicesQueryParams.safeParse(req.query);
  const { complianceState = "all", platform } = params.success ? params.data : {};

  let query = db.select().from(devicesTable);
  const filters = [];

  if (complianceState && complianceState !== "all") {
    filters.push(eq(devicesTable.complianceState, complianceState));
  }
  if (platform) {
    filters.push(eq(devicesTable.platform, platform));
  }

  const devices = filters.length > 0
    ? await db.select().from(devicesTable).where(and(...filters))
    : await query;

  res.json(GetDevicesResponse.parse(devices.map(mapDevice)));
});

router.get("/devices/compliance-summary", async (req, res): Promise<void> => {
  const all = await db.select().from(devicesTable);
  const compliant = all.filter(d => d.complianceState === "compliant").length;
  const noncompliant = all.filter(d => d.complianceState === "noncompliant").length;
  const unknown = all.filter(d => d.complianceState === "unknown").length;
  const inGracePeriod = all.filter(d => d.complianceState === "inGracePeriod").length;
  const total = all.length;
  const complianceRate = total > 0 ? Math.round((compliant / total) * 100) : 0;

  const platforms = [...new Set(all.map(d => d.platform))];
  const byPlatform = platforms.map(platform => {
    const pDevices = all.filter(d => d.platform === platform);
    return {
      platform,
      total: pDevices.length,
      compliant: pDevices.filter(d => d.complianceState === "compliant").length,
      noncompliant: pDevices.filter(d => d.complianceState === "noncompliant").length,
    };
  });

  res.json(GetComplianceSummaryResponse.parse({
    total,
    compliant,
    noncompliant,
    unknown,
    inGracePeriod,
    complianceRate,
    byPlatform,
  }));
});

router.get("/devices/:id", async (req, res): Promise<void> => {
  const params = GetDeviceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [device] = await db.select().from(devicesTable).where(eq(devicesTable.id, params.data.id));
  if (!device) {
    res.status(404).json({ error: "Device not found" });
    return;
  }

  res.json(GetDeviceResponse.parse(mapDevice(device)));
});

export default router;
