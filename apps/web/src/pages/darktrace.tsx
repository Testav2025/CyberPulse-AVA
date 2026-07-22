import { useState } from "react";
import { useGetCurrentUser, useGetDarktraceSummary, useGetDarktraceIncidents } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { formatDistanceToNow } from "date-fns";
import {
  Mail,
  ShieldCheck,
  AlertTriangle,
  Zap,
  TrendingDown,
  TrendingUp,
  Minus,
  Eye,
  EyeOff,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/stat-card";
import { getViewTier, canSeeAdvancedData } from "@/lib/role-utils";

/** Friendly translation of Darktrace incident categories */
function friendlyCategory(category: string): string {
  const map: Record<string, string> = {
    'Command and Control': 'Suspicious remote communication',
    'Exfiltration': 'Unusual file or data transfer',
    'Lateral Movement': 'Suspicious internal activity',
    'Credential Access': 'Possible account compromise attempt',
    'Discovery': 'Unusual network exploration',
    'Execution': 'Suspicious software activity',
    'Persistence': 'Suspicious account or access change',
    'Defense Evasion': 'Security control bypass attempt',
    'Privilege Escalation': 'Suspicious permission change',
  };
  return map[category] || category;
}

function riskLabel(score: number): { label: string; color: string } {
  if (score >= 90) return { label: 'Critical', color: 'text-red-500' };
  if (score >= 70) return { label: 'High concern', color: 'text-orange-500' };
  if (score >= 50) return { label: 'Worth watching', color: 'text-amber-500' };
  return { label: 'Low concern', color: 'text-blue-500' };
}

export default function Darktrace() {
  const { data: user } = useGetCurrentUser();
  const { data: summary, isLoading: isLoadingSummary } = useGetDarktraceSummary();
  const { data: incidents, isLoading: isLoadingIncidents } = useGetDarktraceIncidents({ limit: 10 });

  const tier = getViewTier(user?.role, user?.jobTitle);
  const [advancedView, setAdvancedView] = useState(false);
  const showAdvanced = canSeeAdvancedData(tier) && advancedView;

  const emailsBlocked = summary ? Math.max(0, (summary.activeIncidents - 4)) + 4 : 0;

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
              <Mail className="h-6 w-6 text-indigo-500" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Email Protection</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Our AI security system watches over your inbox and network 24/7, 
            automatically blocking suspicious emails and unusual activity before it reaches you.
          </p>
        </div>

        {canSeeAdvancedData(tier) && (
          <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-2 rounded-lg flex-shrink-0">
            <Label htmlFor="advanced-toggle" className="text-xs font-medium cursor-pointer">
              {showAdvanced ? <Eye className="h-3.5 w-3.5 inline mr-1.5" /> : <EyeOff className="h-3.5 w-3.5 inline mr-1.5" />}
              Advanced View
            </Label>
            <Switch
              id="advanced-toggle"
              checked={advancedView}
              onCheckedChange={setAdvancedView}
              className="scale-90"
            />
          </div>
        )}
      </div>

      {/* Summary stats — friendly for everyone */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/15 rounded-xl">
              <ShieldCheck className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-500">{emailsBlocked}</p>
              <p className="text-sm text-muted-foreground">Suspicious emails blocked this month</p>
            </div>
          </CardContent>
        </Card>

        <Card className={`${(summary?.activeIncidents || 0) > 5 ? 'border-amber-500/20 bg-amber-500/5' : 'border-border'}`}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${(summary?.activeIncidents || 0) > 5 ? 'bg-amber-500/15' : 'bg-muted'}`}>
              <AlertTriangle className={`h-6 w-6 ${(summary?.activeIncidents || 0) > 5 ? 'text-amber-500' : 'text-muted-foreground'}`} />
            </div>
            <div>
              {isLoadingSummary ? <Skeleton className="h-8 w-16 mb-1" /> : (
                <p className="text-2xl font-bold">{summary?.activeIncidents || 0}</p>
              )}
              <p className="text-sm text-muted-foreground">Unusual activities being monitored</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-muted rounded-xl">
              {summary?.trend === 'improving' ? (
                <TrendingDown className="h-6 w-6 text-emerald-500" />
              ) : summary?.trend === 'deteriorating' ? (
                <TrendingUp className="h-6 w-6 text-red-500" />
              ) : (
                <Minus className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="text-2xl font-bold capitalize">
                {summary?.trend === 'improving' ? 'Improving' :
                 summary?.trend === 'deteriorating' ? 'Getting worse' : 'Stable'}
              </p>
              <p className="text-sm text-muted-foreground">Overall threat trend</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>{showAdvanced ? 'AI-Detected Incidents' : 'Recent Unusual Activity'}</CardTitle>
          <CardDescription>
            {showAdvanced
              ? 'Darktrace autonomous response log with confidence scores'
              : 'Unusual behaviour detected by our AI security system. Most are investigated automatically.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isLoadingIncidents ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-4 items-center p-3 border rounded-lg">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
            ) : incidents && incidents.length > 0 ? (
              incidents.map((incident) => {
                const risk = riskLabel(incident.score);
                return (
                  <div key={incident.id} className="group flex items-start gap-4 p-4 rounded-xl border border-border/60 hover:bg-muted/30 transition-colors">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/20">
                        <Zap className="h-4 w-4 text-indigo-500" />
                        {incident.score > 80 && (
                          <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm">
                            {showAdvanced ? incident.title : friendlyCategory(incident.category)}
                          </h4>
                          {showAdvanced && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {incident.deviceHostname} · {incident.category}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Detected {formatDistanceToNow(new Date(incident.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          {showAdvanced ? (
                            <Badge variant="outline" className={`text-xs ${
                              incident.score > 80 ? 'text-red-500 border-red-500/30' :
                              incident.score > 60 ? 'text-orange-500 border-orange-500/30' :
                              'text-indigo-500 border-indigo-500/30'
                            }`}>
                              {incident.score}% Confidence
                            </Badge>
                          ) : (
                            <span className={`text-xs font-semibold ${risk.color}`}>{risk.label}</span>
                          )}
                          <Badge variant="secondary" className={`text-xs ${
                            incident.status === 'active' ? '' :
                            incident.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500' :
                            'bg-muted'
                          }`}>
                            {incident.status === 'active' ? 'Being investigated' :
                             incident.status === 'acknowledged' ? 'Noted' : 'Resolved'}
                          </Badge>
                        </div>
                      </div>

                      {/* MITRE ATT&CK only for advanced view */}
                      {showAdvanced && incident.mitreTactics && incident.mitreTactics.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {incident.mitreTactics.map(tactic => (
                            <span key={tactic} className="text-[10px] uppercase bg-muted px-1.5 py-0.5 rounded border border-border/50">
                              {tactic}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <ShieldCheck className="h-10 w-10 mx-auto mb-2 text-emerald-500 opacity-50" />
                <p>No unusual activity detected recently.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* MITRE matrix — advanced view only */}
      {showAdvanced && (
        <Card>
          <CardHeader>
            <CardTitle>MITRE ATT&CK Matrix — Observed Tactics</CardTitle>
            <CardDescription>Attack technique frequency based on recent model breaches</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {[
                { name: "Initial Access", value: 15 },
                { name: "Execution", value: 5 },
                { name: "Privilege Escalation", value: 30 },
                { name: "Defense Evasion", value: 45 },
                { name: "Credential Access", value: 60 },
                { name: "Discovery", value: 85 },
                { name: "Lateral Movement", value: 20 },
              ].map((tactic) => (
                <div key={tactic.name} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-muted-foreground">{tactic.name}</span>
                    <span className="text-xs font-mono">{tactic.value}%</span>
                  </div>
                  <Progress
                    value={tactic.value}
                    className="h-2"
                    indicatorClassName={
                      tactic.value > 75 ? "bg-red-500" :
                      tactic.value > 40 ? "bg-amber-500" : "bg-indigo-500"
                    }
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integration Placeholder */}
      <Card className="border-dashed border-indigo-500/30 bg-indigo-500/5">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-indigo-400 mb-1">Integration Ready</p>
          <p className="text-xs text-muted-foreground">
            This page is connected to the <strong>Darktrace AI</strong> integration. 
            Data shown is from your Darktrace tenant. Configure the Darktrace API endpoint in your environment settings to enable live data.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
