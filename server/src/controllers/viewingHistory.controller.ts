import { Request, Response } from "express";
import { errorHandler } from "@/utils/error";
import {
    updateViewingHistoryService,
    getLessonViewingHistoryService,
    getContinueWatchingCoursesService,
    getCoursesWithHistoryService,
} from "@/services/viewingHistory.service";

export async function updateViewingHistoryController(
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

        // ✅ Handle both JSON body and Blob (from sendBeacon)
        let body = req.body;
        if (req.is("text/plain") || req.is("application/octet-stream")) {
            // Handle sendBeacon Blob data
            try {
                body = typeof req.body === "string"
                    ? JSON.parse(req.body)
                    : JSON.parse(req.body.toString());
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid request body",
                });
            }
        }

        const { lessonId, videoId, currentTime, duration } = body;

        if (!lessonId || currentTime === undefined || duration === undefined) {
            return res.status(400).json({
                success: false,
                message: "lessonId, currentTime, and duration are required",
            });
        }

        const history = await updateViewingHistoryService(
            userId,
            lessonId,
            videoId || null,
            currentTime,
            duration
        );

        return res.status(200).json({
            success: true,
            message: "Viewing history updated",
            data: history,
        });
    } catch (err) {
        return errorHandler(err, "Error in updateViewingHistoryController", res);
    }
}

export async function getLessonViewingHistoryController(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const userId = req.user?.id;
        const { lessonId } = req.params;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        if (!lessonId) {
            return res.status(400).json({
                success: false,
                message: "lessonId is required",
            });
        }

        const history = await getLessonViewingHistoryService(userId, lessonId);

        return res.status(200).json({
            success: true,
            message: "Viewing history retrieved",
            data: history,
        });
    } catch (err) {
        return errorHandler(err, "Error in getLessonViewingHistoryController", res);
    }
}

export async function getContinueWatchingController(
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

        const courses = await getContinueWatchingCoursesService(userId);

        return res.status(200).json({
            success: true,
            message: "Continue watching courses retrieved",
            data: courses,
        });
    } catch (err) {
        return errorHandler(err, "Error in getContinueWatchingController", res);
    }
}

export async function getCoursesWithHistoryController(
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

        const courses = await getCoursesWithHistoryService(userId);

        return res.status(200).json({
            success: true,
            message: "Courses with history retrieved",
            data: courses,
        });
    } catch (err) {
        return errorHandler(err, "Error in getCoursesWithHistoryController", res);
    }
}