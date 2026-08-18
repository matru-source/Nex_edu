import { prisma } from "@/utils/prisma";
import { checkUserBlockedService } from "./faq-admin.service";

export async function createLessonQuestionService(lessonId: string, userId: string, question: string) {
  // Check if user is blocked for this lesson
  const blockStatus = await checkUserBlockedService(userId, lessonId);
  if (blockStatus.blocked) {
    throw new Error(`You are blocked from posting in this ${blockStatus.blockType === 'course' ? 'course' : 'lesson'}'s FAQ. Reason: ${blockStatus.reason || 'No reason provided'}`);
  }

  const newQuestion = await prisma.lessonQuestion.create({
    data: {
      lessonId,
      userId,
      question
    }
  })

  return newQuestion;
}

export async function createQuestionReplyService(questionId: string, userId: string, reply: string, parentId?: string) {
  // Get the lesson ID from the question to check block status
  const question = await prisma.lessonQuestion.findUnique({
    where: { id: questionId },
    select: { lessonId: true }
  });

  if (question) {
    const blockStatus = await checkUserBlockedService(userId, question.lessonId);
    if (blockStatus.blocked) {
      throw new Error(`You are blocked from replying in this ${blockStatus.blockType === 'course' ? 'course' : 'lesson'}'s FAQ. Reason: ${blockStatus.reason || 'No reason provided'}`);
    }
  }

  const newReply = await prisma.questionReply.create({
    data: {
      questionId,
      userId,
      reply,
      parentId
    }
  })

  return newReply;
}

export async function getQuestionRepliesService(questionId: string) {
  // First fetch the original question
  const question = await prisma.lessonQuestion.findFirst({
    where: { id: questionId, isActive: true },
    include: { user: { select: { id: true, name: true } } },
  });

  if (!question) {
    throw new Error("Question not found");
  }

  // fetch all replies flat - include isAdminReply field
  const replies = await prisma.questionReply.findMany({
    where: { questionId, isActive: true },
    include: { user: { select: { id: true, name: true, role: true, profilePhoto: true } } },
    orderBy: { createdAt: "asc" },
  });
  // index by parentId for tree building
  const map: Record<string, any[]> = {};
  replies.forEach(r => {
    if (!map[r.parentId || "root"]) map[r.parentId || "root"] = [];
    map[r.parentId || "root"].push(r);
  });
  // recursive tree builder
  function buildTree(parentId: string | null): any[] {
    return (map[parentId || "root"] || []).map(r => ({
      ...r,
      children: buildTree(r.id),
    }));
  }
  const tree = buildTree(null);
  return { question, replies: tree };
}

export async function getFaqByLessonIdService(lessonId: string) {
  const faq = await prisma.lessonQuestion.findMany({
    where: { lessonId, isActive: true },
    include: {
      user: { select: { id: true, name: true } },
      replies: {
        where: { isActive: true },
        include: {
          user: { select: { id: true, name: true, role: true, profilePhoto: true } }
        },
        orderBy: { createdAt: "asc" }
      }
    },
    orderBy: { createdAt: "desc" },
  });
  return faq;
}

export async function getQuestionService() {
  const faq = await prisma.lessonQuestion.findMany({
    where: { isActive: true },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return faq;
}