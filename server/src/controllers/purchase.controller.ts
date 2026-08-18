import { Request, Response } from "express";
import { errorHandler } from "@/utils/error";
import {
    createPurchaseService,
    getUserPurchasesService,
    getUserPurchasedChaptersService,
    checkChapterPurchaseStatusService,
    getChapterByIdService,
    getCoursePurchasedChaptersService,
    checkCoursePurchaseStatusService,
    getPurchasedCoursesService,
    getUserPurchasesWithHierarchyService,
} from "@/services/purchase.service";

export async function createPurchaseController(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const { chapterId } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        if (!chapterId) {
            return res.status(400).json({
                success: false,
                message: "Chapter ID is required",
            });
        }

        // Get chapter to get the price
        const chapter = await getChapterByIdService(chapterId);

        // Create purchase
        const purchase = await createPurchaseService(
            userId,
            chapterId,
            chapter.price
        );

        return res.status(201).json({
            success: true,
            message: "Chapter purchased successfully",
            data: purchase,
        });
    } catch (err) {
        return errorHandler(err, "Error in createPurchaseController", res);
    }
}

export async function getUserPurchasesController(
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

        const purchases = await getUserPurchasesService(userId);

        return res.status(200).json({
            success: true,
            message: "Purchases retrieved successfully",
            data: purchases,
        });
    } catch (err) {
        return errorHandler(err, "Error in getUserPurchasesController", res);
    }
}

export async function getUserPurchasedChaptersController(
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

        const chapterIds = await getUserPurchasedChaptersService(userId);

        return res.status(200).json({
            success: true,
            message: "Purchased chapters retrieved successfully",
            data: chapterIds,
        });
    } catch (err) {
        return errorHandler(err, "Error in getUserPurchasedChaptersController", res);
    }
}

export async function checkChapterPurchaseStatusController(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const { chapterId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        if (!chapterId) {
            return res.status(400).json({
                success: false,
                message: "Chapter ID is required",
            });
        }

        const isPurchased = await checkChapterPurchaseStatusService(userId, chapterId);

        return res.status(200).json({
            success: true,
            message: "Purchase status retrieved successfully",
            data: { isPurchased },
        });
    } catch (err) {
        return errorHandler(err, "Error in checkChapterPurchaseStatusController", res);
    }
}

export async function checkCoursePurchaseStatusController(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const { courseId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "Course ID is required",
            });
        }

        const isPurchased = await checkCoursePurchaseStatusService(userId, courseId);
        const purchasedChapters = await getCoursePurchasedChaptersService(userId, courseId);

        return res.status(200).json({
            success: true,
            message: "Course purchase status retrieved successfully",
            data: {
                isPurchased,
                purchasedChapters
            },
        });
    } catch (err) {
        return errorHandler(err, "Error in checkCoursePurchaseStatusController", res);
    }
}

export async function getPurchasedCoursesController(
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

        const courses = await getPurchasedCoursesService(userId);

        return res.status(200).json({
            success: true,
            message: "Purchased courses retrieved successfully",
            data: courses,
        });
    } catch (err) {
        return errorHandler(err, "Error in getPurchasedCoursesController", res);
    }
}

export async function getUserPurchasesWithHierarchyController(
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

        const courses = await getUserPurchasesWithHierarchyService(userId);

        return res.status(200).json({
            success: true,
            message: "Purchases with hierarchy retrieved successfully",
            data: courses,
        });
    } catch (err) {
        return errorHandler(err, "Error in getUserPurchasesWithHierarchyController", res);
    }
}