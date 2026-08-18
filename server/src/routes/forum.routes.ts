import { CreateLessonQuestionController, CreateQuestionReplyController, getAllQuestionsController, getFaqByLessonIdController, getQuestionTreeController } from "@/controllers/forum.controller";
import { verifyUser } from "@/middlewares/auth.middleware";
import validateInput from "@/middlewares/inputValidation.middleware";
import { CreateLessonQuestionRequest, CreateQuestionReplyRequest } from "@/types/zod";
import { Router } from "express";
const router = Router();

router.post("/lesson-question", verifyUser("ALL"), validateInput(CreateLessonQuestionRequest), CreateLessonQuestionController);
router.post("/question-reply", verifyUser("ALL"), validateInput(CreateQuestionReplyRequest), CreateQuestionReplyController);
router.get("/question-tree/:questionId", verifyUser("ALL"), getQuestionTreeController);
router.get("/faq/:lessonId", verifyUser("ALL"), getFaqByLessonIdController);
router.get("/questions", verifyUser("ALL"), getAllQuestionsController);

export default router;