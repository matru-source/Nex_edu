import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/axios/axios";
import { API_ROUTES } from "../../lib/api";
import TopBar from "../lazy/TopBar";
import useInitNavStackOnce from "../../hooks/useInitNavstack";
import { useToast } from "../../contexts/ToastContext";
import {
  Bell,
  CheckCheck,
  Trash2,
} from "lucide-react";
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

interface NotificationsResponse extends Response {
  data: {
    notifications: Notification[];
    total: number;
    unreadCount: number;
  };
}

export default function Notifications() {
  useInitNavStackOnce([{ title: "Notifications", path: "/notifications" }]);
  const { success } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ["notifications", filter, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (filter === "unread") {
        params.append("unreadOnly", "true");
      }

      const res = await api.get<NotificationsResponse>(
        `${API_ROUTES.NOTIFICATION.GET_ALL}?${params.toString()}`
      );
      return res.data;
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.put(API_ROUTES.NOTIFICATION.MARK_AS_READ(id));
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-recent"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications-unread-count"],
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const res = await api.put(API_ROUTES.NOTIFICATION.MARK_ALL_AS_READ);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-recent"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications-unread-count"],
      });
      success("All notifications marked as read");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(API_ROUTES.NOTIFICATION.DELETE(id));
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-recent"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications-unread-count"],
      });
      success("Notification deleted");
    },
  });

  const notifications = notificationsData?.data?.notifications || [];
  const total = notificationsData?.data?.total || 0;
  const unreadCount = notificationsData?.data?.unreadCount || 0;
  const totalPages = Math.ceil(total / limit);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
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
    <div className="bg-[var(--background)] min-h-screen">
      <TopBar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--ring)]/20 flex items-center justify-center">
              <Bell className="text-[var(--primary)]" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--foreground)]">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <p className="text-sm text-[var(--muted-foreground)]">
                  {unreadCount} unread notification
                  {unreadCount !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              className="px-4 py-2 bg-gradient-to-r from-[var(--primary)] to-[var(--ring)] text-[var(--primary-foreground)] rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <CheckCheck size={16} />
              Mark All as Read
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => {
              setFilter("all");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "all"
                ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            All ({total})
          </button>
          <button
            onClick={() => {
              setFilter("unread");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "unread"
                ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-20 bg-[var(--muted)] rounded-lg"
                  ></div>
                ))}
              </div>
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y divide-[var(--border)]">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-[var(--muted)]/50 transition-colors ${
                    !notification.isRead ? "bg-[var(--primary)]/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)]/20 to-[var(--ring)]/20 flex items-center justify-center text-xl">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3
                          className={`font-semibold ${
                            !notification.isRead
                              ? "text-[var(--foreground)]"
                              : "text-[var(--muted-foreground)]"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-[var(--primary)] rounded-full"></span>
                          )}
                          <button
                            onClick={() =>
                              deleteMutation.mutate(notification.id)
                            }
                            className="p-1.5 hover:bg-[var(--destructive)]/10 rounded-lg text-[var(--destructive)] transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-[var(--muted-foreground)] mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[var(--muted-foreground)]">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                        <div className="flex items-center gap-2">
                          {notification.relatedEntityType && (
                            <span className="text-xs px-2 py-1 bg-[var(--muted)] rounded-full text-[var(--muted-foreground)]">
                              {notification.relatedEntityType}
                            </span>
                          )}
                          {!notification.isRead && (
                            <button
                              onClick={() =>
                                markAsReadMutation.mutate(notification.id)
                              }
                              className="text-xs px-2 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg hover:bg-[var(--primary)]/20 transition-colors font-medium"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Bell className="w-16 h-16 text-[var(--muted-foreground)]/50 mx-auto mb-4" />
              <p className="text-lg font-medium text-[var(--foreground)] mb-2">
                No notifications
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">
                {filter === "unread"
                  ? "You're all caught up! No unread notifications."
                  : "You don't have any notifications yet."}
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-[var(--border)] flex items-center justify-between">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-[var(--border)] rounded-lg text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-[var(--muted-foreground)]">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-[var(--border)] rounded-lg text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
