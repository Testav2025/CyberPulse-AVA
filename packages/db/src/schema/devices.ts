import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const devicesTable = pgTable("devices", {
  id: text("id").primaryKey(),
  deviceName: text("device_name").notNull(),
  platform: text("platform").notNull(),
  osVersion: text("os_version").notNull(),
  complianceState: text("compliance_state").notNull().default("unknown"),
  lastSyncDateTime: timestamp("last_sync_datetime", { withTimezone: true }).notNull().defaultNow(),
  userId: text("user_id").notNull(),
  userDisplayName: text("user_display_name").notNull(),
  userEmail: text("user_email").notNull(),
  managedBy: text("managed_by").notNull().default("Intune"),
  encryptionEnabled: boolean("encryption_enabled").notNull().default(false),
  firewallEnabled: boolean("firewall_enabled").notNull().default(false),
  antivirusEnabled: boolean("antivirus_enabled").notNull().default(false),
  osUpdateStatus: text("os_update_status").notNull().default("unknown"),
  nonComplianceReasons: text("non_compliance_reasons"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDeviceSchema = createInsertSchema(devicesTable).omit({ createdAt: true });
export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type Device = typeof devicesTable.$inferSelect;
