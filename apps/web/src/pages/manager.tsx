import {
  useGetTrainingLeaderboard,
  useGetTrainingProgress,
  useGetSecuritySummary,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  ShieldCheck,
  GraduationCap,
  TrendingUp,
  Trophy,
  CheckCircle2,
  AlertTriangle,
  Star,
} from "lucide-react";

// Simulated team stats (in a real build these would come from a manager-specific API endpoint)
const TEAM_MEMBERS = [
  { name: "Sarah Chen",    role: "IT Manager",     score: 91, training: 100, device: "Protected",     avatar: "" },
  { name: "Lisa Park",     role: "Security Arch",  score: 95, training: 100, device: "Protected",     avatar: "" },
  { name: "Emma Johnson",  role: "SOC Analyst",    score: 88, training: 83,  device: "Protected",     avatar: "" },
  { name: "David Nguyen",  role: "DevOps Engineer",score: 82, training: 67,  device: "Protected",     avatar: "" },
  { name: "James Okafor",  role: "Developer",      score: 64, training: 33,  device: "Needs Attention",avatar: "" },
  { name: "Priya Sharma",  role: "Analyst",        score: 77, training: 50,  device: "Protected",     avatar: "" },
  { name: "Carlos Rivera", role: "Sales Manager",  score: 55, training: 0,   device: "Needs Attention",avatar: "" },
  { name: "Tom Williams",  role: "HR Director",    score: 69, training: 17,  device: "Update Pending", avatar: "" },
];

const avgScore = Math.round(TEAM_MEMBERS.reduce((s, m) => s + m.score, 0) / TEAM_MEMBERS.length);
const avgTraining = Math.round(TEAM_MEMBERS.reduce((s, m) => s + m.training, 0) / TEAM_MEMBERS.length);
const protected_ = TEAM_MEMBERS.filter(m => m.device === "Protected").length;
const needsAttention = TEAM_MEMBERS.filter(m => m.device !== "Protected").length;

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-500";
  if (score >= 65) return "text-amber-500";
  return "text-red-500";
}

function scoreLabel(score: number) {
  if (score >= 80) return "Good";
  if (score >= 65) return "Fair";
  return "At Risk";
}

export default function Manager() {
  const { data: leaderboard, isLoading: isLoadingLeaderboard } = useGetTrainingLeaderboard({ limit: 10 });

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-500">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
            <Users className="h-6 w-6 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">My Team Security</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          A high-level view of your team's security posture. Personal details are not shown — 
          this is about understanding and improving the team's overall security health.
        </p>
      </div>

      {/* Team Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <p className="text-sm font-semibold">Team Security Score</p>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-primary">{avgScore}</p>
              <p className="text-muted-foreground text-sm">/100</p>
            </div>
            <Progress value={avgScore} className="h-2 mt-3" indicatorClassName="bg-primary" />
            <p className="text-xs text-muted-foreground mt-2">Team average</p>
          </CardContent>
        </Card>

        <Card className={needsAttention > 0 ? "border-amber-500/20 bg-amber-500/5" : "border-emerald-500/20 bg-emerald-500/5"}>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              {needsAttention > 0
                ? <AlertTriangle className="h-5 w-5 text-amber-500" />
                : <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
              <p className="text-sm font-semibold">Protected Devices</p>
            </div>
            <p className="text-4xl font-black">
              <span className="text-emerald-500">{protected_}</span>
              <span className="text-muted-foreground text-2xl">/{TEAM_MEMBERS.length}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {needsAttention > 0
                ? `${needsAttention} device${needsAttention > 1 ? "s" : ""} need attention`
                : "All devices protected"}
            </p>
          </CardContent>
        </Card>

        <Card className={avgTraining < 60 ? "border-amber-500/20 bg-amber-500/5" : "border-emerald-500/20 bg-emerald-500/5"}>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <GraduationCap className="h-5 w-5 text-purple-500" />
              <p className="text-sm font-semibold">Training Completion</p>
            </div>
            <p className="text-4xl font-black text-purple-500">{avgTraining}%</p>
            <Progress value={avgTraining} className="h-2 mt-3" indicatorClassName="bg-purple-500" />
            <p className="text-xs text-muted-foreground mt-2">Team average</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <p className="text-sm font-semibold">Security Engagement</p>
            </div>
            <p className="text-4xl font-black text-emerald-500">
              {TEAM_MEMBERS.filter(m => m.training > 50).length}
              <span className="text-muted-foreground text-2xl">/{TEAM_MEMBERS.length}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-2">Members actively training</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Member Overview */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Team Overview</CardTitle>
            <CardDescription>
              Security scores and training progress — names shown as first name only.
              No personal security details are displayed here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {TEAM_MEMBERS.map((member, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 rounded-xl border border-border/60 hover:bg-muted/30 transition-colors"
                >
                  <Avatar className="h-9 w-9 flex-shrink-0">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                      {member.name.split(" ").map(n => n[0]).join("").substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold">{member.name.split(" ")[0]}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-1.5">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-muted-foreground">Training:</span>
                        <span className={member.training === 100 ? "text-emerald-500 font-medium" : member.training > 50 ? "text-amber-500 font-medium" : "text-red-500 font-medium"}>
                          {member.training}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-muted-foreground">Device:</span>
                        <span className={member.device === "Protected" ? "text-emerald-500 font-medium" : "text-amber-500 font-medium"}>
                          {member.device}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-right">
                    <p className={`text-lg font-black ${scoreColor(member.score)}`}>{member.score}</p>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 mt-0.5 ${
                        member.score >= 80 ? "border-emerald-500/30 text-emerald-500" :
                        member.score >= 65 ? "border-amber-500/30 text-amber-500" :
                        "border-red-500/30 text-red-500"
                      }`}
                    >
                      {scoreLabel(member.score)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Learners + Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                Top Learners
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
                ) : leaderboard?.slice(0, 5).map((entry, idx) => (
                  <div key={entry.userId} className="flex items-center gap-2">
                    <div className={`flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-bold flex-shrink-0 ${
                      idx === 0 ? "bg-yellow-500/20 text-yellow-500" :
                      idx === 1 ? "bg-slate-300/20 text-slate-300" :
                      idx === 2 ? "bg-amber-700/20 text-amber-600" : "bg-muted text-muted-foreground"
                    }`}>
                      {idx + 1}
                    </div>
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={entry.avatarUrl || ""} />
                      <AvatarFallback className="text-[10px]">{entry.displayName.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{entry.displayName.split(" ")[0]}</p>
                    </div>
                    <div className="flex items-center gap-0.5 text-xs font-bold text-purple-400">
                      <Star className="h-3 w-3" /> {entry.totalPoints}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommended Team Actions */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recommended Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {needsAttention > 0 && (
                <ActionItem
                  icon={AlertTriangle}
                  color="text-amber-500"
                  bg="bg-amber-500/10"
                  title={`${needsAttention} device${needsAttention > 1 ? "s" : ""} need attention`}
                  desc="Contact IT to resolve device compliance issues."
                />
              )}
              {avgTraining < 100 && (
                <ActionItem
                  icon={GraduationCap}
                  color="text-purple-500"
                  bg="bg-purple-500/10"
                  title="Remind team to complete training"
                  desc="Send a Teams message encouraging completion."
                />
              )}
              <ActionItem
                icon={ShieldCheck}
                color="text-emerald-500"
                bg="bg-emerald-500/10"
                title="Celebrate your top learners"
                desc="Recognise team members with high security scores."
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Privacy notice */}
      <Card className="border-dashed">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">
            <strong>Privacy:</strong> This manager view shows aggregated and anonymised security posture data only. 
            Individual employees' personal security messages, account activity, or specific device issues are not visible here. 
            Contact IT Security for escalation on specific incidents.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function ActionItem({ icon: Icon, color, bg, title, desc }: {
  icon: any; color: string; bg: string; title: string; desc: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card">
      <div className={`p-1.5 rounded-md ${bg} flex-shrink-0 mt-0.5`}>
        <Icon className={`h-3.5 w-3.5 ${color}`} />
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
    </div>
  );
}
