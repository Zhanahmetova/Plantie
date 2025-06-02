import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export interface Notification {
  id: number;
  userId: number;
  taskId: number;
  plantId: number;
  type: 'task_due' | 'task_overdue' | 'plant_care';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  scheduledFor?: string;
  plantName?: string;
  taskType?: string;
}

export function useNotifications() {
  return useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    refetchInterval: 60000, // Refetch every minute for real-time updates
  });
}

export function useMarkNotificationRead() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to mark notification as read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/notifications/read-all", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to mark all notifications as read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteNotification() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to delete notification");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
      toast({
        title: "Success",
        description: "Notification deleted",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    },
  });
}

export function useNotificationPermission() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async () => {
      if (!("Notification" in window)) {
        throw new Error("This browser does not support notifications");
      }
      
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("Notification permission denied");
      }
      
      return permission;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Notifications enabled",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useServiceWorker() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async () => {
      if (!("serviceWorker" in navigator)) {
        throw new Error("Service workers are not supported");
      }
      
      const registration = await navigator.serviceWorker.register("/sw.js");
      return registration;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Service worker registered",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to register service worker",
        variant: "destructive",
      });
    },
  });
}