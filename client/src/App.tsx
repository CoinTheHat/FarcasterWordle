import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "./lib/wagmi";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import { BottomNav } from "@/components/BottomNav";
import Game from "@/pages/Game";
import Leaderboard from "@/pages/Leaderboard";
import Admin from "@/pages/Admin";
import Verify from "@/pages/Verify";
import Terms from "@/pages/Terms";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Game} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/verify" component={Verify} />
      <Route path="/admin" component={Admin} />
      <Route path="/terms" component={Terms} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [location] = useLocation();
  const showBottomNav = location !== "/admin" && location !== "/terms";
  
  return (
    <>
      <Toaster />
      <div className={showBottomNav ? "pb-20" : ""}>
        <Router />
      </div>
      {showBottomNav && <BottomNav />}
    </>
  );
}

function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <TooltipProvider>
            <AppContent />
          </TooltipProvider>
        </I18nProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
