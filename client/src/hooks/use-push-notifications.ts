import { useEffect, useState } from "react";
import { requestNotificationPermission, onForegroundMessage } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export function usePushNotifications() {
  const [token, setToken] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>("default");
  const { toast } = useToast();

  useEffect(() => {
    // Check if push notifications are supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermissionStatus(Notification.permission);
    }

    // Listen for foreground messages
    onForegroundMessage((payload) => {
      toast({
        title: payload.notification?.title || "Plant Care Reminder",
        description: payload.notification?.body || "You have a new notification",
        duration: 5000,
      });
    });
  }, [toast]);

  const requestPermission = async () => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Push notifications are not supported in this browser",
        variant: "destructive",
      });
      return null;
    }

    try {
      const fcmToken = await requestNotificationPermission();
      if (fcmToken) {
        setToken(fcmToken);
        setPermissionStatus("granted");
        
        // Send token to backend to store for the user
        await fetch("/api/notifications/fcm-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: fcmToken }),
        });

        toast({
          title: "Notifications Enabled",
          description: "You'll now receive push notifications for plant care reminders",
        });
        
        return fcmToken;
      } else {
        setPermissionStatus("denied");
        toast({
          title: "Permission Denied",
          description: "Please enable notifications in your browser settings",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      toast({
        title: "Error",
        description: "Failed to enable push notifications",
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    token,
    isSupported,
    permissionStatus,
    requestPermission,
  };
}