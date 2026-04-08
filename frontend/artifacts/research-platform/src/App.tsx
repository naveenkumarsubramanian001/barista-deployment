/**
 * Main Application Component and Router
 * 
 * Configures the global providers including React Query (for data fetching/caching) 
 * and Wouter (for client-side routing). Maps the application URLs to their page components 
 * inside the global SidebarLayout.
 */
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import NotFound from "@/pages/not-found";
import { HomePage } from "./pages/home";
import { SessionPage } from "./pages/session";
import { TrackerPage } from "./pages/tracker";
import { SidebarLayout } from "./components/SidebarLayout";
import { CompanyDetailsPage } from "./pages/company-details";
import { AnalyzerPage } from "./pages/analyzer";
import { ComparativeReportPage } from "./pages/comparative-report";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <SidebarLayout>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/session/:sessionId" component={SessionPage} />
        <Route path="/tracker" component={TrackerPage} />
        <Route path="/tracker/:companyId" component={CompanyDetailsPage} />
        <Route path="/analyze" component={AnalyzerPage} />
        <Route path="/analyze/report/:sessionId" component={ComparativeReportPage} />
        <Route path="/competetor-analysis" component={AnalyzerPage} />
        <Route path="/competetor-analysis/report/:sessionId" component={ComparativeReportPage} />
        <Route component={NotFound} />
      </Switch>
    </SidebarLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
