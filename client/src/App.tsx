import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import AuthPage from "@/pages/auth-page";
import PlantDetailPage from "@/pages/plant-detail";
import PlantIdentificationPage from "@/pages/plant-identification";
import RecordsPage from "@/pages/records";
import AddRecordPage from "@/pages/add-record";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Home} />
      <ProtectedRoute path="/plants/:id" component={PlantDetailPage} />
      {/* Routes matching the new bottom navigation */}
      <ProtectedRoute path="/favorites" component={() => <div className="p-4 text-center mt-12">Favorites page</div>} />
      <ProtectedRoute path="/add-plant" component={PlantIdentificationPage} />
      <ProtectedRoute path="/records" component={RecordsPage} />
      <ProtectedRoute path="/add-record" component={AddRecordPage} />
      <ProtectedRoute path="/settings" component={() => <div className="p-4 text-center mt-12">Settings page</div>} />
      {/* Legacy routes for compatibility */}
      <ProtectedRoute path="/identify" component={PlantIdentificationPage} />
      <ProtectedRoute path="/plants" component={() => <div className="p-4 text-center mt-12">Plants page</div>} />
      {/* Authentication route */}
      <Route path="/auth" component={AuthPage} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
