import {
  useGetTrainingProgress,
  useGetTrainingLeaderboard,
  useGetDevices,
  useGetCurrentUser,
} from "@workspace/api-client-react";
import { Link } from "wouter";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDisplayName, getEffectiveUserProfile, getLevelFromPoints } from "@/lib/role-utils";
import { Trophy, Star, Lock, ChevronRight, Flame, Zap } from "lucide-react";

const LEVELS = [
  { level: 1, title: "Recruit", minPoints: 0, description: "Welcome to your security journey." },
  { level: 2, title: "Defender", minPoints: 30, description: "You know the basics and you're putting them into practice." },
  { level: 3, title: "Protector", minPoints: 70, description: "You actively protect yourself and your team." },
  { level: 4, title: "Cyber Guardian", minPoints: 120, description: "A trusted name when it comes to security." },
  { level: 5, title: "Security Champion", minPoints: 200, description: "You lead by example and inspire others." },
];

const BADGES = [
  {
    id: "phishing-detective",
    emoji: "🎣",
    title: "Phishing Detective",
    description: "Completed the phishing awareness module",
    requiredPoints: 10,
    color: "from-blue-500/20 to-indigo-500/20",
    border: "border-blue-500/30",
    textColor: "text-blue-400",
  },
  {
    id: "password-pro",
    emoji: "🔐",
    title: "Password Pro",
    description: "Completed the password security module",
    requiredPoints: 25,
    color: "from-emerald-500/20 to-teal-500/20",
    border: "border-emerald-500/30",
    textColor: "text-emerald-400",
  },
  {
    id: "mfa-champion",
    emoji: "🛡️",
    title: "MFA Champion",
    description: "Two-step login is enabled and active",
    requiredPoints: 0, // always earned — MFA is on
    alwaysEarned: true,
    color: "from-purple-500/20 to-violet-500/20",
    border: "border-purple-500/30",
    textColor: "text-purple-400",
  },
  {
    id: "security-guardian",
    emoji: "⭐",
    title: "Security Guardian",
    description: "Reached Level 3 or higher",
    requiredPoints: 70,
    color: "from-amber-500/20 to-yellow-500/20",
    border: "border-amber-500/30",
    textColor: "text-amber-400",
  },
  {
    id: "data-protector",
    emoji: "🏰",
    title: "Data Protector",
    description: "Completed the data protection module",
    requiredPoints: 45,
    color: "from-rose-500/20 to-pink-500/20",
    border: "border-rose-500/30",
    textColor: "text-rose-400",
  },
  {
    id: "cyber-scholar",
    emoji: "📚",
    title: "Cyber Scholar",
    description: "Completed 5 or more training modules",
    requiredPoints: 60,
    color: "from-cyan-500/20 to-sky-500/20",
    border: "border-cyan-500/30",
    textColor: "text-cyan-400",
  },
  {
    id: "ransomware-resistant",
    emoji: "💪",
    title: "Ransomware Resistant",
    description: "Completed the ransomware defence module",
    requiredPoints: 90,
    color: "from-orange-500/20 to-red-500/20",
    border: "border-orange-500/30",
    textColor: "text-orange-400",
  },
  {
    id: "security-champion",
    emoji: "🏆",
    title: "Security Champion",
    description: "Reached the highest level — an inspiration to all",
    requiredPoints: 200,
    color: "from-yellow-500/20 to-amber-500/20",
    border: "border-yellow-500/30",
    textColor: "text-yellow-400",
  },
];

const LEVEL_PREV_POINTS = [0, 0, 30, 70, 120, 200];

function normalizeCollection<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (Array.isArray(record.items)) return record.items as T[];
    if (Array.isArray(record.data)) return record.data as T[];
    if (Array.isArray(record.leaderboard)) return record.leaderboard as T[];
    if (Array.isArray(record.devices)) return record.devices as T[];
  }
  return [];
}

export default function Achievements() {
  const { user: msalUser } = useAuth();
  const { data: user } = useGetCurrentUser();
  const { data: progress, isLoading } = useGetTrainingProgress();
  const { data: leaderboard } = useGetTrainingLeaderboard({ limit: 5 });
  const { data: devices } = useGetDevices({});

  const points = Number(progress?.totalPoints) || 0;
  const levelInfo = getLevelFromPoints(points);
  const prevAt = LEVEL_PREV_POINTS[levelInfo.level] ?? 0;
  const progressToNext =
    levelInfo.level < 5
      ? Math.round(((points - prevAt) / (levelInfo.nextAt - prevAt)) * 100)
      : 100;

  const normalizedDevices = normalizeCollection<Record<string, unknown>>(devices);
  const normalizedLeaderboard = normalizeCollection<Record<string, unknown>>(leaderboard);
  const fallbackLeaderboard = [
    { userId: "demo-frontline", displayName: "Liam Patel", totalPoints: 24 },
    { userId: "demo-office", displayName: "Maya Chen", totalPoints: 58 },
    { userId: "demo-manager", displayName: "Daniel Brooks", totalPoints: 92 },
    { userId: "demo-security", displayName: "Ava Singh", totalPoints: 136 },
  ];
  const leaderboardEntries = normalizedLeaderboard.length > 0 ? normalizedLeaderboard : fallbackLeaderboard;

  const myDevices = normalizedDevices.filter((d) => (d.userId as string | undefined) === "user-001") || [];
  const hasMfa = true; // Alex has MFA on (seeded)

  const earnedBadges = BADGES.filter((b) => {
    if (b.alwaysEarned) return hasMfa;
    return points >= b.requiredPoints;
  });

  const lockedBadges = BADGES.filter((b) => {
    if (b.alwaysEarned) return !hasMfa;
    return points < b.requiredPoints;
  });

  const effectiveUser = getEffectiveUserProfile(user || msalUser);
  const displayName = getDisplayName(effectiveUser, "there");
  const firstName = displayName.split(" ")[0] || "there";
  const streak = Number(progress?.currentStreak) || 0;

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-500/20 rounded-lg border border-amber-500/30">
              <Trophy className="h-6 w-6 text-amber-500" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">My Achievements</h1>
          </div>
          <p className="text-muted-foreground">
            Your security journey, level by level. Keep going — every step makes Avara safer.
          </p>
        </div>
      </div>

      {/* Player card */}
      {isLoading ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : (
        <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-card to-yellow-500/5 p-6 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-amber-500/5 blur-3xl" />
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {/* Level badge */}
            <div className="flex flex-col items-center gap-2">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-white font-black text-3xl shadow-lg ring-4 ring-amber-500/20">
                {levelInfo.level}
              </div>
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">
                Level {levelInfo.level}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold">{levelInfo.title}</h2>
                {streak > 0 && (
                  <span className="flex items-center gap-1 text-orange-500 font-bold text-sm">
                    <Flame className="h-4 w-4" /> {streak} day streak
                  </span>
                )}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-500 mb-3">
                <Trophy className="h-3.5 w-3.5" />
                {effectiveUser.viewLabel} • {effectiveUser.levelLabel}
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {LEVELS.find((l) => l.level === levelInfo.level)?.description}
              </p>

              {levelInfo.level < 5 ? (
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>{points} points</span>
                    <span>{levelInfo.nextAt} points to reach {LEVELS[levelInfo.level]?.title}</span>
                  </div>
                  <Progress value={progressToNext} className="h-2.5" />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {levelInfo.nextAt - points} more points to level up
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                  <Star className="h-4 w-4 fill-current" />
                  Maximum level reached — you're a Security Champion!
                </div>
              )}
            </div>

            {/* Points counter */}
            <div className="flex flex-col items-center bg-card border border-border rounded-xl p-4 min-w-[100px] text-center">
              <Zap className="h-5 w-5 text-amber-400 mb-1" />
              <p className="text-3xl font-black text-amber-400">{points}</p>
              <p className="text-xs text-muted-foreground">points</p>
            </div>
          </div>
        </div>
      )}

      {/* Level roadmap */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Your Security Journey</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {LEVELS.map((l, i) => {
              const achieved = levelInfo.level >= l.level;
              const isCurrent = levelInfo.level === l.level;
              return (
                <div key={l.level} className="flex flex-col items-center gap-2 min-w-[100px] flex-1">
                  <div className="flex items-center w-full">
                    {i > 0 && (
                      <div className={`h-0.5 flex-1 ${achieved ? "bg-amber-500" : "bg-border"}`} />
                    )}
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-all ${
                      achieved
                        ? "bg-amber-500 text-white ring-2 ring-amber-500/30 shadow"
                        : "bg-muted text-muted-foreground border border-border"
                    } ${isCurrent ? "ring-4 ring-amber-500/30 scale-110" : ""}`}>
                      {l.level}
                    </div>
                    {i < LEVELS.length - 1 && (
                      <div className={`h-0.5 flex-1 ${levelInfo.level > l.level ? "bg-amber-500" : "bg-border"}`} />
                    )}
                  </div>
                  <div className="text-center">
                    <p className={`text-xs font-semibold ${achieved ? "text-amber-400" : "text-muted-foreground"}`}>
                      {l.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{l.minPoints}+ pts</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Earned badges */}
      {earnedBadges.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Badges Earned
            <Badge variant="secondary" className="text-xs">{earnedBadges.length}</Badge>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {earnedBadges.map((badge) => (
              <div
                key={badge.id}
                className={`rounded-xl border ${badge.border} bg-gradient-to-br ${badge.color} p-4 flex flex-col items-center text-center gap-2 shadow-sm`}
              >
                <span className="text-4xl">{badge.emoji}</span>
                <div>
                  <p className={`font-bold text-sm ${badge.textColor}`}>{badge.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{badge.description}</p>
                </div>
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5 bg-background/50">
                  Earned ✓
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked badges */}
      {lockedBadges.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
            <Lock className="h-5 w-5" />
            Badges to Unlock
            <Badge variant="outline" className="text-xs">{lockedBadges.length} remaining</Badge>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {lockedBadges.map((badge) => (
              <div
                key={badge.id}
                className="rounded-xl border border-border/50 bg-muted/20 p-4 flex flex-col items-center text-center gap-2 opacity-60"
              >
                <span className="text-4xl grayscale">{badge.emoji}</span>
                <div>
                  <p className="font-bold text-sm text-muted-foreground">{badge.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{badge.description}</p>
                </div>
                <Badge variant="outline" className="text-[10px] px-2 py-0.5 gap-1">
                  <Lock className="h-2.5 w-2.5" /> {badge.requiredPoints} pts needed
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      {leaderboardEntries.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              Top Learners This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboardEntries.slice(0, 5).map((entry, i) => {
                const entryLevel = getLevelFromPoints(entry.totalPoints || 0);
                return (
                  <div key={entry.userId} className="flex items-center gap-3">
                    <span className={`text-sm font-black w-5 shrink-0 ${
                      i === 0 ? "text-amber-400" : i === 1 ? "text-slate-400" : i === 2 ? "text-orange-500" : "text-muted-foreground"
                    }`}>
                      {i + 1}
                    </span>
                    <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-semibold text-primary">
                        {entry.displayName?.substring(0, 2).toUpperCase() || "?"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{entry.displayName}</p>
                      <p className="text-[10px] text-muted-foreground">{entryLevel.title}</p>
                    </div>
                    <span className="text-sm font-bold text-amber-400 shrink-0">
                      {entry.totalPoints || 0} pts
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CTA */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="font-semibold">Ready to level up?</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Complete training modules to earn points, unlock badges and reach the next level.
          </p>
        </div>
        <Button asChild className="shrink-0">
          <Link href="/training">
            Go to Cyber Learning <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
