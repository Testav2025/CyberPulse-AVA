import { useState } from "react";
import {
  useGetTrainingModules,
  useGetTrainingProgress,
  useGetTrainingLeaderboard,
  useEnrollTrainingModule,
  useCompleteTrainingModule,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  GraduationCap,
  PlayCircle,
  CheckCircle2,
  Trophy,
  Flame,
  Clock,
  BookOpen,
  Award,
  Star,
  Zap,
  Shield,
  Lock,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getLevelFromPoints } from "@/lib/role-utils";

const CHALLENGES = [
  {
    level: 1,
    title: "Spot a Phishing Email",
    description: "Learn to identify fake emails trying to steal your information.",
    module: "mod-001",
    badge: "🎣",
    points: 10,
  },
  {
    level: 2,
    title: "Create a Strong Password",
    description: "Build a password that would take a hacker millions of years to crack.",
    module: "mod-002",
    badge: "🔐",
    points: 15,
  },
  {
    level: 3,
    title: "Protect Company Information",
    description: "Understand how to keep sensitive data safe when sharing files or working remotely.",
    module: "mod-006",
    badge: "🛡️",
    points: 20,
  },
  {
    level: 4,
    title: "Defend Against Ransomware",
    description: "Know what ransomware is and how to avoid downloading dangerous software.",
    module: "mod-004",
    badge: "🏰",
    points: 25,
  },
  {
    level: 5,
    title: "Become a Security Champion",
    description: "Complete all mandatory training and help protect your team.",
    module: null,
    badge: "🏆",
    points: 50,
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  Phishing: "Phishing & Scams",
  Authentication: "Passwords & Login",
  "Zero Trust": "Security Principles",
  Malware: "Viruses & Malware",
  "Remote Work": "Working Safely",
  "Data Protection": "Protecting Data",
  "Incident Response": "Reporting Issues",
  "Cloud Security": "Cloud & Online Safety",
  "Threat Detection": "Spotting Threats",
  Compliance: "Compliance",
  "Social Engineering": "Manipulation Tactics",
  "Endpoint Security": "Device Security",
};

function normalizeCollection<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (Array.isArray(record.items)) return record.items as T[];
    if (Array.isArray(record.data)) return record.data as T[];
    if (Array.isArray(record.modules)) return record.modules as T[];
    if (Array.isArray(record.leaderboard)) return record.leaderboard as T[];
  }
  return [];
}

export default function Training() {
  const [activeFilter, setActiveFilter] = useState<"all" | "not_started" | "in_progress" | "completed">("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: progress, isLoading: isLoadingProgress } = useGetTrainingProgress();
  const { data: modules, isLoading: isLoadingModules } = useGetTrainingModules({
    status: activeFilter !== "all" ? (activeFilter as any) : undefined,
  });
  const { data: leaderboard, isLoading: isLoadingLeaderboard } = useGetTrainingLeaderboard({ limit: 5 });

  const enrollMutation = useEnrollTrainingModule();
  const completeMutation = useCompleteTrainingModule();

  const handleAction = (moduleId: string, action: "enroll" | "complete") => {
    if (action === "enroll") {
      enrollMutation.mutate({ moduleId }, {
        onSuccess: () => {
          toast({ title: "Training started!", description: "Good luck — you've got this." });
          invalidate();
        },
      });
    } else {
      completeMutation.mutate({ moduleId }, {
        onSuccess: () => {
          toast({
            title: "Well done!",
            description: "You've completed a training module and earned security points.",
          });
          invalidate();
        },
      });
    }
  };

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/training"] });
    queryClient.invalidateQueries({ queryKey: ["/api/cyberscore"] });
  };

  const normalizedModules = normalizeCollection<any>(modules);
  const normalizedLeaderboard = normalizeCollection<any>(leaderboard);
  const points = Number(progress?.totalPoints) || 0;
  const levelInfo = getLevelFromPoints(points);
  const progressToNext = levelInfo.level < 5
    ? Math.round(((points - (
        levelInfo.level === 1 ? 0 :
        levelInfo.level === 2 ? 30 :
        levelInfo.level === 3 ? 70 :
        levelInfo.level === 4 ? 120 : 0
      )) / (levelInfo.nextAt - (
        levelInfo.level === 1 ? 0 :
        levelInfo.level === 2 ? 30 :
        levelInfo.level === 3 ? 70 :
        levelInfo.level === 4 ? 120 : 0
      ))) * 100)
    : 100;

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
              <GraduationCap className="h-6 w-6 text-purple-500" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Cyber Learning</h1>
          </div>
          <p className="text-muted-foreground">
            Build your security knowledge, earn badges and level up. Every module makes you — and your team — safer.
          </p>
        </div>
      </div>

      {/* Player Card + Leaderboard */}
      <div className="grid gap-6 md:grid-cols-3">

        {/* My Progress — gamified */}
        <Card className="md:col-span-2 overflow-hidden border-purple-500/20">
          <div className="h-1 bg-gradient-to-r from-purple-500 to-indigo-500 w-full" />
          <CardContent className="p-6">
            {isLoadingProgress ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
            ) : progress ? (
              <div>
                {/* Level Badge + Name */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
                      {levelInfo.level}
                    </div>
                    <div>
                      <p className="font-bold text-lg">{levelInfo.title}</p>
                      <p className="text-xs text-muted-foreground">Level {levelInfo.level}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-orange-500 font-bold text-sm">
                    <Flame className="h-5 w-5" /> {progress.currentStreak} day streak
                  </div>
                </div>

                {/* XP bar */}
                {levelInfo.level < 5 && (
                  <div className="mb-5">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                      <span>{points} points</span>
                      <span>Next level: {levelInfo.nextAt} pts</span>
                    </div>
                    <Progress value={progressToNext} className="h-3" indicatorClassName="bg-gradient-to-r from-purple-500 to-indigo-500" />
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 border-t border-border pt-4">
                  <div className="text-center">
                    <div className="text-muted-foreground text-xs uppercase mb-1">Security Points</div>
                    <div className="text-2xl font-bold text-purple-400 flex items-center justify-center gap-1">
                      <Star className="h-4 w-4" /> {points}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-muted-foreground text-xs uppercase mb-1">Completed</div>
                    <div className="text-2xl font-bold text-emerald-500">
                      {progress.completed}<span className="text-sm text-muted-foreground font-normal"> / {progress.total}</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-muted-foreground text-xs uppercase mb-1">Mandatory</div>
                    <div className={`text-2xl font-bold ${progress.mandatoryCompleted < progress.mandatoryTotal ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {progress.mandatoryCompleted}<span className="text-sm text-muted-foreground font-normal"> / {progress.mandatoryTotal}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              This Month's Leaders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isLoadingLeaderboard ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))
              ) : normalizedLeaderboard.length > 0 ? (
                normalizedLeaderboard.slice(0, 5).map((entry, idx) => (
                  <div key={entry.userId} className="flex items-center gap-3">
                    <div className={`flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold flex-shrink-0 ${
                      idx === 0 ? "bg-yellow-500/20 text-yellow-500" :
                      idx === 1 ? "bg-slate-300/20 text-slate-300" :
                      idx === 2 ? "bg-amber-700/20 text-amber-600" : "bg-muted text-muted-foreground"
                    }`}>
                      {idx + 1}
                    </div>
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={entry.avatarUrl || ""} />
                      <AvatarFallback className="text-xs">{entry.displayName.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{entry.displayName.split(" ")[0]}</div>
                      <div className="text-xs text-muted-foreground">{entry.department}</div>
                    </div>
                    <div className="text-xs font-bold text-purple-400">{entry.totalPoints} pts</div>
                  </div>
                ))
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cyber Challenges */}
      <div>
        <h2 className="text-xl font-bold mb-1">Security Challenges</h2>
        <p className="text-sm text-muted-foreground mb-4">Complete challenges to unlock badges and level up.</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {CHALLENGES.map((challenge) => {
            const isUnlocked = (progress?.totalPoints || 0) >= (challenge.level === 1 ? 0 : challenge.level === 2 ? 10 : challenge.level === 3 ? 25 : challenge.level === 4 ? 50 : 120);
            return (
              <div
                key={challenge.level}
                className={`relative rounded-xl border p-4 text-center transition-all ${
                  isUnlocked
                    ? "bg-card border-purple-500/30 hover-elevate cursor-pointer"
                    : "bg-muted/30 border-border/40 opacity-60"
                }`}
              >
                {!isUnlocked && (
                  <div className="absolute top-2 right-2">
                    <Lock className="h-3 w-3 text-muted-foreground" />
                  </div>
                )}
                <div className="text-3xl mb-2">{challenge.badge}</div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Level {challenge.level}</p>
                <p className="text-sm font-semibold mb-1">{challenge.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{challenge.description}</p>
                <div className="mt-3 flex items-center justify-center gap-1 text-xs font-bold text-purple-400">
                  <Zap className="h-3 w-3" /> +{challenge.points} pts
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Training Module Grid */}
      <div className="space-y-4 pt-2 border-t border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-xl font-bold">Training Library</h2>
          <div className="flex gap-2 flex-wrap">
            {(["all", "not_started", "in_progress", "completed"] as const).map((f) => (
              <Button
                key={f}
                size="sm"
                variant={activeFilter === f ? "default" : "outline"}
                onClick={() => setActiveFilter(f)}
                className="text-xs"
              >
                {{ all: "All", not_started: "New", in_progress: "In Progress", completed: "Done" }[f]}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoadingModules ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="flex flex-col">
                <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                <CardContent className="flex-1"><Skeleton className="h-16 w-full" /></CardContent>
                <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
              </Card>
            ))
          ) : normalizedModules.length > 0 ? (
            normalizedModules.map((module) => (
              <Card key={module.id} className="flex flex-col hover-elevate transition-all hover:border-purple-500/40 overflow-hidden group">
                <CardHeader className="pb-3 relative">
                  {module.isMandatory && (
                    <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-bl-lg">
                      Required
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="capitalize bg-background text-xs">
                      {CATEGORY_LABELS[module.category] || module.category}
                    </Badge>
                    <div className="flex items-center text-xs font-medium text-muted-foreground gap-1 bg-muted px-2 py-1 rounded">
                      <Clock className="h-3 w-3" /> {module.durationMinutes}m
                    </div>
                  </div>
                  <CardTitle className="line-clamp-2 text-base group-hover:text-purple-500 transition-colors">
                    {module.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 pb-3">
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {module.description}
                  </p>

                  {module.status === "in_progress" && module.userProgress != null && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{module.userProgress}%</span>
                      </div>
                      <Progress value={module.userProgress} className="h-1.5" indicatorClassName="bg-purple-500" />
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-0 border-t border-border/30 bg-muted/10">
                  <div className="w-full flex items-center justify-between mt-3">
                    <div className="text-sm font-semibold text-purple-400 flex items-center gap-1">
                      <Star className="h-3.5 w-3.5" /> +{module.scoreContribution} pts
                    </div>

                    {module.status === "completed" ? (
                      <Button variant="outline" size="sm" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20" disabled>
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Completed
                      </Button>
                    ) : module.status === "in_progress" ? (
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => handleAction(module.id, "complete")} disabled={completeMutation.isPending}>
                        <PlayCircle className="mr-2 h-4 w-4" /> Continue
                      </Button>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => handleAction(module.id, "enroll")} disabled={enrollMutation.isPending}>
                        <BookOpen className="mr-2 h-4 w-4" /> Start
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-muted-foreground border rounded-xl border-dashed">
              No training modules found for this filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
