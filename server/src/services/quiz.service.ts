import { AppError } from "@/utils/error/errors";
import { prisma } from "@/utils/prisma";
import type { Quiz, QuizQuestion, QuizOption, QuizAttempt, QuizAnswer } from "@prisma/client";
import { CourseStatus } from "@prisma/client";

export async function createQuizService(
    title: string,
    description: string | undefined,
    instruction: string | undefined,
    duration: number | undefined,
    maxAttempts: number,
    passingScore: number,
    allowReview: boolean,
    showResultsImmediately: boolean,
    chapterId: string, // Required now
    questions: any[],
    createdBy?: string
): Promise<Quiz> {
    // Validate chapter exists
    const chapter = await prisma.chapters.findUnique({
        where: { id: chapterId, isActive: true }
    });

    if (!chapter) {
        throw new AppError("Chapter not found", 404);
    }

    const quiz = await prisma.quiz.create({
        data: {
            title,
            description,
            instruction,
            duration,
            maxAttempts,
            passingScore,
            allowReview,
            showResultsImmediately,
            chapterId,
            createdBy,
            questions: {
                create: questions.map(q => ({
                    questionText: q.questionText,
                    questionType: 'MCQ', // Enforce MCQ
                    points: q.points,
                    order: q.order,
                    explanation: q.explanation,
                    options: {
                        create: q.options.map((opt: any) => ({
                            optionText: opt.optionText,
                            isCorrect: opt.isCorrect,
                            order: opt.order,
                        }))
                    }
                }))
            }
        },
        include: {
            questions: {
                include: {
                    options: true
                },
                orderBy: {
                    order: 'asc'
                }
            },
            chapter: {
                include: {
                    module: {
                        include: {
                            expertise: {
                                include: {
                                    skillCategory: {
                                        include: {
                                            course: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    return quiz;
}

// Remove getQuizzesByLessonIdService - no longer needed

export async function getQuizzesByChapterIdService(chapterId: string): Promise<Quiz[]> {
    const quizzes = await prisma.quiz.findMany({
        where: {
            chapterId,
            isActive: true
        },
        include: {
            questions: {
                include: {
                    options: true
                },
                orderBy: {
                    order: 'asc'
                }
            },
            chapter: {
                include: {
                    module: {
                        include: {
                            expertise: {
                                include: {
                                    skillCategory: {
                                        include: {
                                            course: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            _count: {
                select: {
                    attempts: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return quizzes;
}

// NEW: Get quizzes by course ID (for students)
export async function getQuizzesByCourseIdService(courseId: string): Promise<Quiz[]> {
    // Get all published chapters for this course
    const chapters = await prisma.chapters.findMany({
        where: {
            isActive: true,
            status: CourseStatus.PUBLISHED,
            module: {
                isPublished: true,
                isActive: true,
                expertise: {
                    isPublished: true,
                    isActive: true,
                    skillCategory: {
                        isPublished: true,
                        isActive: true,
                        courseId: courseId
                    }
                }
            }
        },
        select: {
            id: true
        }
    });

    const chapterIds = chapters.map(c => c.id);

    const quizzes = await prisma.quiz.findMany({
        where: {
            chapterId: { in: chapterIds },
            isActive: true
        },
        include: {
            questions: {
                include: {
                    options: true
                },
                orderBy: {
                    order: 'asc'
                }
            },
            chapter: {
                include: {
                    module: {
                        include: {
                            expertise: {
                                include: {
                                    skillCategory: {
                                        include: {
                                            course: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            _count: {
                select: {
                    attempts: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return quizzes;
}

export async function getQuizByIdService(quizId: string, includeAnswers: boolean = false): Promise<Quiz | null> {
    const quiz = await prisma.quiz.findUnique({
        where: {
            id: quizId,
            isActive: true
        },
        include: {
            questions: {
                include: {
                    options: true
                },
                orderBy: {
                    order: 'asc'
                }
            },
            chapter: {
                include: {
                    module: {
                        include: {
                            expertise: {
                                include: {
                                    skillCategory: {
                                        include: {
                                            course: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    return quiz;
}

export async function createQuizAttemptService(
    quizId: string,
    userId: string
): Promise<QuizAttempt> {
    const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: {
            questions: true
        }
    });

    if (!quiz) {
        throw new AppError("Quiz not found", 404);
    }

    // First, mark any existing IN_PROGRESS attempts as ABANDONED (counts as failed)
    const inProgressAttempts = await prisma.quizAttempt.findMany({
        where: {
            quizId,
            userId,
            status: 'IN_PROGRESS',
            isActive: true
        }
    });

    for (const attempt of inProgressAttempts) {
        const allTotalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
        await prisma.quizAttempt.update({
            where: { id: attempt.id },
            data: {
                status: 'ABANDONED',
                completedAt: new Date(),
                score: 0,
                totalPoints: allTotalPoints,
                percentage: 0
            }
        });
    }

    // Check if user has reached max attempts (count COMPLETED and ABANDONED in last 14 days)
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const attempts = await prisma.quizAttempt.count({
        where: {
            quizId,
            userId,
            isActive: true,
            status: { in: ['COMPLETED', 'ABANDONED'] },
            startedAt: {
                gte: fourteenDaysAgo
            }
        }
    });

    if (attempts >= quiz.maxAttempts) {
        throw new AppError("Maximum attempts reached for this period. Attempts reset every 14 days.", 400);
    }

    const attempt = await prisma.quizAttempt.create({
        data: {
            quizId,
            userId,
            status: 'IN_PROGRESS'
        },
        include: {
            quiz: {
                include: {
                    questions: {
                        include: {
                            options: true
                        }
                    }
                }
            }
        }
    });

    return attempt;
}

export async function submitQuizAttemptService(
    attemptId: string,
    userId: string,
    answers: any[]
): Promise<QuizAttempt> {
    const attempt = await prisma.quizAttempt.findUnique({
        where: { id: attemptId },
        include: {
            quiz: {
                include: {
                    questions: {
                        include: {
                            options: true
                        },
                        orderBy: {
                            order: 'asc'
                        }
                    }
                }
            }
        }
    });

    if (!attempt) {
        throw new AppError("Attempt not found", 404);
    }

    if (attempt.userId !== userId) {
        throw new AppError("Unauthorized", 403);
    }

    if (attempt.status === 'COMPLETED') {
        throw new AppError("Quiz already submitted", 400);
    }

    // Save answers and auto-grade (instant feedback)
    let totalScore = 0;
    let totalPoints = 0;

    for (const answer of answers) {
        const question = attempt.quiz.questions.find(q => q.id === answer.questionId);
        if (!question) continue;

        totalPoints += question.points;

        let points = 0;
        let isCorrect = false;

        // Auto-grade MCQ
        if (question.questionType === 'MCQ') {
            const selectedOption = question.options.find(opt => opt.id === answer.selectedOptionId);
            if (selectedOption && selectedOption.isCorrect) {
                points = question.points;
                isCorrect = true;
            }
        }

        totalScore += points;

        await prisma.quizAnswer.create({
            data: {
                attemptId,
                questionId: answer.questionId,
                selectedOptionId: answer.selectedOptionId,
                points,
                isCorrect,
                gradedAt: new Date()
            }
        });
    }

    // Update attempt with results (instant feedback)
    const percentage = (totalScore / totalPoints) * 100;
    const passed = percentage >= attempt.quiz.passingScore;

    const updatedAttempt = await prisma.quizAttempt.update({
        where: { id: attemptId },
        data: {
            completedAt: new Date(),
            score: totalScore,
            totalPoints,
            percentage,
            status: 'COMPLETED'
        },
        include: {
            quiz: {
                include: {
                    questions: {
                        include: {
                            options: true
                        },
                        orderBy: {
                            order: 'asc'
                        }
                    }
                }
            },
            answers: {
                include: {
                    question: {
                        include: {
                            options: true
                        }
                    }
                },
                orderBy: {
                    question: {
                        order: 'asc'
                    }
                }
            }
        }
    });

    return updatedAttempt;
}

export async function getQuizAttemptByIdService(attemptId: string, userId: string): Promise<QuizAttempt | null> {
    const attempt = await prisma.quizAttempt.findUnique({
        where: { id: attemptId },
        include: {
            quiz: {
                include: {
                    questions: {
                        include: {
                            options: true
                        },
                        orderBy: {
                            order: 'asc'
                        }
                    }
                }
            },
            answers: {
                include: {
                    question: {
                        include: {
                            options: true
                        }
                    }
                },
                orderBy: {
                    question: {
                        order: 'asc'
                    }
                }
            }
        }
    });

    if (!attempt) {
        throw new AppError("Attempt not found", 404);
    }

    if (attempt.userId !== userId) {
        throw new AppError("Unauthorized", 403);
    }

    return attempt;
}

export async function getQuizAttemptsByUserIdService(userId: string): Promise<QuizAttempt[]> {
    const attempts = await prisma.quizAttempt.findMany({
        where: {
            userId,
            isActive: true
        },
        include: {
            quiz: {
                include: {
                    chapter: {
                        include: {
                            module: {
                                include: {
                                    expertise: {
                                        include: {
                                            skillCategory: {
                                                include: {
                                                    course: true
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return attempts;
}

// NEW: Get all attempts for a quiz (admin)
export async function getQuizAttemptsByQuizIdService(quizId: string): Promise<QuizAttempt[]> {
    const attempts = await prisma.quizAttempt.findMany({
        where: {
            quizId,
            isActive: true
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            answers: {
                include: {
                    question: {
                        include: {
                            options: true
                        }
                    }
                }
            }
        },
        orderBy: {
            completedAt: 'desc'
        }
    });

    return attempts;
}

// NEW: Get quiz statistics (admin)
export async function getQuizStatisticsService(quizId: string) {
    const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: {
            questions: true,
            attempts: {
                where: { isActive: true, status: 'COMPLETED' }
            }
        }
    });

    if (!quiz) {
        throw new AppError("Quiz not found", 404);
    }

    const totalAttempts = quiz.attempts.length;
    const passedAttempts = quiz.attempts.filter(a => a.percentage && a.percentage >= quiz.passingScore).length;
    const failedAttempts = totalAttempts - passedAttempts;
    const passRate = totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0;

    const avgScore = totalAttempts > 0
        ? quiz.attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / totalAttempts
        : 0;

    // Question-level statistics
    const questionStats = await Promise.all(
        quiz.questions.map(async (question) => {
            const correctAnswers = await prisma.quizAnswer.count({
                where: {
                    questionId: question.id,
                    isCorrect: true,
                    attempt: {
                        quizId: quizId,
                        status: 'COMPLETED'
                    }
                }
            });

            const totalAnswers = await prisma.quizAnswer.count({
                where: {
                    questionId: question.id,
                    attempt: {
                        quizId: quizId,
                        status: 'COMPLETED'
                    }
                }
            });

            const accuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;

            return {
                questionId: question.id,
                questionText: question.questionText,
                totalAnswers,
                correctAnswers,
                accuracy
            };
        })
    );

    return {
        quiz: {
            id: quiz.id,
            title: quiz.title,
            totalQuestions: quiz.questions.length,
            passingScore: quiz.passingScore
        },
        statistics: {
            totalAttempts,
            passedAttempts,
            failedAttempts,
            passRate,
            avgScore
        },
        questionStats
    };
}

export async function getAllQuizzesService(): Promise<Quiz[]> {
    const quizzes = await prisma.quiz.findMany({
        include: {
            chapter: {
                include: {
                    module: {
                        include: {
                            expertise: {
                                include: {
                                    skillCategory: {
                                        include: {
                                            course: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            questions: {
                include: {
                    options: true
                }
            },
            _count: {
                select: {
                    attempts: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return quizzes;
}

export async function updateQuizService(
    quizId: string,
    data: {
        title?: string;
        description?: string;
        instruction?: string;
        duration?: number;
        maxAttempts?: number;
        passingScore?: number;
        allowReview?: boolean;
        showResultsImmediately?: boolean;
        questions?: any[];
    }
): Promise<Quiz> {
    const { questions, ...quizData } = data;

    // Use a transaction with extended timeout to handle complex quiz updates
    // Default timeout is 5s which is not enough for quizzes with many questions/options
    const result = await prisma.$transaction(async (tx) => {
        // 1. Update basic quiz details
        const updatedQuiz = await tx.quiz.update({
            where: { id: quizId },
            data: quizData
        });

        // 2. Handle questions if provided
        if (questions) {
            // Get existing questions to determine what to delete
            const existingQuestions = await tx.quizQuestion.findMany({
                where: { quizId },
                select: { id: true }
            });

            const existingQuestionIds = existingQuestions.map(q => q.id);
            const incomingQuestionIds = questions.filter(q => q.id).map(q => q.id);

            // Identify questions to delete
            const questionsToDelete = existingQuestionIds.filter(id => !incomingQuestionIds.includes(id));

            if (questionsToDelete.length > 0) {
                // Delete related answers/options first if cascading isn't set (though Prisma usually handles cascade if configured)
                // Assuming cascade delete is configured in schema or we delete manually
                // Safe approach: delete questions, let DB handle errors if there are constraints
                // Note: If questions have attempts, this might fail unless we use soft deletes or cascade. 
                // For now, attempting delete.
                await tx.quizQuestion.deleteMany({
                    where: { id: { in: questionsToDelete } }
                });
            }

            // Process each question (create or update)
            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];

                if (q.id && existingQuestionIds.includes(q.id)) {
                    // UPDATE existing question
                    await tx.quizQuestion.update({
                        where: { id: q.id },
                        data: {
                            questionText: q.questionText,
                            questionType: q.questionType,
                            points: q.points,
                            order: i + 1, // Update order based on array position
                            explanation: q.explanation
                        }
                    });

                    // Handle Options for this question
                    if (q.options) {
                        const existingOptions = await tx.quizOption.findMany({
                            where: { questionId: q.id },
                            select: { id: true }
                        });

                        const existingOptionIds = existingOptions.map(o => o.id);
                        const incomingOptionIds = q.options.filter((o: any) => o.id).map((o: any) => o.id);

                        // Delete removed options
                        const optionsToDelete = existingOptionIds.filter(id => !incomingOptionIds.includes(id));
                        if (optionsToDelete.length > 0) {
                            await tx.quizOption.deleteMany({
                                where: { id: { in: optionsToDelete } }
                            });
                        }

                        // Upsert options
                        for (let optIdx = 0; optIdx < q.options.length; optIdx++) {
                            const opt = q.options[optIdx];
                            if (opt.id && existingOptionIds.includes(opt.id)) {
                                await tx.quizOption.update({
                                    where: { id: opt.id },
                                    data: {
                                        optionText: opt.optionText,
                                        isCorrect: opt.isCorrect,
                                        order: opt.order ?? optIdx + 1
                                    }
                                });
                            } else {
                                await tx.quizOption.create({
                                    data: {
                                        questionId: q.id,
                                        optionText: opt.optionText,
                                        isCorrect: opt.isCorrect,
                                        order: opt.order ?? optIdx + 1
                                    }
                                });
                            }
                        }
                    }
                } else {
                    // CREATE new question
                    const newQuestion = await tx.quizQuestion.create({
                        data: {
                            quizId,
                            questionText: q.questionText,
                            questionType: q.questionType,
                            points: q.points,
                            order: i + 1,
                            explanation: q.explanation
                        }
                    });

                    // Create options for new question
                    if (q.options) {
                        await tx.quizOption.createMany({
                            data: q.options.map((opt: any, optIdx: number) => ({
                                questionId: newQuestion.id,
                                optionText: opt.optionText,
                                isCorrect: opt.isCorrect,
                                order: opt.order ?? optIdx + 1
                            }))
                        });
                    }
                }
            }
        }

        return updatedQuiz;
    }, {
        maxWait: 10000,  // Wait up to 10s in queue
        timeout: 30000,  // Transaction can run up to 30s
    });

    // Return full quiz with questions for UI update
    return prisma.quiz.findUnique({
        where: { id: quizId },
        include: {
            questions: {
                include: { options: true },
                orderBy: { order: 'asc' }
            }
        }
    }) as Promise<Quiz>;
}

export async function deleteQuizService(quizId: string): Promise<void> {
    await prisma.quiz.update({
        where: { id: quizId },
        data: { isActive: false }
    });
}

// NEW: Public quiz listing (no auth required)
export async function getPublicQuizzesService(
    page: number = 1,
    limit: number = 12,
    search?: string,
    sortBy: 'latest' | 'popular' = 'latest'
): Promise<{ quizzes: Quiz[]; total: number; page: number; limit: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    const whereClause: any = {
        isActive: true,
        chapter: {
            isActive: true,
            status: CourseStatus.PUBLISHED,
            module: {
                isPublished: true,
                isActive: true,
                expertise: {
                    isPublished: true,
                    isActive: true,
                    skillCategory: {
                        isPublished: true,
                        isActive: true,
                        course: {
                            published: true,
                            status: CourseStatus.PUBLISHED,
                            isActive: true
                        }
                    }
                }
            }
        }
    };

    if (search) {
        whereClause.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
        ];
    }

    const orderBy: any = sortBy === 'popular'
        ? { attempts: { _count: 'desc' } }
        : { createdAt: 'desc' };

    const [quizzes, total] = await Promise.all([
        prisma.quiz.findMany({
            where: whereClause,
            include: {
                chapter: {
                    select: {
                        id: true,
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
                                                course: {
                                                    select: {
                                                        id: true,
                                                        title: true,
                                                        tumbnailUrl: true
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                questions: {
                    select: { id: true }
                },
                _count: {
                    select: { attempts: true }
                }
            },
            skip,
            take: limit,
            orderBy
        }),
        prisma.quiz.count({ where: whereClause })
    ]);

    return {
        quizzes,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
}

// NEW: Abandon quiz attempt (for tab switching detection)
export async function abandonQuizAttemptService(
    attemptId: string,
    userId: string,
    answers?: any[]
): Promise<QuizAttempt> {
    const attempt = await prisma.quizAttempt.findUnique({
        where: { id: attemptId },
        include: {
            quiz: {
                include: {
                    questions: {
                        include: {
                            options: true
                        }
                    }
                }
            }
        }
    });

    if (!attempt) {
        throw new AppError("Attempt not found", 404);
    }

    if (attempt.userId !== userId) {
        throw new AppError("Unauthorized", 403);
    }

    if (attempt.status !== 'IN_PROGRESS') {
        throw new AppError("Attempt is not in progress", 400);
    }

    // Save any partial answers if provided
    let totalScore = 0;
    let totalPoints = 0;

    if (answers && answers.length > 0) {
        for (const answer of answers) {
            const question = attempt.quiz.questions.find(q => q.id === answer.questionId);
            if (!question) continue;

            totalPoints += question.points;

            let points = 0;
            let isCorrect = false;

            if (question.questionType === 'MCQ') {
                const selectedOption = question.options.find(opt => opt.id === answer.selectedOptionId);
                if (selectedOption && selectedOption.isCorrect) {
                    points = question.points;
                    isCorrect = true;
                }
            }

            totalScore += points;

            // Only create if answer has a selection
            if (answer.selectedOptionId) {
                await prisma.quizAnswer.create({
                    data: {
                        attemptId,
                        questionId: answer.questionId,
                        selectedOptionId: answer.selectedOptionId,
                        points,
                        isCorrect,
                        gradedAt: new Date()
                    }
                });
            }
        }
    }

    // Calculate total possible points from all questions
    const allTotalPoints = attempt.quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = allTotalPoints > 0 ? (totalScore / allTotalPoints) * 100 : 0;

    // Update attempt as ABANDONED
    const abandonedAttempt = await prisma.quizAttempt.update({
        where: { id: attemptId },
        data: {
            status: 'ABANDONED',
            completedAt: new Date(),
            score: totalScore,
            totalPoints: allTotalPoints,
            percentage
        },
        include: {
            quiz: true,
            answers: {
                include: {
                    question: true
                }
            }
        }
    });

    return abandonedAttempt;
}

// NEW: Get quiz attempt details (for detailed result page)
export async function getQuizAttemptDetailsService(
    attemptId: string,
    userId: string,
    isAdmin: boolean = false
): Promise<QuizAttempt | null> {
    const attempt = await prisma.quizAttempt.findUnique({
        where: { id: attemptId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profilePhoto: true
                }
            },
            quiz: {
                include: {
                    questions: {
                        include: {
                            options: isAdmin // Only include correct answer info for admin
                        },
                        orderBy: {
                            order: 'asc'
                        }
                    },
                    chapter: {
                        include: {
                            module: {
                                include: {
                                    expertise: {
                                        include: {
                                            skillCategory: {
                                                include: {
                                                    course: true
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            answers: {
                include: {
                    question: {
                        include: {
                            options: isAdmin // Only show correct options to admin
                        }
                    }
                },
                orderBy: {
                    question: {
                        order: 'asc'
                    }
                }
            }
        }
    });

    if (!attempt) {
        throw new AppError("Attempt not found", 404);
    }

    // Non-admin users can only view their own attempts
    if (!isAdmin && attempt.userId !== userId) {
        throw new AppError("Unauthorized", 403);
    }

    return attempt;
}

// NEW: Check for existing in-progress attempt
export async function getExistingInProgressAttemptService(
    quizId: string,
    userId: string
): Promise<QuizAttempt | null> {
    const attempt = await prisma.quizAttempt.findFirst({
        where: {
            quizId,
            userId,
            status: 'IN_PROGRESS',
            isActive: true
        },
        include: {
            quiz: {
                include: {
                    questions: {
                        include: {
                            options: true
                        }
                    }
                }
            }
        }
    });

    return attempt;
}