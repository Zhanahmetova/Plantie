import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Suspense, lazy } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";

// Lazy-load page components
const NotFound = lazy(() => import("@/pages/not-found"));
const Home = lazy(() => import("@/pages/home"));
const AuthPage = lazy(() => import("@/pages/auth-page"));
const PlantDetailPage = lazy(() => import("@/pages/plant-detail"));
const PlantIdentificationPage = lazy(() => import("@/pages/plant-identification"));
const RecordsPage = lazy(() => import("@/pages/records"));
const AddRecordPage = lazy(() => import("@/pages/add-record"));
const AddPlantPage = lazy(() => import("@/pages/add-plant"));
const PlantsPage = lazy(() => import("@/pages/plants"));
const SettingsPage = lazy(() => import("@/pages/settings"));
const TasksPage = lazy(() => import("@/pages/tasks-page"));
const AddTaskPage = lazy(() => import("@/pages/add-task"));
const EditTaskPage = lazy(() => import("@/pages/edit-task"));
const NotificationsPage = lazy(() => import("@/pages/notifications"));

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Home} />
      <ProtectedRoute path="/plants/:id" component={PlantDetailPage} />
      {/* Routes matching the new bottom navigation */}
      <ProtectedRoute path="/add-plant" component={AddPlantPage} />
      <ProtectedRoute path="/records" component={RecordsPage} />
      <ProtectedRoute path="/add-record" component={AddRecordPage} />
      <ProtectedRoute path="/tasks" component={TasksPage} />
      <ProtectedRoute path="/tasks/new" component={AddTaskPage} />
      <ProtectedRoute path="/tasks/:id/edit" component={EditTaskPage} />
      <ProtectedRoute path="/notifications" component={NotificationsPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      {/* Legacy routes for compatibility */}
      <ProtectedRoute path="/identify" component={PlantIdentificationPage} />
      <ProtectedRoute path="/plants" component={PlantsPage} />
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
          <Suspense fallback={<LoadingSpinner fullscreen size="lg" text="Loading..." />}>
            <Router />
          </Suspense>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
