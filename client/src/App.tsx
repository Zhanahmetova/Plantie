import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import PlantDetailPage from "@/pages/plant-detail";
import PlantIdentificationPage from "@/pages/plant-identification";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/plants/:id" component={PlantDetailPage} />
      <Route path="/identify" component={PlantIdentificationPage} />
      {/* Additional routes - not fully implemented in this version */}
      <Route path="/plants" component={() => <div>Plants page</div>} />
      <Route path="/tasks" component={() => <div>Tasks page</div>} />
      <Route path="/profile" component={() => <div>Profile page</div>} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
