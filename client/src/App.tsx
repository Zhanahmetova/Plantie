import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import PlantDetailPage from "@/pages/plant-detail";
import PlantIdentificationPage from "@/pages/plant-identification";
import RecordsPage from "@/pages/records";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/plants/:id" component={PlantDetailPage} />
      {/* Routes matching the new bottom navigation */}
      <Route path="/favorites" component={() => <div className="p-4 text-center mt-12">Favorites page</div>} />
      <Route path="/add-plant" component={PlantIdentificationPage} />
      <Route path="/records" component={RecordsPage} />
      <Route path="/settings" component={() => <div className="p-4 text-center mt-12">Settings page</div>} />
      {/* Legacy routes for compatibility */}
      <Route path="/identify" component={PlantIdentificationPage} />
      <Route path="/plants" component={() => <div className="p-4 text-center mt-12">Plants page</div>} />
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
