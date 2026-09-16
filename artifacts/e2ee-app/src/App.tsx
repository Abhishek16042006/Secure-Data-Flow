import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SessionProvider, useSession } from "@/lib/session";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Learn from "@/pages/Learn";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/learn" component={Learn} />
      <Route component={NotFound} />
    </Switch>
  );
}

function SessionLoadingScreen() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background text-muted-foreground">
      Restoring your secure session…
    </div>
  );
}

function AppContent() {
  const { isHydrating } = useSession();

  if (isHydrating) {
    return <SessionLoadingScreen />;
  }

  return (
    <>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
      <Toaster />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <TooltipProvider>
          <AppContent />
        </TooltipProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}

export default App;
