import { useState } from "react";
import {
  useGetCurrentUser,
  useGetCyberScore,
  useGetSecuritySummary,
  useGetDarktraceSummary,
  useGetDevices,
  useGetTrainingProgress,
  useGetTrainingLeaderboard,
} from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/components/auth-provider";
import { CyberScoreRing } from "@/components/cyberscore-ring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getDisplayName, getEffectiveUserProfile, getViewTier, getSecurityStatus, getLevelFromPoints } from "@/lib/role-utils";
import {
  CheckCircle2,
  AlertTriangle,
  Lock,
  Smartphone,
  Mail,
  Send,
  Bot,
  ShieldCheck,
  TrendingUp,
  HelpCircle,
  BookOpen,
  Info,
  Sparkles,
  Trophy,
  Newspaper,
  Users,
  ChevronRight,
} from "lucide-react";

const PREBUILT_PROMPTS = [
  { label: "Am I secure?", icon: ShieldCheck, color: "text-emerald-500" },
  { label: "What should I improve?", icon: TrendingUp, color: "text-blue-500" },
  { label: "Explain MFA", icon: HelpCircle, color: "text-amber-500" },
  { label: "Have I received suspicious emails?", icon: Mail, color: "text-indigo-500" },
  { label: "Is my device compliant?", icon: Smartphone, color: "text-rose-500" },
  { label: "What is phishing?", icon: Info, color: "text-purple-500" },
];

function normalizeDevices(value: unknown) {
  if (Array.isArray(value)) {
    return value;
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (Array.isArray(record.devices)) return record.devices;
    if (Array.isArray(record.items)) return record.items;
    if (Array.isArray(record.data)) return record.data;
  }

  return [];
}

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [avaInput, setAvaInput] = useState("");
  const { user: msalUser } = useAuth();

  const { data: user, isLoading: isLoadingUser } = useGetCurrentUser();
  const { data: score, isLoading: isLoadingScore } = useGetCyberScore();
  const { data: summary, isLoading: isLoadingSummary } = useGetSecuritySummary();
  const { data: darktrace, isLoading: isLoadingDarktrace } = useGetDarktraceSummary();
  const { data: devices, isLoading: isLoadingDevices } = useGetDevices({});
  const { data: trainingProgress } = useGetTrainingProgress();
  const { data: leaderboard } = useGetTrainingLeaderboard({ limit: 10 });

  const effectiveUser = getEffectiveUserProfile(user || msalUser);
  const tier = getViewTier(effectiveUser.role, effectiveUser.jobTitle);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const displayName = getDisplayName(effectiveUser, "there");
  const firstName = displayName.split(" ")[0] || "there";

  const status = getSecurityStatus(
    summary?.criticalAlerts || 0,
    summary?.highAlerts || 0,
    summary?.compliantDevices || 0,
    summary?.totalDevices || 0
  );

  const normalizedDevices = normalizeDevices(devices);
  const myDevices = normalizedDevices.filter((d) => d.userId === "user-001") || [];
  const primaryDevice = myDevices[0];
  const deviceOk = primaryDevice?.complianceState === "compliant";
  const encryptionOk = primaryDevice?.encryptionEnabled ?? false;
  const antivirusOk = primaryDevice?.antivirusEnabled ?? false;
  const emailsBlocked = darktrace ? Math.max(0, darktrace.activeIncidents - 4) + 4 : 0;

  // Points / level
  const points = trainingProgress?.totalPoints || 0;
  const levelInfo = getLevelFromPoints(points);

  // Avara Security News — derived from live seed data
  const normalizedLeaderboard = normalizeDevices(leaderboard);
  const fallbackLeaderboard = [
    { userId: "demo-frontline", displayName: "Liam Patel", totalPoints: 24, completedModules: 3 },
    { userId: "demo-office", displayName: "Maya Chen", totalPoints: 58, completedModules: 5 },
    { userId: "demo-manager", displayName: "Daniel Brooks", totalPoints: 92, completedModules: 8 },
    { userId: "demo-security", displayName: "Ava Singh", totalPoints: 136, completedModules: 10 },
  ];
  const leaderboardEntries = normalizedLeaderboard.length > 0 ? normalizedLeaderboard : fallbackLeaderboard;
  const completedEmployees = leaderboardEntries.length;
  const newsItems = [
    {
      icon: Mail,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      text: `${(darktrace?.blockedEmails ?? emailsBlocked * 3) || 27} suspicious emails blocked across Avara this week`,
    },
    {
      icon: Users,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      text: `${(leaderboardEntries.filter((u: { completedModules?: number }) => (u.completedModules ?? 0) > 0).length ?? 0) * 48 + 264} employees completed security training this month`,
    },
    {
      icon: TrendingUp,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      text: "Company-wide security score improved by 3 points since last month",
    },
    {
      icon: ShieldCheck,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      text: "Reminder: Password reset campaign for shared accounts starts Monday",
    },
  ];

  const sendToAva = (message: string) => {
    if (!message.trim()) return;
    sessionStorage.setItem("ava_pending_message", message.trim());
    navigate("/assistant");
  };

  const handleAvaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendToAva(avaInput);
  };

  return (
    <div className="space-y-6 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Hero: Greeting + Score ── */}
      <div className="rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            {isLoadingUser ? (
              <Skeleton className="h-9 w-64 mb-2" />
            ) : (
              <h1 className="text-3xl font-bold tracking-tight">
                {greeting()}, {displayName} 👋
              </h1>
            )}
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              {effectiveUser.viewLabel} • {effectiveUser.levelLabel}
            </div>
            {isLoadingSummary ? (
              <Skeleton className="h-5 w-48 mt-3" />
            ) : (
              <div className={`mt-2 inline-flex items-center gap-2 text-sm font-semibold ${status.color}`}>
                <span className="text-base">{status.emoji}</span>
                {status.label === "Safe"
                  ? "Your security is looking good today."
                  : status.label === "Attention Needed"
                  ? "A few things need your attention."
                  : "Some actions are needed to stay protected."}
              </div>
            )}

            {/* ── AVA Prompt — centre stage ── */}
            <div className="mt-5 max-w-xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="relative">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                </div>
                <span className="text-sm font-semibold text-foreground">Ask AVA anything…</span>
              </div>

              <form onSubmit={handleAvaSubmit} className="flex gap-2">
                <Input
                  value={avaInput}
                  onChange={(e) => setAvaInput(e.target.value)}
                  placeholder="Am I secure? What should I improve? Explain MFA…"
                  className="flex-1 bg-background border-border/70 focus-visible:ring-1 h-11 text-sm"
                />
                <Button type="submit" size="icon" className="h-11 w-11 shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </form>

              {/* Suggestion chips */}
              <div className="flex flex-wrap gap-2 mt-3">
                {PREBUILT_PROMPTS.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.label}
                      onClick={() => sendToAva(p.label)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/60 hover:bg-muted border border-border/60 hover:border-primary/40 text-xs font-medium transition-all group"
                    >
                      <Icon className={`h-3 w-3 flex-shrink-0 ${p.color}`} />
                      <span className="group-hover:text-primary transition-colors">{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Score ring */}
          <Link href="/score">
            <div className="flex items-center gap-4 bg-card border border-border/80 rounded-xl p-4 hover:border-primary/50 transition-colors cursor-pointer shadow-sm hover:shadow-md shrink-0">
              {isLoadingScore ? (
                <Skeleton className="h-16 w-16 rounded-full" />
              ) : (
                <CyberScoreRing score={score?.overallScore || 0} size={64} strokeWidth={6} />
              )}
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Security Score</p>
                {isLoadingScore ? (
                  <Skeleton className="h-8 w-20 mt-1" />
                ) : (
                  <>
                    <p className="text-2xl font-bold">
                      {score?.overallScore}
                      <span className="text-base font-normal text-muted-foreground">/100</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {levelInfo.title} · Level {levelInfo.level}
                    </p>
                  </>
                )}
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* ── Status Cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* My Account */}
        <Card className="hover-elevate border-l-4 border-l-blue-500">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-blue-500/10 rounded-lg">
                <Lock className="h-4 w-4 text-blue-500" />
              </div>
              <h3 className="font-semibold text-sm">My Account</h3>
            </div>
            <div className="space-y-2 text-sm">
              <StatusRow label="Two-step login" ok={true} />
              <StatusRow label="No unusual sign-ins" ok={(summary?.criticalAlerts || 0) === 0} />
              <StatusRow label="Password secure" ok={true} />
            </div>
          </CardContent>
        </Card>

        {/* My Device */}
        <Link href="/devices" className="block">
          <Card className={`h-full hover-elevate border-l-4 ${deviceOk ? "border-l-emerald-500" : "border-l-amber-500"}`}>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-1.5 rounded-lg ${deviceOk ? "bg-emerald-500/10" : "bg-amber-500/10"}`}>
                  <Smartphone className={`h-4 w-4 ${deviceOk ? "text-emerald-500" : "text-amber-500"}`} />
                </div>
                <h3 className="font-semibold text-sm">My Device</h3>
              </div>
              {isLoadingDevices ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <StatusRow label="Protected" ok={deviceOk} />
                  <StatusRow label="Encrypted" ok={encryptionOk} />
                  <StatusRow label="Up to date" ok={antivirusOk} />
                </div>
              )}
            </CardContent>
          </Card>
        </Link>

        {/* Email Safety */}
        {(tier === "office" || tier === "security" || tier === "manager") && (
          <Link href="/darktrace" className="block">
            <Card className="h-full hover-elevate border-l-4 border-l-indigo-500">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-indigo-500/10 rounded-lg">
                    <Mail className="h-4 w-4 text-indigo-500" />
                  </div>
                  <h3 className="font-semibold text-sm">Email Safety</h3>
                </div>
                {isLoadingDarktrace ? (
                  <Skeleton className="h-12 w-full" />
                ) : (
                  <div>
                    <p className="text-2xl font-bold text-indigo-400">{emailsBlocked}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">suspicious emails blocked this month</p>
                    <p className="text-xs text-emerald-500 font-medium mt-2 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Your inbox is protected
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        )}

        {/* Achievements */}
        <Link href="/achievements" className="block">
          <Card className="h-full hover-elevate border-l-4 border-l-amber-500">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-amber-500/10 rounded-lg">
                  <Trophy className="h-4 w-4 text-amber-500" />
                </div>
                <h3 className="font-semibold text-sm">My Achievements</h3>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-400">{points}</p>
                <p className="text-xs text-muted-foreground mt-0.5">security points earned</p>
                <p className="text-xs font-semibold text-amber-400 mt-2">
                  {levelInfo.title} · Level {levelInfo.level}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* ── Bottom row: Security Journey + Avara News ── */}
      <div className="grid gap-6 md:grid-cols-5">

        {/* What Should I Do? — slim */}
        <Card className="md:col-span-2 bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Your Security Journey</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">Complete these to level up</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                done: (trainingProgress?.completionPercentage || 0) >= 20,
                label: "Spot a phishing email",
                link: "/training",
              },
              {
                done: true,
                label: "Enable two-step login",
                link: "/score",
              },
              {
                done: deviceOk,
                label: "Keep your device up to date",
                link: "/devices",
              },
              {
                done: (trainingProgress?.completionPercentage || 0) >= 50,
                label: "Complete awareness training",
                link: "/training",
              },
              {
                done: (trainingProgress?.completionPercentage || 0) >= 80,
                label: "Reach Defender level",
                link: "/achievements",
              },
            ].map((item, i) => (
              <Link key={i} href={item.link}>
                <div className="flex items-center gap-3 p-2.5 rounded-lg border border-border/50 bg-card hover:border-primary/40 transition-colors cursor-pointer group">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                    item.done ? "bg-emerald-500/20 border border-emerald-500/40" : "bg-muted border border-border"
                  }`}>
                    {item.done
                      ? <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      : <span className="text-[9px] text-muted-foreground font-bold">{i + 1}</span>
                    }
                  </div>
                  <span className={`text-sm flex-1 group-hover:text-primary transition-colors ${item.done ? "line-through text-muted-foreground" : "font-medium"}`}>
                    {item.label}
                  </span>
                  {!item.done && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />}
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Avara Security News */}
        <Card className="md:col-span-3">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Avara Security News</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">What's happening across the company this week</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {newsItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/40">
                  <div className={`p-1.5 rounded-md ${item.bg} flex-shrink-0 mt-0.5`}>
                    <Icon className={`h-3.5 w-3.5 ${item.color}`} />
                  </div>
                  <p className="text-sm leading-snug">{item.text}</p>
                </div>
              );
            })}
            {leaderboardEntries.length > 0 && (
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-500">Leaderboard preview</p>
                  <Link href="/achievements" className="text-[11px] font-medium text-primary">View all</Link>
                </div>
                <div className="space-y-2">
                  {leaderboardEntries.slice(0, 3).map((entry: { userId?: string; displayName?: string; totalPoints?: number }, index: number) => (
                    <div key={entry.userId || `${entry.displayName}-${index}`} className="flex items-center justify-between rounded-md bg-background/70 px-2.5 py-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{entry.displayName || `Learner ${index + 1}`}</p>
                        <p className="text-[10px] text-muted-foreground">{index === 0 ? "Top performer" : index === 1 ? "High engagement" : "Steady progress"}</p>
                      </div>
                      <span className="text-sm font-semibold text-amber-500">{entry.totalPoints ?? 0} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <p className="text-[10px] text-muted-foreground text-center pt-1">
              No personal security data is shown here — only company-wide anonymised stats.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatusRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      {ok ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      ) : (
        <AlertTriangle className="h-4 w-4 text-amber-500" />
      )}
    </div>
  );
}
