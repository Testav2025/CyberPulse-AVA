import { useState } from "react";
import { useGetAlerts, useUpdateAlertStatus } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  Search,
  ShieldAlert,
  Info,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Activity,
  MonitorSmartphone,
  ShieldCheck,
  AlertTriangle,
  Bell,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { friendlySeverity } from "@/lib/role-utils";

function FriendlySeverityBadge({ severity }: { severity: string }) {
  const label = friendlySeverity(severity);
  const styles: Record<string, string> = {
    critical: "bg-red-500/15 text-red-500 border-red-500/30",
    high:     "bg-orange-500/15 text-orange-500 border-orange-500/30",
    medium:   "bg-amber-500/15 text-amber-500 border-amber-500/30",
    low:      "bg-blue-500/15 text-blue-500 border-blue-500/30",
    informational: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  };
  return (
    <Badge variant="outline" className={`text-xs ${styles[severity] || styles.informational}`}>
      {label}
    </Badge>
  );
}

function StatusPill({ status }: { status: string }) {
  if (status === 'active') return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-500">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" /> Open
    </span>
  );
  if (status === 'resolved') return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-500">
      <CheckCircle2 className="h-3 w-3" /> Resolved
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
      <XCircle className="h-3 w-3" /> Dismissed
    </span>
  );
}

export default function Alerts() {
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: alerts, isLoading } = useGetAlerts({
    severity: severityFilter !== "all" ? severityFilter as any : undefined,
    status: statusFilter !== "all" ? statusFilter as any : undefined,
  });

  const updateStatus = useUpdateAlertStatus();

  const handleUpdateStatus = (id: string, newStatus: 'resolved' | 'dismissed') => {
    const label = newStatus === 'resolved' ? 'resolved' : 'dismissed';
    updateStatus.mutate(
      { id, data: { status: newStatus, resolutionNote: `Marked as ${label} by user` } },
      {
        onSuccess: () => {
          toast({
            title: newStatus === 'resolved' ? 'Message resolved' : 'Message dismissed',
            description: "We've updated this security message for you.",
          });
          queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
          queryClient.invalidateQueries({ queryKey: ["/api/cyberscore/summary"] });
          setSelectedAlertId(null);
        },
      }
    );
  };

  const filteredAlerts = alerts?.filter(alert =>
    alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedAlert = alerts?.find(a => a.id === selectedAlertId);

  const dotColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-slate-500';
    }
  };

  const sourceLabel = (source: string) => {
    switch (source) {
      case 'entra': return 'Account Security';
      case 'defender': return 'Device Protection';
      case 'darktrace': return 'Email & Network';
      case 'intune': return 'Device Management';
      default: return 'Security System';
    }
  };

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Important Security Messages</h1>
          <p className="text-muted-foreground">
            These are security messages that may need your attention. Most are handled automatically — 
            but some may require a quick action from you.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="critical">Urgent</SelectItem>
                  <SelectItem value="high">Important</SelectItem>
                  <SelectItem value="medium">Moderate</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Messages</SelectItem>
                  <SelectItem value="active">Open</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <div className="flex justify-between mb-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-2/3 mb-3" />
                </div>
              ))
            ) : filteredAlerts && filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => setSelectedAlertId(alert.id)}
                  className={`p-4 border rounded-xl cursor-pointer transition-all hover-elevate ${
                    alert.status === 'active' ? 'bg-card hover:border-primary/40' : 'bg-muted/30 opacity-70'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`mt-2 w-2 h-2 rounded-full flex-shrink-0 ${dotColor(alert.severity)}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold text-sm">{alert.title}</h3>
                          {alert.status === 'active' && alert.severity === 'critical' && (
                            <Bell className="h-3.5 w-3.5 text-red-500 animate-pulse" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {alert.description || "No description provided."}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(alert.createdAt), "MMM d, h:mm a")}
                          </span>
                          <span className="text-border">•</span>
                          <span>{sourceLabel(alert.source)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row md:flex-col items-center md:items-end gap-2 min-w-fit ml-5 md:ml-0">
                      <FriendlySeverityBadge severity={alert.severity} />
                      <StatusPill status={alert.status} />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-14 border rounded-xl border-dashed">
                <div className="mx-auto w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-3">
                  <ShieldCheck className="h-6 w-6 text-emerald-500" />
                </div>
                <h3 className="text-base font-semibold mb-1">All clear!</h3>
                <p className="text-muted-foreground text-sm">
                  No security messages match your current filters.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detail Sheet */}
      <Sheet open={!!selectedAlertId} onOpenChange={(open) => !open && setSelectedAlertId(null)}>
        <SheetContent className="w-full sm:max-w-md md:max-w-lg overflow-y-auto">
          {selectedAlert && (
            <>
              <SheetHeader className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <FriendlySeverityBadge severity={selectedAlert.severity} />
                  <StatusPill status={selectedAlert.status} />
                </div>
                <SheetTitle className="text-xl leading-snug">{selectedAlert.title}</SheetTitle>
                <SheetDescription>
                  From <span className="font-semibold text-foreground">{sourceLabel(selectedAlert.source)}</span> on {format(new Date(selectedAlert.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold mb-2">What happened?</h4>
                  <div className="bg-muted/50 p-4 rounded-lg text-sm leading-relaxed">
                    {selectedAlert.description || "No detailed description available."}
                  </div>
                </div>

                {selectedAlert.remediationSteps && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                      <Info className="h-4 w-4 text-primary" /> What should I do?
                    </h4>
                    <div className="bg-primary/8 border border-primary/20 p-4 rounded-lg text-sm leading-relaxed">
                      {selectedAlert.remediationSteps}
                    </div>
                  </div>
                )}

                {selectedAlert.affectedEntity && (
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Affected</h4>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <MonitorSmartphone className="h-4 w-4" />
                      {selectedAlert.affectedEntity}
                    </p>
                  </div>
                )}
              </div>

              {selectedAlert.status === 'active' && (
                <div className="mt-8 pt-6 border-t flex gap-3">
                  <Button
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleUpdateStatus(selectedAlert.id, 'resolved')}
                    disabled={updateStatus.isPending}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Done
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleUpdateStatus(selectedAlert.id, 'dismissed')}
                    disabled={updateStatus.isPending}
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Not Relevant
                  </Button>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
