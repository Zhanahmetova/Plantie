import React, { useState } from "react";
import MainLayout from "@/components/layouts/main-layout";
import PageHeader from "@/components/ui/page-header";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWeatherPreferences, useLocationPermission, useCreateWeatherPreference, useUpdateWeatherPreference } from "@/hooks/use-weather";
import { NotificationSettings } from "@/components/notification-settings";

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;

const SettingsPage: React.FC = () => {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Weather settings
  const { data: weatherPreferences } = useWeatherPreferences();
  const { locationStatus, coordinates, requestLocation } = useLocationPermission();
  const createPreferences = useCreateWeatherPreference();
  const updatePreferences = useUpdateWeatherPreference();
  const [manualLocation, setManualLocation] = useState("");
  const [weatherUnit, setWeatherUnit] = useState<"metric" | "imperial">("metric");

  const form = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: PasswordChangeFormData) => {
    setIsSubmitting(true);
    try {
      const response = await apiRequest("/api/user/change-password", {
        method: "POST",
        body: {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        },
      });
      
      toast({
        title: "Success!",
        description: "Your password has been updated successfully",
      });
      
      form.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Please check your current password and try again";
      
      toast({
        title: "Failed to update password",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLocationRequest = async () => {
    if (coordinates) {
      try {
        await apiRequest("/api/weather/coordinates", {
          method: "POST",
          body: { lat: coordinates.lat, lon: coordinates.lon, unit: weatherUnit }
        });
        toast({
          title: "Location saved!",
          description: "Your weather location has been updated",
        });
      } catch (error) {
        toast({
          title: "Failed to save location",
          description: "Please try again",
          variant: "destructive",
        });
      }
    } else {
      requestLocation();
    }
  };

  const handleManualLocation = async () => {
    if (!manualLocation.trim()) return;
    
    try {
      if (weatherPreferences) {
        await updatePreferences.mutateAsync({
          location: manualLocation.trim(),
          unit: weatherUnit
        });
      } else {
        await createPreferences.mutateAsync({
          userId: 0, // This will be set by the server
          location: manualLocation.trim(),
          unit: weatherUnit
        });
      }
      
      toast({
        title: "Location saved!",
        description: "Your weather location has been updated",
      });
      
      setManualLocation("");
    } catch (error) {
      toast({
        title: "Failed to save location",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <div className="p-4 space-y-5">
        <PageHeader title="Settings" showBackButton onBackClick={() => navigate("/")} />
        
        <Card className="p-5">
          <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
          
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Label>Username</Label>
              <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                {user?.username || "Loading..."}
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Label>Email</Label>
              <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                {user?.email || "No email set"}
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="p-5">
          <h2 className="text-xl font-semibold mb-1">Weather Settings</h2>
          <p className="text-sm text-muted-foreground mb-4">Manage your weather location and preferences</p>
          
          <Separator className="mb-4" />
          
          <div className="space-y-4">
            {weatherPreferences && (
              <div className="flex flex-col space-y-2">
                <Label>Current Location</Label>
                <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                  {weatherPreferences.location}
                </div>
                <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                  Unit: {weatherPreferences.unit === "metric" ? "Celsius" : "Fahrenheit"}
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <Label>Update Location</Label>
              
              {locationStatus === 'not-requested' && (
                <Button onClick={handleLocationRequest} className="w-full">
                  Use My Current Location
                </Button>
              )}
              
              {locationStatus === 'requesting' && (
                <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
                  Requesting location access...
                </div>
              )}
              
              {locationStatus === 'granted' && coordinates && (
                <Button onClick={handleLocationRequest} className="w-full">
                  Save Current Location
                </Button>
              )}
              
              <div className="space-y-2">
                <Label>Or enter manually:</Label>
                <Input
                  placeholder="City, Country (e.g., London, UK)"
                  value={manualLocation}
                  onChange={(e) => setManualLocation(e.target.value)}
                  className="w-full"
                />
                <div className="flex gap-2">
                  <Select value={weatherUnit} onValueChange={(value) => setWeatherUnit(value as "metric" | "imperial")}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="metric">Celsius</SelectItem>
                      <SelectItem value="imperial">Fahrenheit</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleManualLocation} 
                    disabled={!manualLocation.trim() || createPreferences.isPending || updatePreferences.isPending}
                    className="flex-1"
                  >
                    {createPreferences.isPending || updatePreferences.isPending ? "Saving..." : "Save Location"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        <NotificationSettings />
        
        <Card className="p-5">
          <h2 className="text-xl font-semibold mb-1">Security</h2>
          <p className="text-sm text-muted-foreground mb-4">Update your password</p>
          
          <Separator className="mb-4" />
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Enter your current password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Enter new password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Confirm new password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full mt-2 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </Form>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;