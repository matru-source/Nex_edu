import {
    createQuizService,
    getQuizzesByChapterIdService,
    getQuizzesByCourseIdService,
    getQuizByIdService,
    createQuizAttemptService,
    submitQuizAttemptService,
    getQuizAttemptByIdService,
    getQuizAttemptsByUserIdService,
    getAllQuizzesService,
    updateQuizService,
    deleteQuizService,
    getQuizAttemptsByQuizIdService,
    getQuizStatisticsService,
    getPublicQuizzesService,
    abandonQuizAttemptService,
    getQuizAttemptDetailsService,
    getExistingInProgressAttemptService
} from "@/services/quiz.service";
import { errorHandler } from "@/utils/error";
import { Request, Response } from "express";
import { CreateQuizRequest, UpdateQuizRequest, SubmitQuizAttemptRequest } from "@/types/zod";

export async function createQuizController(req: Request, res: Response): Promise<Response> {
    try {
        const validatedData = CreateQuizRequest.parse(req.body);
        const data = await createQuizService(
            validatedData.title,
            validatedData.description,
            validatedData.instruction,
            validatedData.duration,
            validatedData.maxAttempts,
            validatedData.passingScore,
            validatedData.allowReview,
            validatedData.showResultsImmediately || true,
            validatedData.chapterId, // Required
            validatedData.questions,
            req.user?.id
        );

        return res.status(200).json({
            success: true,
            message: "Quiz created successfully",
            data: data
        });
    } catch (err) {
        return errorHandler(err, "Error in createQuizController", res);
    }
}

// Remove getQuizzesByLessonIdController

export async function getQuizzesByChapterIdController(req: Request, res: Response): Promise<Response> {
    try {
        const { chapterId } = req.params;

        if (!chapterId) {
            return res.status(400).json({
                success: false,
                message: "Chapter ID is required"
            });
        }

        const data = await getQuizzesByChapterIdService(chapterId);

        return res.status(200).json({
            success: true,
            message: "Quizzes retrieved successfully",
            data: data
        });
    } catch (error) {
        return errorHandler(error, "Error in getQuizzesByChapterIdController", res);
    }
}

// NEW: Get quizzes by course ID (for students)
export async function getQuizzesByCourseIdController(req: Request, res: Response): Promise<Response> {
    try {
        const { courseId } = req.params;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "Course ID is required"
            });
        }

        const data = await getQuizzesByCourseIdService(courseId);

        return res.status(200).json({
            success: true,
            message: "Quizzes retrieved successfully",
            data: data
        });
    } catch (error) {
        return errorHandler(error, "Error in getQuizzesByCourseIdController", res);
    }
}

export async function getQuizByIdController(req: Request, res: Response): Promise<Response> {
    try {
        const { quizId } = req.params;

        if (!quizId) {
            return res.status(400).json({
                success: false,
                message: "Quiz ID is required"
            });
        }

        const data = await getQuizByIdService(quizId, false);

        return res.status(200).json({
            success: true,
            message: "Quiz retrieved successfully",
            data: data
        });
    } catch (error) {
        return errorHandler(error, "Error in getQuizByIdController", res);
    }
}

export async function createQuizAttemptController(req: Request, res: Response): Promise<Response> {
    try {
        const { quizId } = req.params;
        const { id } = req.user;

        if (!id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        if (!quizId) {
            return res.status(400).json({
                success: false,
                message: "Quiz ID is required"
            });
        }

        const data = await createQuizAttemptService(quizId, id);

        return res.status(200).json({
            success: true,
            message: "Quiz attempt created successfully",
            data: data
        });
    } catch (error) {
        return errorHandler(error, "Error in createQuizAttemptController", res);
    }
}

export async function submitQuizAttemptController(req: Request, res: Response): Promise<Response> {
    try {
        const { attemptId } = req.params;
        const { answers } = SubmitQuizAttemptRequest.parse(req.body);
        const { id } = req.user;

        if (!id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        if (!attemptId) {
            return res.status(400).json({
                success: false,
                message: "Attempt ID is required"
            });
        }

        const data = await submitQuizAttemptService(attemptId, id, answers);

        return res.status(200).json({
            success: true,
            message: "Quiz submitted successfully",
            data: data // Returns instant results
        });
    } catch (error) {
        return errorHandler(error, "Error in submitQuizAttemptController", res);
    }
}

export async function getQuizAttemptByIdController(req: Request, res: Response): Promise<Response> {
    try {
        const { attemptId } = req.params;
        const { id } = req.user;

        if (!id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        if (!attemptId) {
            return res.status(400).json({
                success: false,
                message: "Attempt ID is required"
            });
        }

        const data = await getQuizAttemptByIdService(attemptId, id);

        return res.status(200).json({
            success: true,
            message: "Quiz attempt retrieved successfully",
            data: data
        });
    } catch (error) {
        return errorHandler(error, "Error in getQuizAttemptByIdController", res);
    }
}

export async function getQuizAttemptsByUserIdController(req: Request, res: Response): Promise<Response> {
    try {
        const { id } = req.user;

        if (!id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const data = await getQuizAttemptsByUserIdService(id);

        return res.status(200).json({
            success: true,
            message: "Quiz attempts retrieved successfully",
            data: data
        });
    } catch (error) {
        return errorHandler(error, "Error in getQuizAttemptsByUserIdController", res);
    }
}

// NEW: Get all attempts for a quiz (admin)
export async function getQuizAttemptsByQuizIdController(req: Request, res: Response): Promise<Response> {
    try {
        const { quizId } = req.params;

        if (!quizId) {
            return res.status(400).json({
                success: false,
                message: "Quiz ID is required"
            });
        }

        const data = await getQuizAttemptsByQuizIdService(quizId);

        return res.status(200).json({
            success: true,
            message: "Quiz attempts retrieved successfully",
            data: data
        });
    } catch (error) {
        return errorHandler(error, "Error in getQuizAttemptsByQuizIdController", res);
    }
}

// NEW: Get quiz statistics (admin)
export async function getQuizStatisticsController(req: Request, res: Response): Promise<Response> {
    try {
        const { quizId } = req.params;

        if (!quizId) {
            return res.status(400).json({
                success: false,
                message: "Quiz ID is required"
            });
        }

        const data = await getQuizStatisticsService(quizId);

        return res.status(200).json({
            success: true,
            message: "Quiz statistics retrieved successfully",
            data: data
        });
    } catch (error) {
        return errorHandler(error, "Error in getQuizStatisticsController", res);
    }
}

export async function getAllQuizzesController(req: Request, res: Response): Promise<Response> {
    try {
        const data = await getAllQuizzesService();

        return res.status(200).json({
            success: true,
            message: "Quizzes retrieved successfully",
            data: data
        });
    } catch (error) {
        return errorHandler(error, "Error in getAllQuizzesController", res);
    }
}

export async function updateQuizController(req: Request, res: Response): Promise<Response> {
    try {
        const { quizId } = req.params;
        const validatedData = UpdateQuizRequest.parse(req.body);

        if (!quizId) {
            return res.status(400).json({
                success: false,
                message: "Quiz ID is required"
            });
        }

        const data = await updateQuizService(quizId, validatedData);

        return res.status(200).json({
            success: true,
            message: "Quiz updated successfully",
            data: data
        });
    } catch (err) {
        return errorHandler(err, "Error in updateQuizController", res);
    }
}

export async function deleteQuizController(req: Request, res: Response): Promise<Response> {
    try {
        const { quizId } = req.params;

        if (!quizId) {
            return res.status(400).json({
                success: false,
                message: "Quiz ID is required"
            });
        }

        await deleteQuizService(quizId);

        return res.status(200).json({
            success: true,
            message: "Quiz deleted successfully"
        });
    } catch (err) {
        return errorHandler(err, "Error in deleteQuizController", res);
    }
}

// NEW: Public quiz listing (no auth required)
export async function getPublicQuizzesController(req: Request, res: Response): Promise<Response> {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 12;
        const search = req.query.search as string | undefined;
        const sortBy = (req.query.sortBy as 'latest' | 'popular') || 'latest';

        const data = await getPublicQuizzesService(page, limit, search, sortBy);

        return res.status(200).json({
            success: true,
            message: "Quizzes retrieved successfully",
            data: data.quizzes,
            pagination: {
                page: data.page,
                limit: data.limit,
                total: data.total,
                totalPages: data.totalPages
            }
        });
    } catch (error) {
        return errorHandler(error, "Error in getPublicQuizzesController", res);
    }
}

// NEW: Abandon quiz attempt (for tab switching)
export async function abandonQuizAttemptController(req: Request, res: Response): Promise<Response> {
    try {
        const { attemptId } = req.params;
        const { answers } = req.body;
        const { id } = req.user;

        if (!id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        if (!attemptId) {
            return res.status(400).json({
                success: false,
                message: "Attempt ID is required"
            });
        }

        const data = await abandonQuizAttemptService(attemptId, id, answers);

        return res.status(200).json({
            success: true,
            message: "Quiz attempt abandoned",
            data: data
        });
    } catch (error) {
        return errorHandler(error, "Error in abandonQuizAttemptController", res);
    }
}

// NEW: Get detailed quiz attempt (for result pages)
export async function getQuizAttemptDetailsController(req: Request, res: Response): Promise<Response> {
    try {
        const { attemptId } = req.params;
        const { id, role } = req.user;

        if (!id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        if (!attemptId) {
            return res.status(400).json({
                success: false,
                message: "Attempt ID is required"
            });
        }

        const isAdmin = role === 'ADMIN';
        const data = await getQuizAttemptDetailsService(attemptId, id, isAdmin);

        return res.status(200).json({
            success: true,
            message: "Quiz attempt details retrieved successfully",
            data: data
        });
    } catch (error) {
        return errorHandler(error, "Error in getQuizAttemptDetailsController", res);
    }
}

// NEW: Check for existing in-progress attempt
export async function getExistingAttemptController(req: Request, res: Response): Promise<Response> {
    try {
        const { quizId } = req.params;
        const { id } = req.user;

        if (!id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        if (!quizId) {
            return res.status(400).json({
                success: false,
                message: "Quiz ID is required"
            });
        }

        const data = await getExistingInProgressAttemptService(quizId, id);

        return res.status(200).json({
            success: true,
            message: data ? "Existing attempt found" : "No existing attempt",
            data: data
        });
    } catch (error) {
        return errorHandler(error, "Error in getExistingAttemptController", res);
    }
}