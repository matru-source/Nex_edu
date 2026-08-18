import {
    createQuizController,
    getQuizzesByChapterIdController,
    getQuizzesByCourseIdController,
    getQuizByIdController,
    createQuizAttemptController,
    submitQuizAttemptController,
    getQuizAttemptByIdController,
    getQuizAttemptsByUserIdController,
    getAllQuizzesController,
    updateQuizController,
    deleteQuizController,
    getQuizAttemptsByQuizIdController,
    getQuizStatisticsController,
    getPublicQuizzesController,
    abandonQuizAttemptController,
    getQuizAttemptDetailsController,
    getExistingAttemptController
} from "@/controllers/quiz.controller";
import { verifyUser } from "@/middlewares/auth.middleware";
import validateInput from "@/middlewares/inputValidation.middleware";
import { CreateQuizRequest, UpdateQuizRequest, SubmitQuizAttemptRequest } from "@/types/zod";
import { Router } from "express";

const router = Router();

// PUBLIC: Get all quizzes (no auth required)
router.get("/public/explore", getPublicQuizzesController);

// Quiz CRUD routes (Admin only)
router.post("/create", verifyUser('ADMIN'), validateInput(CreateQuizRequest), createQuizController);
router.get("/all", verifyUser('ADMIN'), getAllQuizzesController);
router.get("/:quizId", verifyUser('ADMIN', 'STUDENT'), getQuizByIdController);
router.put("/:quizId", verifyUser('ADMIN'), validateInput(UpdateQuizRequest), updateQuizController);
router.delete("/:quizId", verifyUser('ADMIN'), deleteQuizController);

// Get quizzes by chapter/course
router.get("/chapter/:chapterId", verifyUser('ADMIN'), getQuizzesByChapterIdController);
router.get("/course/:courseId", verifyUser('STUDENT'), getQuizzesByCourseIdController); // NEW

// Quiz attempt routes (Student)
router.post("/:quizId/attempt", verifyUser('STUDENT'), createQuizAttemptController);
router.post("/attempt/:attemptId/submit", verifyUser('STUDENT'), validateInput(SubmitQuizAttemptRequest), submitQuizAttemptController);
router.post("/attempt/:attemptId/abandon", verifyUser('STUDENT'), abandonQuizAttemptController); // NEW: Abandon attempt
router.get("/attempt/:attemptId", verifyUser('STUDENT'), getQuizAttemptByIdController);
router.get("/attempt/:attemptId/details", verifyUser('ADMIN', 'STUDENT'), getQuizAttemptDetailsController); // NEW: Detailed attempt
router.get("/attempts/my", verifyUser('STUDENT'), getQuizAttemptsByUserIdController);
router.get("/:quizId/existing-attempt", verifyUser('STUDENT'), getExistingAttemptController); // NEW: Check existing

// Admin quiz analytics routes
router.get("/:quizId/attempts", verifyUser('ADMIN'), getQuizAttemptsByQuizIdController); // NEW
router.get("/:quizId/statistics", verifyUser('ADMIN'), getQuizStatisticsController); // NEW

export default router;