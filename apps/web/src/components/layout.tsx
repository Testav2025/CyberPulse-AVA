import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from './theme-provider';
import { useGetCurrentUser } from '@workspace/api-client-react';
import { useAuth } from './auth-provider';
import { useTeamsContext } from '@/hooks/useTeamsContext';
import { MobileNav } from './mobile-nav';
import { getViewTier } from '@/lib/role-utils';
import { 
  LayoutDashboard, 
  Activity, 
  MonitorSmartphone, 
  GraduationCap, 
  Bot, 
  Bell, 
  UserCircle,
  Moon,
  Sun,
  Shield,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Users,
  Mail,
  Wrench,
  Trophy,
  ChevronDown,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

export function Layout({ children }: { children: ReactNode }) {
  const { data: userProfile, isLoading: isProfileLoading } = useGetCurrentUser();
  const { user: msalUser, isLoading: isAuthLoading } = useAuth();
  const { isInTeams } = useTeamsContext();
  const { theme, setTheme } = useTheme();
  const [location] = useLocation();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const tier = getViewTier(userProfile?.role, userProfile?.jobTitle);
  const isLoading = isProfileLoading || isAuthLoading;
  const user = userProfile || msalUser; // Fallback to MSAL user info if profile not loaded


  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Core nav — every user
  const coreNavItems = [
    { label: 'Home', path: '/', icon: LayoutDashboard },
    { label: 'My Security', path: '/score', icon: Activity },
    { label: 'My Device', path: '/devices', icon: MonitorSmartphone },
    { label: 'Email Safety', path: '/darktrace', icon: Mail },
    { label: 'Learn', path: '/training', icon: GraduationCap },
    { label: 'Achievements', path: '/achievements', icon: Trophy },
    { label: 'Ask AVA', path: '/assistant', icon: Bot },
  ];

  // Advanced (IT/Security tier only) — collapsed by default
  const advancedNavItems = [
    { label: 'Security Messages', path: '/alerts', icon: ShieldAlert },
    { label: 'Security Improvements', path: '/pentera', icon: Wrench },
  ];

  // Manager
  const managerNavItems = [
    { label: 'Security Messages', path: '/alerts', icon: ShieldAlert },
    { label: 'My Team', path: '/manager', icon: Users },
  ];

  const isAdvancedActive = advancedNavItems.some(i => i.path === location);

  const bottomItems = [
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Profile', path: '/profile', icon: UserCircle },
  ];

  const pageTitles: Record<string, string> = {
    '/': 'Home',
    '/score': 'My Security',
    '/devices': 'My Device',
    '/alerts': 'Security Messages',
    '/darktrace': 'Email Safety',
    '/pentera': 'Security Improvements',
    '/training': 'Learn',
    '/assistant': 'Ask AVA',
    '/notifications': 'Notifications',
    '/profile': 'Profile',
    '/manager': 'My Team',
    '/achievements': 'My Achievements',
  };

  // Determine which nav items to show
  const mainNavItems = tier === 'frontline'
    ? coreNavItems.filter(i => !['Email Safety'].includes(i.label))
    : coreNavItems;

  return (
    <SidebarProvider>
      <div className={`flex min-h-[100dvh] w-full bg-background ${isInTeams ? 'pb-16' : ''}`}>
        {!isInTeams && (
          <Sidebar className="border-r border-border">
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-3 px-2">
              <img 
                src="/cyberpulse-ava-logo.jpg" 
                alt="CyberPulse AVA Logo" 
                className="h-9 w-9 rounded-full object-cover border border-primary/20"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight leading-none">CyberPulse AVA</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">Security Companion</span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-2">
            <SidebarMenu>
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <Link href={item.path} className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              {/* Manager extras */}
              {tier === 'manager' && managerNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild isActive={location === item.path} tooltip={item.label}>
                      <Link href={item.path} className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              {/* Advanced section (IT/Security only) */}
              {tier === 'security' && (
                <>
                  <div className="mt-3 mb-1 px-2">
                    <button
                      onClick={() => setAdvancedOpen(o => !o)}
                      className="flex items-center justify-between w-full text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors py-1"
                    >
                      <span>Advanced</span>
                      <ChevronDown className={`h-3 w-3 transition-transform ${advancedOpen || isAdvancedActive ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                  {(advancedOpen || isAdvancedActive) && advancedNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton asChild isActive={location === item.path} tooltip={item.label}>
                          <Link href={item.path} className="flex items-center gap-3">
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </>
              )}
            </SidebarMenu>

            {/* IT & Security badge */}
            {tier === 'security' && (
              <div className="mx-2 mt-4 p-2 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-xs text-primary font-semibold flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> IT &amp; Security View
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Advanced data visible</p>
              </div>
            )}
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-border">
            <SidebarMenu>
              {bottomItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild isActive={location === item.path}>
                      <Link href={item.path} className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>

            <div className="mt-4 flex items-center justify-between px-2">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-2 w-16" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 overflow-hidden">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatarUrl || ''} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user?.displayName?.substring(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium truncate">{user?.displayName}</span>
                    <span className="text-xs text-muted-foreground truncate">{user?.department}</span>
                  </div>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-8 w-8 ml-2 flex-shrink-0"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
            <div className="mt-4 pt-4 border-t border-border flex flex-col items-center gap-1.5">
              <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">Brought to you by</span>
              <div className="flex items-center justify-center bg-white p-1.5 rounded-md w-full border border-border">
                <img 
                  src="/avara-foods-logo.png" 
                  alt="Avara Foods" 
                  className="h-6 object-contain"
                />
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        )}

        <main className="flex-1 flex flex-col w-full overflow-hidden">
          {!isInTeams && (
            <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="hidden sm:flex text-sm font-medium text-muted-foreground">
                {pageTitles[location] || 'CyberPulse AVA'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="gap-2">
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </header>
          )}
          <div className="flex-1 overflow-auto p-4 lg:p-6 bg-background text-foreground">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </div>
          {isInTeams && <MobileNav />}
        </main>
      </div>
    </SidebarProvider>
  );
}
