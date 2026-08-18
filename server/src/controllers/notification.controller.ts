import {
    getUserNotificationsService,
    getRecentNotificationsService,
    getUnreadCountService,
    markNotificationAsReadService,
    markAllNotificationsAsReadService,
    deleteNotificationService,
} from "@/services/notification.service";
import { errorHandler } from "@/utils/error";
import { Request, Response } from "express";

export async function getUserNotificationsController(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const { page, limit, unreadOnly } = req.query;

        const notifications = await getUserNotificationsService(userId, {
            page: page ? parseInt(page as string) : 1,
            limit: limit ? parseInt(limit as string) : 10,
            unreadOnly: unreadOnly === 'true',
        });

        return res.status(200).json({
            success: true,
            data: notifications,
        });
    } catch (err) {
        return errorHandler(err, "Error in getUserNotificationsController", res);
    }
}

export async function getRecentNotificationsController(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

        const notifications = await getRecentNotificationsService(userId, limit);

        return res.status(200).json({
            success: true,
            data: notifications,
        });
    } catch (err) {
        return errorHandler(err, "Error in getRecentNotificationsController", res);
    }
}

export async function getUnreadCountController(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const count = await getUnreadCountService(userId);

        return res.status(200).json({
            success: true,
            data: { unreadCount: count },
        });
    } catch (err) {
        return errorHandler(err, "Error in getUnreadCountController", res);
    }
}

export async function markNotificationAsReadController(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const notification = await markNotificationAsReadService(id, userId);

        return res.status(200).json({
            success: true,
            message: "Notification marked as read",
            data: notification,
        });
    } catch (err) {
        return errorHandler(err, "Error in markNotificationAsReadController", res);
    }
}

export async function markAllNotificationsAsReadController(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        await markAllNotificationsAsReadService(userId);

        return res.status(200).json({
            success: true,
            message: "All notifications marked as read",
        });
    } catch (err) {
        return errorHandler(
            err,
            "Error in markAllNotificationsAsReadController",
            res
        );
    }
}

export async function deleteNotificationController(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        await deleteNotificationService(id, userId);

        return res.status(200).json({
            success: true,
            message: "Notification deleted successfully",
        });
    } catch (err) {
        return errorHandler(err, "Error in deleteNotificationController", res);
    }
}