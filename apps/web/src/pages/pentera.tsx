import { useState } from "react";
import { useGetCurrentUser, useGetPenteraSummary, useGetPenteraFindings } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import {
  Wrench,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { getViewTier, canSeeAdvancedData } from "@/lib/role-utils";

function priorityLabel(severity: string): { label: string; color: string; bg: string } {
  switch (severity) {
    case 'critical': return { label: 'Urgent Fix Needed', color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' };
    case 'high':     return { label: 'High Priority Fix', color: 'text-orange-500', bg: 'bg-orange-500/10 border-orange-500/20' };
    case 'medium':   return { label: 'Should Be Fixed', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' };
    case 'low':      return { label: 'Low Priority', color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' };
    default:         return { label: severity, color: 'text-muted-foreground', bg: 'bg-muted' };
  }
}

/** Friendly plain-English title for a technical finding */
function friendlyTitle(title: string, category: string): string {
  const map: Record<string, string> = {
    'Remote Code Execution':  'A system can be taken over remotely',
    'Credential Theft':       'Passwords could be stolen',
    'Exposed Services':       'A service is open to the internet unsafely',
    'Default Credentials':    'Equipment using factory passwords',
    'Web Application':        'A website has a security weakness',
    'Cryptography':           'Outdated encryption in use',
    'Network Spoofing':       'Network can be impersonated',
    'Information Disclosure': 'Sensitive information could be exposed',
    'Privilege Escalation':   'An attacker could gain admin access',
  };
  return map[category] || title;
}

export default function Pentera() {
  const { data: user } = useGetCurrentUser();
  const { data: summary, isLoading: isLoadingSummary } = useGetPenteraSummary();
  const { data: findings, isLoading: isLoadingFindings } = useGetPenteraFindings({ limit: 15 });

  const tier = getViewTier(user?.role, user?.jobTitle);
  const [advancedView, setAdvancedView] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const showAdvanced = canSeeAdvancedData(tier) && advancedView;

  const total = summary?.totalFindings || 1;

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-rose-500/20 rounded-lg border border-rose-500/30">
              <Wrench className="h-6 w-6 text-rose-500" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Security Improvements</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Our security team regularly tests our defences to find weaknesses before attackers do.
            Here are the improvements identified from the latest test.
          </p>
        </div>

        {canSeeAdvancedData(tier) && (
          <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-2 rounded-lg flex-shrink-0">
            <Label htmlFor="pentera-advanced" className="text-xs font-medium cursor-pointer">
              {showAdvanced ? <Eye className="h-3.5 w-3.5 inline mr-1.5" /> : <EyeOff className="h-3.5 w-3.5 inline mr-1.5" />}
              Advanced View
            </Label>
            <Switch
              id="pentera-advanced"
              checked={advancedView}
              onCheckedChange={setAdvancedView}
              className="scale-90"
            />
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className={`${(summary?.criticalFindings || 0) > 0 ? 'border-red-500/30 bg-red-500/5' : 'border-emerald-500/30 bg-emerald-500/5'}`}>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              {(summary?.criticalFindings || 0) > 0 ? (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              ) : (
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
              )}
              <p className="text-sm font-medium">Urgent Fixes</p>
            </div>
            {isLoadingSummary ? <Skeleton className="h-8 w-16" /> : (
              <>
                <p className="text-3xl font-bold">{summary?.criticalFindings || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Require immediate attention</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-muted-foreground mb-2">High Priority</p>
            {isLoadingSummary ? <Skeleton className="h-8 w-16" /> : (
              <>
                <p className="text-3xl font-bold text-orange-500">{summary?.highFindings || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Should be fixed soon</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-muted-foreground mb-2">Fixed Since Last Test</p>
            {isLoadingSummary ? <Skeleton className="h-8 w-16" /> : (
              <>
                <p className="text-3xl font-bold text-emerald-500">{summary?.remediatedSinceLastScan || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Improvements made</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-muted-foreground mb-2">Last Test</p>
            {isLoadingSummary ? <Skeleton className="h-8 w-24" /> : (
              <>
                <p className="text-xl font-bold">{summary ? format(new Date(summary.lastAssessment), "MMM d") : '—'}</p>
                <p className="text-xs text-muted-foreground mt-1">Automated security test</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Breakdown bar */}
      {summary && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Breakdown by Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Urgent', count: summary.criticalFindings, color: 'bg-red-500', textColor: 'text-red-500' },
                { label: 'High Priority', count: summary.highFindings, color: 'bg-orange-500', textColor: 'text-orange-500' },
                { label: 'Should Be Fixed', count: summary.mediumFindings, color: 'bg-amber-500', textColor: 'text-amber-500' },
                { label: 'Low Priority', count: summary.lowFindings, color: 'bg-blue-500', textColor: 'text-blue-500' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-4">
                  <div className={`w-32 text-sm font-medium ${item.textColor}`}>
                    {item.label} ({item.count})
                  </div>
                  <div className="flex-1">
                    <Progress
                      value={(item.count / total) * 100}
                      indicatorClassName={item.color}
                      className="h-3"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Findings list */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle>{showAdvanced ? 'Validated Attack Vectors' : 'Security Improvements Needed'}</CardTitle>
          <CardDescription>
            {showAdvanced
              ? 'Vulnerabilities confirmed by automated penetration testing with CVSS scores'
              : 'Issues found during the latest security test, listed by priority'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {isLoadingFindings ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 flex gap-4">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))
            ) : findings && findings.length > 0 ? (
              findings.map((finding) => {
                const priority = priorityLabel(finding.severity);
                const isExpanded = expandedId === finding.id;
                return (
                  <div
                    key={finding.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <button
                      className="w-full p-4 text-left flex flex-col md:flex-row gap-3 md:items-start"
                      onClick={() => setExpandedId(isExpanded ? null : finding.id)}
                    >
                      <div className={`flex-shrink-0 mt-0.5 px-2 py-1 rounded border text-xs font-semibold ${priority.color} ${priority.bg}`}>
                        {priority.label}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm">
                          {showAdvanced ? finding.title : friendlyTitle(finding.title, finding.category)}
                        </h4>
                        {showAdvanced && (
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="font-mono text-xs">
                              CVSS {finding.cvssScore?.toFixed(1)}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">{finding.category}</Badge>
                            <Badge variant="outline" className={`text-xs ${
                              finding.status === 'remediated' ? 'text-emerald-500 border-emerald-500/30' : ''
                            }`}>
                              {finding.status === 'remediated' ? 'Fixed' : 'Open'}
                            </Badge>
                          </div>
                        )}
                        {!showAdvanced && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {finding.status === 'remediated' ? '✓ Fixed' : 'Needs attention'} · {finding.category}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-muted-foreground">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-3 border-t border-border/50 bg-muted/10 pt-3">
                        <p className="text-sm text-muted-foreground">
                          {showAdvanced ? finding.description : `Our security test found that ${friendlyTitle(finding.title, finding.category).toLowerCase()}. This is a ${priorityLabel(finding.severity).label.toLowerCase()} issue.`}
                        </p>
                        {finding.remediationGuidance && (
                          <div className="bg-primary/8 border border-primary/20 p-3 rounded-lg text-sm">
                            <p className="font-semibold text-xs uppercase tracking-wider text-primary mb-1">
                              {showAdvanced ? 'Remediation Guidance' : 'How to fix it'}
                            </p>
                            <p className="text-muted-foreground text-xs leading-relaxed">
                              {showAdvanced
                                ? finding.remediationGuidance
                                : 'The IT Security team will handle this fix. If you need to take action, they will contact you directly.'}
                            </p>
                          </div>
                        )}
                        {showAdvanced && finding.affectedSystem && (
                          <p className="text-xs text-muted-foreground">
                            <strong>Affected:</strong> {finding.affectedSystem}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <ShieldCheck className="h-10 w-10 mx-auto mb-2 text-emerald-500 opacity-60" />
                <p>No security improvements found.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Integration Placeholder */}
      <Card className="border-dashed border-rose-500/30 bg-rose-500/5">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-rose-400 mb-1">Integration Ready</p>
          <p className="text-xs text-muted-foreground">
            This page connects to <strong>Pentera</strong> for automated penetration test results.
            Configure the Pentera API key in your environment settings to pull live assessment data.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
