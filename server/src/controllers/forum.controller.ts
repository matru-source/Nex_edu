import { createLessonQuestionService, createQuestionReplyService, getFaqByLessonIdService, getQuestionRepliesService, getQuestionService } from "@/services/fourm.service";
import { CreateLessonQuestionRequest, CreateQuestionReplyRequest } from "@/types/zod";
import { errorHandler } from "@/utils/error";
import { Request, Response } from "express";

export async function CreateLessonQuestionController(req: Request, res: Response): Promise<Response> {
  try {
    const { lessonId, userId, question } = CreateLessonQuestionRequest.parse(req.body);

    const createdQuestion = await createLessonQuestionService(lessonId, userId, question);

    return res.status(200).json({
      success: true,
      message: "Question created successfully",
      data: createdQuestion
    })

  } catch (error) {
    return errorHandler(error, "ForumController - CreateLessonQuestion", res);
  }
}

export async function CreateQuestionReplyController(req: Request, res: Response): Promise<Response> {
  try {
    const { questionId, userId, reply, parentId } = CreateQuestionReplyRequest.parse(req.body);

    const createdReply = await createQuestionReplyService(questionId, userId, reply, parentId);

    return res.status(200).json({
      success: true,
      message: "Reply created successfully",
      data: createdReply
    })

  } catch (error) {
    return errorHandler(error, "ForumController - CreateQuestionReply", res);
  }
}

export async function getQuestionTreeController(req: Request, res: Response): Promise<Response> {
  try {
    const { questionId } = req.params;
    const questionTree = await getQuestionRepliesService(questionId);
    return res.status(200).json({
      success: true,
      message: "Question tree fetched successfully",
      data: questionTree
    });
  } catch (error) {
    return errorHandler(error, "ForumController - GetQuestionTree", res);
  }
}

export async function getFaqByLessonIdController(req: Request, res: Response): Promise<Response> {
  try {
    const { lessonId } = req.params;
    const faq = await getFaqByLessonIdService(lessonId);
    return res.status(200).json({
      success: true,
      message: "FAQ fetched successfully",
      data: faq
    });
  } catch (error) {
    return errorHandler(error, "ForumController - GetFaqByLessonId", res);
  }
}

export async function getAllQuestionsController(req: Request, res: Response): Promise<Response> {
  try {
    const faq = await getQuestionService();
    return res.status(200).json({
      success: true,
      message: "All Questions fetched successfully",
      data: faq
    });
  } catch (error) {
    return errorHandler(error, "ForumController - GetAllQuestions", res);
  }
}