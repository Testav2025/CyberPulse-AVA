import { useState } from "react";
import { useGetDevices, useGetComplianceSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import {
  Search,
  Laptop,
  Smartphone,
  Monitor,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Server,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";

function ComplianceLabel({ state }: { state: string }) {
  switch (state) {
    case "compliant":
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
          <CheckCircle2 className="h-3.5 w-3.5" /> Protected
        </span>
      );
    case "noncompliant":
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500">
          <ShieldX className="h-3.5 w-3.5" /> Needs Attention
        </span>
      );
    case "inGracePeriod":
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-500">
          <Clock className="h-3.5 w-3.5" /> Update Pending
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <AlertTriangle className="h-3.5 w-3.5" /> Unknown
        </span>
      );
  }
}

function FriendlyReason(reason: string): string {
  const map: Record<string, string> = {
    "OS patch KB5034441 not installed": "A security update needs to be installed",
    "BitLocker not enabled": "Your files are not encrypted",
    "OS patch overdue": "Security updates are overdue",
    "BitLocker not enabled|OS patch overdue": "Files not encrypted and updates overdue",
    "Antivirus definitions outdated": "Antivirus needs to be updated",
    "iOS version below minimum": "Your phone software needs updating",
    "Passcode not set": "No screen lock passcode set",
    "OS version unsupported": "Your operating system is no longer supported",
    "OS version unsupported|BitLocker not enabled|Firewall disabled": "Multiple security issues found",
  };
  return map[reason] || reason.split("|").join(", ");
}

export default function Devices() {
  const [searchTerm, setSearchTerm] = useState("");
  const [complianceFilter, setComplianceFilter] = useState<string>("all");

  const { data: summary, isLoading: isLoadingSummary } = useGetComplianceSummary();
  const { data: devices, isLoading: isLoadingDevices } = useGetDevices({
    complianceState: complianceFilter !== "all" ? (complianceFilter as any) : undefined,
  });

  const filteredDevices = devices?.filter(
    (device) =>
      device.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (device.userDisplayName && device.userDisplayName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getPlatformIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes("windows")) return <Laptop className="h-4 w-4 text-blue-400" />;
    if (p.includes("mac")) return <Monitor className="h-4 w-4 text-slate-400" />;
    if (p.includes("ios") || p.includes("android")) return <Smartphone className="h-4 w-4 text-green-400" />;
    return <Server className="h-4 w-4 text-muted-foreground" />;
  };

  const friendlyPlatform = (platform: string, osVersion: string) => {
    if (platform.toLowerCase().includes("windows")) return `Windows PC — ${osVersion}`;
    if (platform.toLowerCase().includes("mac")) return `Mac — ${osVersion}`;
    if (platform.toLowerCase() === "ios") return `iPhone / iPad — ${osVersion}`;
    if (platform.toLowerCase() === "android") return `Android Phone — ${osVersion}`;
    return `${platform} — ${osVersion}`;
  };

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">My Devices</h1>
          <p className="text-muted-foreground">
            All the devices registered to your account. We keep them secure and up to date automatically.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <Monitor className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">All Devices</p>
              {isLoadingSummary ? (
                <Skeleton className="h-8 w-10" />
              ) : (
                <p className="text-2xl font-bold">{summary?.total || 0}</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/20">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Protected</p>
              {isLoadingSummary ? (
                <Skeleton className="h-8 w-10" />
              ) : (
                <p className="text-2xl font-bold text-emerald-500">{summary?.compliant || 0}</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-500/20">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-red-500/10 text-red-500 rounded-xl">
              <ShieldX className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Needs Attention</p>
              {isLoadingSummary ? (
                <Skeleton className="h-8 w-10" />
              ) : (
                <p className="text-2xl font-bold text-red-500">{summary?.noncompliant || 0}</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/20">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Update Pending</p>
              {isLoadingSummary ? (
                <Skeleton className="h-8 w-10" />
              ) : (
                <p className="text-2xl font-bold text-amber-500">{summary?.inGracePeriod || 0}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device List */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base">Your Registered Devices</CardTitle>
              <CardDescription>Devices managed and protected by your organisation</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search devices..."
                  className="pl-9 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={complianceFilter} onValueChange={setComplianceFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Devices</SelectItem>
                  <SelectItem value="compliant">Protected</SelectItem>
                  <SelectItem value="noncompliant">Needs Attention</SelectItem>
                  <SelectItem value="inGracePeriod">Update Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isLoadingDevices ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 border rounded-xl flex gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))
            ) : filteredDevices && filteredDevices.length > 0 ? (
              filteredDevices.map((device) => (
                <div
                  key={device.id}
                  className={`p-4 border rounded-xl transition-all hover:bg-muted/30 ${
                    device.complianceState === "noncompliant"
                      ? "border-red-500/20 bg-red-500/5"
                      : device.complianceState === "inGracePeriod"
                      ? "border-amber-500/20 bg-amber-500/5"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-muted rounded-lg flex-shrink-0 mt-0.5">
                        {getPlatformIcon(device.platform)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm">{device.deviceName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {friendlyPlatform(device.platform, device.osVersion || "")}
                        </p>
                        {device.complianceState === "noncompliant" && device.nonComplianceReasons && (
                          <p className="text-xs text-red-500 mt-1.5 flex items-start gap-1">
                            <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            {FriendlyReason(device.nonComplianceReasons.join("|"))}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 ml-11 sm:ml-0">
                      <ComplianceLabel state={device.complianceState} />

                      <div className="flex gap-2">
                        <ControlChip enabled={device.encryptionEnabled} label="Files Encrypted" />
                        <ControlChip enabled={device.antivirusEnabled} label="Virus Protection" />
                        <ControlChip enabled={device.firewallEnabled} label="Firewall" />
                      </div>

                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Checked {formatDistanceToNow(new Date(device.lastSyncDateTime), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 border rounded-xl border-dashed">
                <Monitor className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" />
                <p className="text-muted-foreground text-sm">No devices match your filter.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Integration placeholder */}
      <Card className="border-dashed border-primary/30 bg-primary/5">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-primary mb-1">Integration Ready</p>
          <p className="text-xs text-muted-foreground">
            Device data is managed by <strong>Microsoft Intune</strong>. 
            Connect your Intune tenant via Microsoft Graph to show live device status and compliance data.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function ControlChip({ enabled, label }: { enabled?: boolean; label: string }) {
  if (enabled === undefined) return null;
  return (
    <div
      title={`${label}: ${enabled ? "On" : "Off"}`}
      className={`h-5 px-1.5 rounded flex items-center gap-0.5 text-[10px] font-medium border ${
        enabled
          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
          : "bg-red-500/10 border-red-500/20 text-red-500"
      }`}
    >
      {enabled ? <CheckCircle2 className="h-2.5 w-2.5" /> : <XCircle className="h-2.5 w-2.5" />}
    </div>
  );
}
