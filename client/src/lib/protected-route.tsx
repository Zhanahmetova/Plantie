import { useAuth } from "@/hooks/use-auth";
import { Redirect, Route } from "wouter";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import React, { ComponentType, LazyExoticComponent } from "react";

type ComponentProp = 
  | (() => React.JSX.Element) 
  | LazyExoticComponent<ComponentType<any>>;

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: ComponentProp;
}) {
  const { user, isLoading } = useAuth();

  // Function to render with proper type handling
  const renderComponent = () => {
    const Comp = Component as any;
    return <Comp />;
  };

  return (
    <Route path={path}>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" text="Loading..." />
        </div>
      ) : user ? (
        renderComponent()
      ) : (
        <Redirect to="/auth" />
      )}
    </Route>
  );
}