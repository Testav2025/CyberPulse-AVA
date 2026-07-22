import { Badge } from "@/components/ui/badge";

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'informational';
export type AlertStatus = 'active' | 'resolved' | 'dismissed';

export function SeverityBadge({ severity }: { severity: string }) {
  const styles = {
    critical: "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20",
    high: "bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20",
    medium: "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20",
    low: "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20",
    informational: "bg-slate-500/10 text-slate-500 border-slate-500/20 hover:bg-slate-500/20",
  }[severity.toLowerCase()] || "bg-slate-500/10 text-slate-500 border-slate-500/20";

  return (
    <Badge variant="outline" className={`capitalize font-medium ${styles}`}>
      {severity}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles = {
    active: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    resolved: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    dismissed: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  }[status.toLowerCase()] || "bg-slate-500/10 text-slate-500 border-slate-500/20";

  return (
    <Badge variant="outline" className={`capitalize font-medium ${styles}`}>
      {status}
    </Badge>
  );
}

export function ComplianceBadge({ state }: { state: string }) {
  const styles = {
    compliant: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    noncompliant: "bg-red-500/10 text-red-500 border-red-500/20",
    unknown: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    ingraceperiod: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  }[state.toLowerCase()] || "bg-slate-500/10 text-slate-500 border-slate-500/20";

  // format camelCase to readable
  const displayState = state === 'inGracePeriod' ? 'In Grace Period' : state;

  return (
    <Badge variant="outline" className={`capitalize font-medium ${styles}`}>
      {displayState}
    </Badge>
  );
}
