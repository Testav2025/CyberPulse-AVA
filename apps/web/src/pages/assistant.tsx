import { useState, useRef, useEffect } from "react";
import { useSendAssistantMessage, useGetAssistantHistory, useGetCurrentUser, useGetCyberScore } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  Info,
  HelpCircle,
  Mail,
  Smartphone,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";

const PREBUILT_PROMPTS = [
  { label: "Am I secure?", icon: ShieldCheck, color: "text-emerald-500" },
  { label: "What should I improve?", icon: TrendingUp, color: "text-blue-500" },
  { label: "Have I received suspicious emails?", icon: Mail, color: "text-indigo-500" },
  { label: "What should I improve this week?", icon: Sparkles, color: "text-purple-500" },
  { label: "What is phishing?", icon: HelpCircle, color: "text-amber-500" },
  { label: "How do I stay safe online?", icon: Info, color: "text-primary" },
  { label: "Has my device got any issues?", icon: Smartphone, color: "text-rose-500" },
  { label: "What training should I do?", icon: BookOpen, color: "text-teal-500" },
];

export default function Assistant() {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: user } = useGetCurrentUser();
  const { data: score } = useGetCyberScore();
  const { data: history, isLoading } = useGetAssistantHistory({ limit: 50 });
  const sendMessage = useSendAssistantMessage();
  const [localMessages, setLocalMessages] = useState<any[]>([]);
  const [pendingSent, setPendingSent] = useState(false);

  const firstName = user?.displayName?.split(" ")[0] || "there";

  useEffect(() => {
    if (history) {
      setLocalMessages(history.slice().reverse());
    }
  }, [history]);

  // Pick up any message queued from the home page AVA prompt
  useEffect(() => {
    if (!isLoading && !pendingSent) {
      const pending = sessionStorage.getItem("ava_pending_message");
      if (pending) {
        sessionStorage.removeItem("ava_pending_message");
        setPendingSent(true);
        send(pending);
      }
    }
  }, [isLoading, pendingSent]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [localMessages, sendMessage.isPending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const send = (text: string) => {
    if (!text.trim() || sendMessage.isPending) return;
    const userMsg = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    setLocalMessages((prev) => [...prev, userMsg]);
    setInput("");
    sendMessage.mutate(
      { data: { message: text, context: "general" } },
      { onSuccess: (response) => setLocalMessages((prev) => [...prev, response.message]) }
    );
  };

  const hasConversation = localMessages.length > 0;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-in fade-in duration-500 max-w-3xl mx-auto w-full">

      {/* Header — compact when conversation started, hero when fresh */}
      {!hasConversation && !isLoading ? (
        <div className="flex flex-col items-center text-center py-6 mb-2">
          <div className="relative mb-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-xl">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500" />
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Good {getGreeting()}, {firstName}
          </h1>
          {score && (
            <p className="text-sm text-muted-foreground mt-1">
              Security Score: <span className="font-semibold text-foreground">{score.overallScore}/100</span>
            </p>
          )}
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500" />
            Ask AVA anything about your security
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight leading-none">Ask AVA</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Your personal security coach</p>
          </div>
        </div>
      )}

      {/* Chat Card */}
      <Card className="flex-1 flex flex-col overflow-hidden border-border/50 shadow-lg">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* Empty state — prebuilt prompts */}
          {!hasConversation && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Try asking…
              </p>
              <div className="w-full max-w-md">
                <div className="grid grid-cols-2 gap-2">
                  {PREBUILT_PROMPTS.map((prompt) => {
                    const Icon = prompt.icon;
                    return (
                      <button
                        key={prompt.label}
                        onClick={() => send(prompt.label)}
                        className="flex items-center gap-2 p-3 bg-muted/50 hover:bg-muted border border-border/60 hover:border-primary/40 rounded-xl text-left transition-all group"
                      >
                        <Icon className={`h-4 w-4 flex-shrink-0 ${prompt.color}`} />
                        <span className="text-xs font-medium leading-tight group-hover:text-primary transition-colors">
                          {prompt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Loading skeleton */}
          {isLoading && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-16 w-2/3 rounded-2xl" />
              </div>
            </div>
          )}

          {/* Messages */}
          {!isLoading && localMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <Avatar className="h-8 w-8 border border-primary/20 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div className={`flex flex-col gap-1 max-w-[85%] sm:max-w-[75%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-muted/60 border border-border/50 text-foreground rounded-tl-sm"
                }`}>
                  {msg.content}
                </div>
                <span className="text-[10px] text-muted-foreground px-1">
                  {format(new Date(msg.createdAt), "h:mm a")}
                </span>
              </div>
              {msg.role === "user" && (
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-muted text-xs font-semibold">Me</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {/* AVA typing indicator */}
          {sendMessage.isPending && (
            <div className="flex gap-3 justify-start">
              <Avatar className="h-8 w-8 border border-primary/20 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-muted/60 border border-border/50 flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 bg-primary/60 rounded-full animate-bounce" />
                <div className="h-1.5 w-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0.15s]" />
                <div className="h-1.5 w-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0.3s]" />
              </div>
            </div>
          )}

          {/* Inline prompt chips once conversation started */}
          {hasConversation && !sendMessage.isPending && (
            <div className="flex flex-wrap gap-2 justify-center pt-2">
              {PREBUILT_PROMPTS.slice(0, 4).map((prompt) => (
                <Badge
                  key={prompt.label}
                  variant="outline"
                  className="cursor-pointer hover:bg-muted/80 text-xs py-1 px-2 transition-colors"
                  onClick={() => send(prompt.label)}
                >
                  {prompt.label}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="p-3 bg-card border-t border-border">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AVA anything about your security…"
              className="flex-1 bg-muted/30 focus-visible:ring-1"
              disabled={sendMessage.isPending}
            />
            <Button type="submit" size="icon" disabled={!input.trim() || sendMessage.isPending} className="shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            AVA is powered by AI and may not always be perfect. For urgent security incidents, contact IT Security directly.
          </p>
        </div>
      </Card>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}
