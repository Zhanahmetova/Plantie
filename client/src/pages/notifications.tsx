import React from "react";
import MainLayout from "@/components/layouts/main-layout";
import PageHeader from "@/components/ui/page-header";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, useDeleteNotification } from "@/hooks/use-notifications";
import { BellIcon, TasksIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const NotificationsPage: React.FC = () => {
  const [, navigate] = useLocation();
  const { data: notifications, isLoading } = useNotifications();
  const markAsRead = useMarkNotificationRead();
  const markAllAsRead = useMarkAllNotificationsRead();
  const deleteNotification = useDeleteNotification();

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  const handleMarkAsRead = (notificationId: number) => {
    markAsRead.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const handleDeleteNotification = (notificationId: number) => {
    deleteNotification.mutate(notificationId);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_due':
      case 'task_overdue':
        return <TasksIcon className="w-5 h-5 text-orange-500" />;
      default:
        return <BellIcon className="w-5 h-5 text-blue-500" />;
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-4 space-y-5">
          <PageHeader title="Notifications" showBackButton onBackClick={() => navigate("/")} />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="h-4 w-3/4 bg-muted rounded mb-2"></div>
                <div className="h-3 w-1/2 bg-muted rounded"></div>
              </Card>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-4 space-y-5">
        <PageHeader title="Notifications" showBackButton onBackClick={() => navigate("/")} />
        
        {notifications && notifications.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BellIcon className="w-5 h-5" />
              <span className="text-sm text-muted-foreground">
                {unreadCount} unread
              </span>
            </div>
            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllAsRead}
                disabled={markAllAsRead.isPending}
                variant="outline"
                size="sm"
              >
                Mark All Read
              </Button>
            )}
          </div>
        )}

        <div className="space-y-3">
          {notifications && notifications.length > 0 ? (
            notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={cn(
                  "p-4 transition-all duration-200 cursor-pointer hover:shadow-md",
                  !notification.isRead && "bg-blue-50 border-blue-200"
                )}
                onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={cn(
                          "font-medium text-sm",
                          !notification.isRead && "text-foreground",
                          notification.isRead && "text-muted-foreground"
                        )}>
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <Badge variant="secondary" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className={cn(
                        "text-sm mb-2",
                        !notification.isRead && "text-foreground",
                        notification.isRead && "text-muted-foreground"
                      )}>
                        {notification.message}
                      </p>
                      {notification.plantName && (
                        <div className="text-xs text-muted-foreground mb-1">
                          Plant: {notification.plantName}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNotification(notification.id);
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    disabled={deleteNotification.isPending}
                  >
                    ×
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center">
              <BellIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-lg mb-2">No notifications</h3>
              <p className="text-muted-foreground text-sm">
                You'll see task reminders and plant care notifications here
              </p>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default NotificationsPage;