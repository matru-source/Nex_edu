import { Router } from "express";
import { verifyUser } from "@/middlewares/auth.middleware";
import {
    updateViewingHistoryController,
    getLessonViewingHistoryController,
    getContinueWatchingController,
    getCoursesWithHistoryController,
} from "@/controllers/viewingHistory.controller";

const router = Router();

router.post("/update", verifyUser("STUDENT"), updateViewingHistoryController);
router.get(
    "/lesson/:lessonId",
    verifyUser("STUDENT"),
    getLessonViewingHistoryController
);
router.get(
    "/continue-watching",
    verifyUser("STUDENT"),
    getContinueWatchingController
);
router.get("/courses", verifyUser("STUDENT"), getCoursesWithHistoryController);

export default router;