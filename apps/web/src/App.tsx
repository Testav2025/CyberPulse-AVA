import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/components/theme-provider';
import { Layout } from '@/components/layout';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { AuthProvider } from '@/components/auth-provider';
import NotFound from '@/pages/not-found';

import Dashboard from '@/pages/dashboard';
import Score from '@/pages/score';
import Devices from '@/pages/devices';
import Alerts from '@/pages/alerts';
import Darktrace from '@/pages/darktrace';
import Pentera from '@/pages/pentera';
import Training from '@/pages/training';
import Assistant from '@/pages/assistant';
import Notifications from '@/pages/notifications';
import Profile from '@/pages/profile';
import Manager from '@/pages/manager';
import Achievements from '@/pages/achievements';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/score" component={Score} />
      <Route path="/devices" component={Devices} />
      <Route path="/alerts" component={Alerts} />
      <Route path="/darktrace" component={Darktrace} />
      <Route path="/pentera" component={Pentera} />
      <Route path="/training" component={Training} />
      <Route path="/assistant" component={Assistant} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/profile" component={Profile} />
      <Route path="/manager" component={Manager} />
      <Route path="/achievements" component={Achievements} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="cyberpulse-theme">
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <AuthProvider>
              <Layout>
                <Router />
              </Layout>
            </AuthProvider>
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
