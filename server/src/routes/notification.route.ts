import { Router } from "express";
import { verifyUser } from "@/middlewares/auth.middleware";
import {
    getUserNotificationsController,
    getRecentNotificationsController,
    getUnreadCountController,
    markNotificationAsReadController,
    markAllNotificationsAsReadController,
    deleteNotificationController,
} from "@/controllers/notification.controller";

const router = Router();

// All routes require authentication
router.get("/", verifyUser("ALL"), getUserNotificationsController);
router.get("/recent", verifyUser("ALL"), getRecentNotificationsController);
router.get("/unread-count", verifyUser("ALL"), getUnreadCountController);
router.put("/:id/read", verifyUser("ALL"), markNotificationAsReadController);
router.put("/read-all", verifyUser("ALL"), markAllNotificationsAsReadController);
router.delete("/:id", verifyUser("ALL"), deleteNotificationController);

export default router;