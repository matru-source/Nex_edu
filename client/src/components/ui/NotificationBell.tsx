import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import api from "../../lib/axios/axios";
import { API_ROUTES } from "../../lib/api";
import { Bell, CheckCheck, ExternalLink } from "lucide-react";
import { useToast } from "../../contexts/ToastContext";
import { useNavigate } from "react-router-dom";
import type { Response } from "../../types";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  createdAt: string;
}

interface RecentNotificationsResponse extends Response {
  data: Notification[];
}

interface UnreadCountResponse extends Response {
  data: { unreadCount: number };
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { success } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch recent notifications
  const { data: recentNotificationsData } = useQuery({
    queryKey: ["notifications-recent"],
    queryFn: async () => {
      const res = await api.get<RecentNotificationsResponse>(
        `${API_ROUTES.NOTIFICATION.GET_RECENT}?limit=5`
      );
      return res.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch unread count
  const { data: unreadCountData } = useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: async () => {
      const res = await api.get<UnreadCountResponse>(
        API_ROUTES.NOTIFICATION.GET_UNREAD_COUNT
      );
      return res.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const recentNotifications = recentNotificationsData?.data || [];
  const unreadCount = unreadCountData?.data?.unreadCount || 0;

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.put(API_ROUTES.NOTIFICATION.MARK_AS_READ(id));
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-recent"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications-unread-count"],
      });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const res = await api.put(API_ROUTES.NOTIFICATION.MARK_ALL_AS_READ);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-recent"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications-unread-count"],
      });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      success("All notifications marked as read");
    },
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }

    // Navigate based on notification type
    if (notification.relatedEntityType && notification.relatedEntityId) {
      if (notification.relatedEntityType === "COURSE") {
        navigate(`/course/${notification.relatedEntityId}`);
      } else if (notification.relatedEntityType === "CHAPTER") {
        navigate(`/course/lessons/${notification.relatedEntityId}`);
      } else if (notification.relatedEntityType === "LESSON") {
        // Navigate to lessons page with the lesson's chapter
        navigate(`/dashboard`);
      }
    }

    setIsOpen(false);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    if (type.includes("APPROVED")) return "✅";
    if (type.includes("REJECTED")) return "❌";
    if (type.includes("SUBMITTED")) return "📤";
    if (type.includes("PUBLISHED")) return "🎉";
    if (type.includes("CREATED")) return "👤";
    return "🔔";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-lg bg-gradient-to-br from-[var(--muted)]/40 to-[var(--accent)]/20 hover:from-[var(--primary)]/20 hover:to-[var(--ring)]/15 transition-all duration-300 text-[var(--foreground)] hover:text-[var(--primary)] hover:shadow-md hover:scale-105 active:scale-95 relative"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-[var(--destructive)] text-white rounded-full flex items-center justify-center text-xs font-bold animate-pulse shadow-lg shadow-[var(--destructive)]/50">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl z-50 max-h-[500px] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-[var(--border)] bg-gradient-to-r from-[var(--primary)]/5 to-[var(--ring)]/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--primary)]/20 to-[var(--ring)]/20 flex items-center justify-center">
                <Bell className="text-[var(--primary)]" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)]">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {unreadCount} unread
                  </p>
                )}
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  markAllAsReadMutation.mutate();
                }}
                disabled={markAllAsReadMutation.isPending}
                className="text-xs font-medium text-[var(--primary)] hover:text-[var(--primary)]/80 transition-colors px-2 py-1 hover:bg-[var(--primary)]/10 rounded-lg"
                title="Mark all as read"
              >
                <CheckCheck size={16} />
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-[400px]">
            {recentNotifications.length > 0 ? (
              <div className="divide-y divide-[var(--border)]">
                {recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 cursor-pointer transition-all duration-200 hover:bg-[var(--muted)]/50 ${
                      !notification.isRead ? "bg-[var(--primary)]/5" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)]/20 to-[var(--ring)]/20 flex items-center justify-center text-lg">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4
                            className={`text-sm font-semibold ${
                              !notification.isRead
                                ? "text-[var(--foreground)]"
                                : "text-[var(--muted-foreground)]"
                            }`}
                          >
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-[var(--primary)] rounded-full flex-shrink-0 mt-1"></span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                          {notification.relatedEntityType && (
                            <span className="text-xs px-2 py-0.5 bg-[var(--muted)] rounded-full text-[var(--muted-foreground)]">
                              {notification.relatedEntityType}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-[var(--muted-foreground)]/50 mx-auto mb-3" />
                <p className="text-sm text-[var(--muted-foreground)]">
                  No notifications yet
                </p>
              </div>
            )}
          </div>

          {/* Footer - View All Button */}
          {recentNotifications.length > 0 && (
            <div className="p-3 border-t border-[var(--border)] bg-[var(--muted)]/20">
              <button
                onClick={() => {
                  navigate("/notifications");
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-sm font-semibold text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                View All Notifications
                <ExternalLink size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
