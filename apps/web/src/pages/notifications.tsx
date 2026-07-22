import { useGetNotificationPreferences, useUpdateNotificationPreferences } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Bell, MessageSquare, AlertTriangle, Activity, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function Notifications() {
  const { data: prefs, isLoading } = useGetNotificationPreferences();
  const updatePrefs = useUpdateNotificationPreferences();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    teamsEnabled: false,
    teamsWebhookUrl: "",
    alertsEnabled: true,
    alertMinSeverity: "high",
    scoreChangesEnabled: true,
    weeklyDigestEnabled: true,
    weeklyDigestDay: "monday"
  });

  useEffect(() => {
    if (prefs) {
      setFormData({
        teamsEnabled: prefs.teamsEnabled,
        teamsWebhookUrl: prefs.teamsWebhookUrl || "",
        alertsEnabled: prefs.alertsEnabled,
        alertMinSeverity: prefs.alertMinSeverity || "high",
        scoreChangesEnabled: prefs.scoreChangesEnabled,
        weeklyDigestEnabled: prefs.weeklyDigestEnabled,
        weeklyDigestDay: prefs.weeklyDigestDay || "monday"
      });
    }
  }, [prefs]);

  const handleSave = () => {
    updatePrefs.mutate({ data: formData as any }, {
      onSuccess: () => {
        toast({ title: "Preferences Saved", description: "Your notification settings have been updated." });
        queryClient.invalidateQueries({ queryKey: ["/api/notifications/preferences"] });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-500 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Notification Settings</h1>
        <p className="text-muted-foreground">
          Control how and when you receive security alerts and updates.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Delivery Channels</CardTitle>
          <CardDescription>Configure where AVA sends your notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Microsoft Teams Integration</Label>
              <p className="text-sm text-muted-foreground">Receive critical alerts directly in a Teams channel.</p>
            </div>
            <Switch 
              checked={formData.teamsEnabled} 
              onCheckedChange={v => setFormData(p => ({ ...p, teamsEnabled: v }))} 
            />
          </div>

          {formData.teamsEnabled && (
            <div className="pl-6 border-l-2 border-primary/20 space-y-2 animate-in slide-in-from-top-2 duration-300">
              <Label>Webhook URL</Label>
              <Input 
                placeholder="https://your-domain.webhook.office.com/..." 
                value={formData.teamsWebhookUrl}
                onChange={e => setFormData(p => ({ ...p, teamsWebhookUrl: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Follow the Teams documentation to generate an incoming webhook URL.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Security Alerts</CardTitle>
          <CardDescription>Determine which alerts trigger immediate notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Real-time Alerts</Label>
              <p className="text-sm text-muted-foreground">Notify me when new security events occur.</p>
            </div>
            <Switch 
              checked={formData.alertsEnabled} 
              onCheckedChange={v => setFormData(p => ({ ...p, alertsEnabled: v }))} 
            />
          </div>

          {formData.alertsEnabled && (
            <div className="pl-6 border-l-2 border-primary/20 space-y-2">
              <Label>Minimum Severity Threshold</Label>
              <Select 
                value={formData.alertMinSeverity} 
                onValueChange={v => setFormData(p => ({ ...p, alertMinSeverity: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical Only</SelectItem>
                  <SelectItem value="high">High and above</SelectItem>
                  <SelectItem value="medium">Medium and above</SelectItem>
                  <SelectItem value="low">All Alerts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Score & Digest</CardTitle>
          <CardDescription>Updates about your overall security posture.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">CyberScore Changes</Label>
              <p className="text-sm text-muted-foreground">Notify me when my score increases or decreases significantly.</p>
            </div>
            <Switch 
              checked={formData.scoreChangesEnabled} 
              onCheckedChange={v => setFormData(p => ({ ...p, scoreChangesEnabled: v }))} 
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Weekly Digest</Label>
              <p className="text-sm text-muted-foreground">Receive a summary of the week's security events and score trend.</p>
            </div>
            <Switch 
              checked={formData.weeklyDigestEnabled} 
              onCheckedChange={v => setFormData(p => ({ ...p, weeklyDigestEnabled: v }))} 
            />
          </div>

          {formData.weeklyDigestEnabled && (
            <div className="pl-6 border-l-2 border-primary/20 space-y-2">
              <Label>Delivery Day</Label>
              <Select 
                value={formData.weeklyDigestDay} 
                onValueChange={v => setFormData(p => ({ ...p, weeklyDigestDay: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monday">Monday Morning</SelectItem>
                  <SelectItem value="tuesday">Tuesday Morning</SelectItem>
                  <SelectItem value="wednesday">Wednesday Morning</SelectItem>
                  <SelectItem value="thursday">Thursday Morning</SelectItem>
                  <SelectItem value="friday">Friday Morning</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-muted/20 border-t border-border mt-4 py-4 flex justify-end">
          <Button onClick={handleSave} disabled={updatePrefs.isPending}>
            {updatePrefs.isPending ? "Saving..." : "Save Preferences"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}