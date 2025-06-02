import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Bell, BellOff } from "lucide-react";
import { usePushNotifications } from "@/hooks/use-push-notifications";

export function NotificationSettings() {
  const { isSupported, permissionStatus, requestPermission } = usePushNotifications();

  const handleEnableNotifications = async () => {
    await requestPermission();
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Push notifications are not supported in this browser
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Get notified about watering reminders and plant care tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Enable push notifications</p>
            <p className="text-xs text-muted-foreground">
              Receive reminders even when the app is closed
            </p>
          </div>
          <div className="flex items-center gap-2">
            {permissionStatus === "granted" ? (
              <div className="flex items-center gap-2">
                <Switch checked={true} disabled />
                <span className="text-sm text-green-600">Enabled</span>
              </div>
            ) : permissionStatus === "denied" ? (
              <div className="flex items-center gap-2">
                <Switch checked={false} disabled />
                <span className="text-sm text-red-600">Denied</span>
              </div>
            ) : (
              <Button onClick={handleEnableNotifications} size="sm">
                Enable
              </Button>
            )}
          </div>
        </div>
        
        {permissionStatus === "denied" && (
          <div className="mt-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
            <p className="text-sm text-yellow-800">
              Notifications are blocked. To enable them, click the lock icon in your browser's address bar and allow notifications.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}