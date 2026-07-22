import {
  useGetCyberScore,
  useGetCyberScoreHistory,
} from "@workspace/api-client-react";
import { format } from "date-fns";
import { CyberScoreRing } from "@/components/cyberscore-ring";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ShieldCheck,
  MonitorSmartphone,
  GraduationCap,
  ShieldAlert,
  TrendingUp,
  Lightbulb,
  HelpCircle,
} from "lucide-react";
import { Link } from "wouter";
import { scoreDescription } from "@/lib/role-utils";

export default function Score() {
  const { data: score, isLoading: isLoadingScore } = useGetCyberScore();
  const { data: history, isLoading: isLoadingHistory } = useGetCyberScoreHistory({ days: 30 });

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight mb-2">My Security Score</h1>
          <p className="text-muted-foreground">
            Your Security Score shows how well your account, device and online habits protect you at work. 
            The higher your score, the safer you are.
          </p>

          {score && (
            <div className="mt-4 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-full border border-emerald-500/20 text-sm font-medium">
                <TrendingUp className="h-4 w-4" />
                {score.trend === 'improving' ? 'Your score is improving' :
                 score.trend === 'declining' ? 'Needs attention' : 'Score is stable'}
              </div>
            </div>
          )}

          {score && (
            <div className="mt-4 p-4 bg-muted/40 rounded-xl border border-border/60">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">What this means: </span>
                {scoreDescription(score.overallScore || 0)}
              </p>
            </div>
          )}
        </div>

        <Card className="w-full md:w-auto min-w-[260px] bg-gradient-to-br from-card to-card/50">
          <CardContent className="p-6 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 z-10">My Score</h3>

            {isLoadingScore ? (
              <Skeleton className="h-32 w-32 rounded-full mb-4" />
            ) : (
              <div className="relative z-10 scale-125 mb-6 mt-4">
                <CyberScoreRing score={score?.overallScore || 0} size={140} strokeWidth={8} />
              </div>
            )}

            {score && (
              <div className="w-full grid grid-cols-2 gap-4 text-center z-10 border-t border-border pt-4">
                <div>
                  <div className="text-xs text-muted-foreground font-medium mb-1 uppercase">Grade</div>
                  <div className="text-2xl font-bold text-primary">{score.grade}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium mb-1 uppercase">Top</div>
                  <div className="text-2xl font-bold">15%</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Component Breakdown */}
      <div>
        <h2 className="text-lg font-semibold mb-4">What makes up your score?</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {isLoadingScore ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
            ))
          ) : score && (
            <>
              <ScoreComponentCard
                title="Account Security"
                subtitle="Your login, MFA and password"
                score={score.identityScore}
                icon={ShieldCheck}
                color="bg-blue-500"
                path="/profile"
                tip="Enable two-step login and use a strong password to improve this."
              />
              <ScoreComponentCard
                title="My Device"
                subtitle="Your laptop or phone security"
                score={score.deviceScore}
                icon={MonitorSmartphone}
                color="bg-emerald-500"
                path="/devices"
                tip="Keep your device up to date and ensure it is encrypted."
              />
              <ScoreComponentCard
                title="Training Completed"
                subtitle="Your security knowledge"
                score={score.trainingScore}
                icon={GraduationCap}
                color="bg-purple-500"
                path="/training"
                tip="Complete the recommended training modules to improve this."
              />
              <ScoreComponentCard
                title="Risk Level"
                subtitle="Known risks to your account"
                score={score.riskScore}
                icon={ShieldAlert}
                color="bg-amber-500"
                path="/alerts"
                tip="Resolve any open security messages to improve this."
              />
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Your Score Over 30 Days</CardTitle>
            <CardDescription>Each good habit you build pushes your score higher.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {isLoadingHistory ? (
              <Skeleton className="h-full w-full" />
            ) : history && history.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(val) => format(new Date(val), 'MMM d')}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={20}
                  />
                  <YAxis
                    domain={[0, 100]}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-card border border-border p-3 rounded-lg shadow-xl text-sm">
                            <div className="font-semibold mb-1">{format(new Date(label), 'MMMM d, yyyy')}</div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              <span className="text-muted-foreground">Score:</span>
                              <span className="font-bold text-primary text-base">{payload[0].value}/100</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorScore)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Not enough data yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Lightbulb className="h-5 w-5" />
              How to improve
            </CardTitle>
            <CardDescription>Simple steps that make a big difference.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <RecommendationItem
                title="Complete your phishing training"
                description="Takes 20 minutes and can stop the most common type of cyber attack."
                points="+5 points"
                action="Start now"
                link="/training"
              />
              <RecommendationItem
                title="Update your device"
                description="A security patch is available. Keeping up to date blocks known threats."
                points="+12 points"
                action="Check device"
                link="/devices"
              />
              <RecommendationItem
                title="Review your security messages"
                description="A few items need your attention."
                points="Prevent drop"
                action="View messages"
                link="/alerts"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ScoreComponentCard({
  title, subtitle, score, icon: Icon, color, path, tip
}: {
  title: string; subtitle: string; score: number;
  icon: any; color: string; path: string; tip: string;
}) {
  const scoreLabel = score >= 80 ? 'Good' : score >= 60 ? 'Fair' : 'Needs attention';
  const scoreColor = score >= 80 ? 'text-emerald-500' : score >= 60 ? 'text-amber-500' : 'text-red-500';

  return (
    <Card className="hover:border-primary/50 transition-colors group">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
            <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <span className={`text-xs font-semibold ${scoreColor}`}>{scoreLabel}</span>
        </div>
        <div className="space-y-1 mb-3">
          <p className="font-semibold text-sm">{title}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <Progress value={score} indicatorClassName={color} className="h-2 mb-2" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{score}/100</span>
        </div>
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground flex items-start gap-1">
            <HelpCircle className="h-3 w-3 mt-0.5 flex-shrink-0 text-primary" /> {tip}
          </p>
          <Button variant="link" size="sm" className="px-0 h-auto text-xs text-primary mt-2" asChild>
            <Link href={path}>Take action &rarr;</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RecommendationItem({ title, description, points, action, link }: {
  title: string; description: string; points: string; action: string; link: string;
}) {
  return (
    <div className="p-3 bg-card rounded-lg border border-border/50 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-sm font-semibold">{title}</h4>
        <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">{points}</span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">{description}</p>
      <Button size="sm" className="w-full text-xs" asChild>
        <Link href={link}>{action}</Link>
      </Button>
    </div>
  );
}
