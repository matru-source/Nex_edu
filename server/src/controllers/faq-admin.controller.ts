import { Request, Response } from "express";
import { errorHandler } from "@/utils/error";
import {
    getAllQuestionsForAdminService,
    deleteQuestionService,
    deleteReplyService,
    createAdminReplyService,
    blockUserForLessonService,
    blockUserForCourseService,
    unblockUserService,
    getAllBlocksService,
    getUserBlocksService,
    checkUserBlockedService,
    getFaqStatsService,
} from "@/services/faq-admin.service";
import { CreateAdminReplyRequest, BlockUserRequest, CheckUserBlockedRequest } from "@/types/faq-admin.zod";

// Get all questions for admin with full details
export async function getAllQuestionsForAdminController(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const questions = await getAllQuestionsForAdminService();
        return res.status(200).json({
            success: true,
            message: "Questions fetched successfully",
            data: questions,
        });
    } catch (error) {
        return errorHandler(error, "FaqAdminController - GetAllQuestions", res);
    }
}

// Delete a question (soft delete)
export async function deleteQuestionController(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const { id } = req.params;
        const question = await deleteQuestionService(id);
        return res.status(200).json({
            success: true,
            message: "Question deleted successfully",
            data: question,
        });
    } catch (error) {
        return errorHandler(error, "FaqAdminController - DeleteQuestion", res);
    }
}

// Delete a reply (soft delete)
export async function deleteReplyController(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const { id } = req.params;
        const reply = await deleteReplyService(id);
        return res.status(200).json({
            success: true,
            message: "Reply deleted successfully",
            data: reply,
        });
    } catch (error) {
        return errorHandler(error, "FaqAdminController - DeleteReply", res);
    }
}

// Create an admin reply
export async function createAdminReplyController(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const { questionId, reply, parentId } = CreateAdminReplyRequest.parse(req.body);
        const userId = (req as any).user.id;

        const newReply = await createAdminReplyService(questionId, userId, reply, parentId);
        return res.status(201).json({
            success: true,
            message: "Admin reply created successfully",
            data: newReply,
        });
    } catch (error) {
        return errorHandler(error, "FaqAdminController - CreateAdminReply", res);
    }
}

// Block a user for FAQ
export async function blockUserController(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const { userId, lessonId, courseId, reason } = BlockUserRequest.parse(req.body);
        const blockedBy = (req as any).user.id;

        let block;
        if (lessonId) {
            block = await blockUserForLessonService(userId, lessonId, reason || null, blockedBy);
        } else if (courseId) {
            block = await blockUserForCourseService(userId, courseId, reason || null, blockedBy);
        }

        return res.status(201).json({
            success: true,
            message: `User blocked for ${lessonId ? "lesson" : "course"} FAQ successfully`,
            data: block,
        });
    } catch (error) {
        return errorHandler(error, "FaqAdminController - BlockUser", res);
    }
}

// Unblock a user
export async function unblockUserController(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const { id } = req.params;
        const block = await unblockUserService(id);
        return res.status(200).json({
            success: true,
            message: "User unblocked successfully",
            data: block,
        });
    } catch (error) {
        return errorHandler(error, "FaqAdminController - UnblockUser", res);
    }
}

// Get all blocks
export async function getAllBlocksController(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const blocks = await getAllBlocksService();
        return res.status(200).json({
            success: true,
            message: "Blocks fetched successfully",
            data: blocks,
        });
    } catch (error) {
        return errorHandler(error, "FaqAdminController - GetAllBlocks", res);
    }
}

// Get blocks for a specific user
export async function getUserBlocksController(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const { userId } = req.params;
        const blocks = await getUserBlocksService(userId);
        return res.status(200).json({
            success: true,
            message: "User blocks fetched successfully",
            data: blocks,
        });
    } catch (error) {
        return errorHandler(error, "FaqAdminController - GetUserBlocks", res);
    }
}

// Check if a user is blocked for a specific lesson
export async function checkUserBlockedController(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const { userId, lessonId } = req.query;
        const result = await checkUserBlockedService(userId as string, lessonId as string);
        return res.status(200).json({
            success: true,
            message: "Block status checked successfully",
            data: result,
        });
    } catch (error) {
        return errorHandler(error, "FaqAdminController - CheckUserBlocked", res);
    }
}

// Get FAQ statistics
export async function getFaqStatsController(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const stats = await getFaqStatsService();
        return res.status(200).json({
            success: true,
            message: "FAQ statistics fetched successfully",
            data: stats,
        });
    } catch (error) {
        return errorHandler(error, "FaqAdminController - GetFaqStats", res);
    }
}
