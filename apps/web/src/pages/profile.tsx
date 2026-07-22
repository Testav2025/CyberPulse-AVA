import { useState, useEffect } from "react";
import { useGetCurrentUser, useUpdateCurrentUser } from "@workspace/api-client-react";
import { useTheme } from "@/components/theme-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { UserCircle, Shield, Building2, Mail, Monitor, Moon, Sun } from "lucide-react";

export default function Profile() {
  const { data: user, isLoading } = useGetCurrentUser();
  const updateUser = useUpdateCurrentUser();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [displayName, setDisplayName] = useState("");
  const [themePref, setThemePref] = useState("dark");

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
      setThemePref(user.theme || "dark");
      setTheme((user.theme as any) || "dark");
    }
  }, [user, setTheme]);

  const handleSave = () => {
    updateUser.mutate({
      data: {
        displayName,
        theme: themePref as any
      }
    }, {
      onSuccess: () => {
        toast({ title: "Profile Updated", description: "Your changes have been saved." });
        queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
        setTheme(themePref as any);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-500 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">User Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and application preferences.
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary/40 to-indigo-500/40 relative">
          <div className="absolute -bottom-10 left-6">
            <Avatar className="h-20 w-20 border-4 border-card shadow-lg">
              <AvatarImage src={user?.avatarUrl || ''} />
              <AvatarFallback className="text-2xl bg-muted">
                {user?.displayName.substring(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        <CardContent className="pt-14 pb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{user?.displayName}</h2>
              <p className="text-muted-foreground font-medium flex items-center gap-1.5 mt-1">
                <Shield className="h-4 w-4 text-primary" /> {user?.role}
              </p>
            </div>
            <div className="bg-muted px-3 py-1 rounded-full text-xs font-medium border border-border">
              Entra SSO Active
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-6 border-t border-border">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Email Address</p>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Department</p>
                <p className="text-muted-foreground">{user?.department}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personalization</CardTitle>
          <CardDescription>Update your display name and visual theme.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input 
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="max-w-md"
            />
            <p className="text-xs text-muted-foreground">This is how you appear on leaderboards and to AVA.</p>
          </div>

          <div className="space-y-3 pt-2">
            <Label>Appearance</Label>
            <RadioGroup 
              value={themePref} 
              onValueChange={setThemePref}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 bg-card hover:bg-muted/30 transition-colors">
                <RadioGroupItem value="dark" id="theme-dark" />
                <Label htmlFor="theme-dark" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Moon className="h-4 w-4 text-indigo-400" /> 
                  <div className="space-y-0.5">
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-xs text-muted-foreground">Mission control aesthetic (Default)</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 bg-card hover:bg-muted/30 transition-colors">
                <RadioGroupItem value="light" id="theme-light" />
                <Label htmlFor="theme-light" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Sun className="h-4 w-4 text-amber-500" /> 
                  <div className="space-y-0.5">
                    <p className="font-medium">Light Mode</p>
                    <p className="text-xs text-muted-foreground">Clean, structured professional look</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 bg-card hover:bg-muted/30 transition-colors">
                <RadioGroupItem value="system" id="theme-system" />
                <Label htmlFor="theme-system" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Monitor className="h-4 w-4 text-slate-500" /> 
                  <div className="space-y-0.5">
                    <p className="font-medium">System</p>
                    <p className="text-xs text-muted-foreground">Follows your OS settings</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/20 border-t border-border mt-4 py-4 flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={() => {
              setDisplayName(user?.displayName || "");
              setThemePref(user?.theme || "dark");
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateUser.isPending}>
            {updateUser.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}