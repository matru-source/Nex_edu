import { prisma } from "@/utils/prisma";

// Get all questions for admin with detailed information
export async function getAllQuestionsForAdminService() {
    const questions = await prisma.lessonQuestion.findMany({
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profilePhoto: true,
                },
            },
            lesson: {
                select: {
                    id: true,
                    title: true,
                    chapter: {
                        select: {
                            id: true,
                            title: true,
                            module: {
                                select: {
                                    id: true,
                                    title: true,
                                    expertise: {
                                        select: {
                                            id: true,
                                            name: true,
                                            skillCategory: {
                                                select: {
                                                    id: true,
                                                    name: true,
                                                    course: {
                                                        select: {
                                                            id: true,
                                                            title: true,
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            replies: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profilePhoto: true,
                        },
                    },
                },
                orderBy: { createdAt: "asc" },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return questions;
}

// Soft-delete a question
export async function deleteQuestionService(questionId: string) {
    const question = await prisma.lessonQuestion.update({
        where: { id: questionId },
        data: { isActive: false },
    });
    return question;
}

// Soft-delete a reply
export async function deleteReplyService(replyId: string) {
    const reply = await prisma.questionReply.update({
        where: { id: replyId },
        data: { isActive: false },
    });
    return reply;
}

// Create an admin reply
export async function createAdminReplyService(
    questionId: string,
    userId: string,
    reply: string,
    parentId?: string
) {
    const newReply = await prisma.questionReply.create({
        data: {
            questionId,
            userId,
            reply,
            parentId,
            isAdminReply: true,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profilePhoto: true,
                },
            },
        },
    });
    return newReply;
}

// Block user for a specific lesson
export async function blockUserForLessonService(
    userId: string,
    lessonId: string,
    reason: string | null,
    blockedBy: string
) {
    // Get the courseId from the lesson for reference
    const lesson = await prisma.lessons.findUnique({
        where: { id: lessonId },
        include: {
            chapter: {
                include: {
                    module: {
                        include: {
                            expertise: {
                                include: {
                                    skillCategory: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!lesson) {
        throw new Error("Lesson not found");
    }

    const block = await prisma.faqBlock.create({
        data: {
            userId,
            lessonId,
            reason,
            blockedBy,
        },
        include: {
            user: {
                select: { id: true, name: true, email: true },
            },
            lesson: {
                select: { id: true, title: true },
            },
        },
    });

    return block;
}

// Block user for all lessons in a course
export async function blockUserForCourseService(
    userId: string,
    courseId: string,
    reason: string | null,
    blockedBy: string
) {
    const block = await prisma.faqBlock.create({
        data: {
            userId,
            courseId,
            reason,
            blockedBy,
        },
        include: {
            user: {
                select: { id: true, name: true, email: true },
            },
        },
    });

    return block;
}

// Unblock a user (delete the block record)
export async function unblockUserService(blockId: string) {
    const block = await prisma.faqBlock.delete({
        where: { id: blockId },
    });
    return block;
}

// Get all blocks
export async function getAllBlocksService() {
    const blocks = await prisma.faqBlock.findMany({
        where: { isActive: true },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profilePhoto: true,
                },
            },
            lesson: {
                select: {
                    id: true,
                    title: true,
                    chapter: {
                        select: {
                            id: true,
                            title: true,
                            module: {
                                select: {
                                    expertise: {
                                        select: {
                                            skillCategory: {
                                                select: {
                                                    course: {
                                                        select: { id: true, title: true },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return blocks;
}

// Get all blocks for a specific user
export async function getUserBlocksService(userId: string) {
    const blocks = await prisma.faqBlock.findMany({
        where: { userId, isActive: true },
        include: {
            lesson: {
                select: {
                    id: true,
                    title: true,
                    chapter: {
                        select: {
                            title: true,
                            module: {
                                select: {
                                    title: true,
                                    expertise: {
                                        select: {
                                            name: true,
                                            skillCategory: {
                                                select: {
                                                    name: true,
                                                    course: { select: { id: true, title: true } },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return blocks;
}

// Check if a user is blocked for a specific lesson
export async function checkUserBlockedService(userId: string, lessonId: string) {
    // Get the course ID from the lesson
    const lesson = await prisma.lessons.findUnique({
        where: { id: lessonId },
        include: {
            chapter: {
                include: {
                    module: {
                        include: {
                            expertise: {
                                include: {
                                    skillCategory: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!lesson) {
        return { blocked: false, reason: null };
    }

    const courseId = lesson.chapter.module.expertise.skillCategory.courseId;

    // Check for lesson-specific block
    const lessonBlock = await prisma.faqBlock.findFirst({
        where: {
            userId,
            lessonId,
            isActive: true,
        },
    });

    if (lessonBlock) {
        return {
            blocked: true,
            blockType: "lesson",
            reason: lessonBlock.reason,
            lessonTitle: lesson.title,
        };
    }

    // Check for course-wide block
    const courseBlock = await prisma.faqBlock.findFirst({
        where: {
            userId,
            courseId,
            isActive: true,
        },
    });

    if (courseBlock) {
        return {
            blocked: true,
            blockType: "course",
            reason: courseBlock.reason,
            courseId,
        };
    }

    return { blocked: false, reason: null };
}

// Get statistics for FAQ admin dashboard
export async function getFaqStatsService() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalQuestions, todayQuestions, totalReplies, blockedUsers, adminReplies] =
        await Promise.all([
            prisma.lessonQuestion.count({ where: { isActive: true } }),
            prisma.lessonQuestion.count({
                where: {
                    isActive: true,
                    createdAt: { gte: today },
                },
            }),
            prisma.questionReply.count({ where: { isActive: true } }),
            prisma.faqBlock.count({ where: { isActive: true } }),
            prisma.questionReply.count({ where: { isActive: true, isAdminReply: true } }),
        ]);

    return {
        totalQuestions,
        todayQuestions,
        totalReplies,
        blockedUsers,
        adminReplies,
    };
}
