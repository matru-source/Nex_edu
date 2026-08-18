import { AppError } from "@/utils/error/errors";
import { prisma } from "@/utils/prisma";
import { Notification, NotificationType, EntityType } from "@prisma/client";

export interface CreateNotificationData {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    relatedEntityType?: EntityType;
    relatedEntityId?: string;
}

export async function createNotificationService(
    data: CreateNotificationData
): Promise<Notification> {
    const notification = await prisma.notification.create({
        data: {
            userId: data.userId,
            type: data.type,
            title: data.title,
            message: data.message,
            relatedEntityType: data.relatedEntityType || null,
            relatedEntityId: data.relatedEntityId || null,
        },
    });

    return notification;
}

export async function getUserNotificationsService(
    userId: string,
    options: {
        page?: number;
        limit?: number;
        unreadOnly?: boolean;
    } = {}
): Promise<{ notifications: Notification[]; total: number; unreadCount: number }> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (options.unreadOnly) {
        where.isRead = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
        prisma.notification.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.notification.count({ where: { userId } }),
        prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return { notifications, total, unreadCount };
}

export async function getRecentNotificationsService(
    userId: string,
    limit: number = 5
): Promise<Notification[]> {
    const notifications = await prisma.notification.findMany({
        where: { userId },
        take: limit,
        orderBy: { createdAt: 'desc' },
    });

    return notifications;
}

export async function getUnreadCountService(userId: string): Promise<number> {
    const count = await prisma.notification.count({
        where: { userId, isRead: false },
    });

    return count;
}

export async function markNotificationAsReadService(
    notificationId: string,
    userId: string
): Promise<Notification> {
    // Verify ownership
    const notification = await prisma.notification.findFirst({
        where: { id: notificationId, userId },
    });

    if (!notification) {
        throw new AppError("Notification not found", 404);
    }

    const updated = await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true, readAt: new Date() },
    });

    return updated;
}

export async function markAllNotificationsAsReadService(
    userId: string
): Promise<void> {
    await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true, readAt: new Date() },
    });
}

export async function deleteNotificationService(
    notificationId: string,
    userId: string
): Promise<void> {
    // Verify ownership
    const notification = await prisma.notification.findFirst({
        where: { id: notificationId, userId },
    });

    if (!notification) {
        throw new AppError("Notification not found", 404);
    }

    await prisma.notification.delete({
        where: { id: notificationId },
    });
}