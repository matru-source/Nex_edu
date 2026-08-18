import { prisma } from "@/utils/prisma";
import { AppError } from "@/utils/error/errors";

// Update or create viewing history
export async function updateViewingHistoryService(
    userId: string,
    lessonId: string,
    videoId: string | null,
    currentTime: number,
    duration: number
) {
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    const isCompleted = progress >= 90; // Mark as completed if watched 90% or more

    // ✅ Handle null videoId properly - find existing record first
    let existingHistory;
    if (videoId) {
        existingHistory = await prisma.viewingHistory.findUnique({
            where: {
                userId_lessonId_videoId: {
                    userId,
                    lessonId,
                    videoId: videoId,
                },
            },
        });
    } else {
        // ✅ If videoId is null, find by userId and lessonId only
        existingHistory = await prisma.viewingHistory.findFirst({
            where: {
                userId,
                lessonId,
                videoId: null,
            },
        });
    }

    if (existingHistory) {
        // Update existing record
        const history = await prisma.viewingHistory.update({
            where: {
                id: existingHistory.id,
            },
            data: {
                currentTime,
                duration,
                progress,
                isCompleted,
                videoId: videoId || null,
                updatedAt: new Date(),
            },
        });
        return history;
    } else {
        // Create new record
        const history = await prisma.viewingHistory.create({
            data: {
                userId,
                lessonId,
                videoId: videoId || null,
                currentTime,
                duration,
                progress,
                isCompleted,
            },
        });
        return history;
    }
}

// Get viewing history for a lesson
export async function getLessonViewingHistoryService(
    userId: string,
    lessonId: string
) {
    const history = await prisma.viewingHistory.findFirst({
        where: {
            userId,
            lessonId,
            isActive: true,
        },
        include: {
            lesson: {
                include: {
                    Video: true,
                    chapter: {
                        include: {
                            module: {
                                include: {
                                    expertise: {
                                        include: {
                                            skillCategory: {
                                                include: {
                                                    course: true,
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
    });

    return history;
}

// Get continue watching courses (courses with viewing history but not completed)
export async function getContinueWatchingCoursesService(userId: string) {
    const histories = await prisma.viewingHistory.findMany({
        where: {
            userId,
            isActive: true,
            isCompleted: false,
            progress: { gt: 0 }, // Has some progress
        },
        include: {
            lesson: {
                include: {
                    Video: true,
                    chapter: {
                        include: {
                            module: {
                                include: {
                                    expertise: {
                                        include: {
                                            skillCategory: {
                                                include: {
                                                    course: {
                                                        include: {
                                                            category: true,
                                                            subCategory: true,
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
        },
        orderBy: {
            updatedAt: "desc",
        },
        take: 10, // Limit to 10 most recent
    });

    // Group by course and get the most recent lesson for each course
    const courseMap = new Map<string, typeof histories[0]>();

    histories.forEach((history) => {
        const courseId = history.lesson.chapter.module.expertise.skillCategory.course.id;
        const existing = courseMap.get(courseId);

        if (!existing || new Date(history.updatedAt) > new Date(existing.updatedAt)) {
            courseMap.set(courseId, history);
        }
    });

    return Array.from(courseMap.values()).map((history) => ({
        course: history.lesson.chapter.module.expertise.skillCategory.course,
        lastLesson: history.lesson,
        progress: history.progress,
        currentTime: history.currentTime,
        duration: history.duration,
        lastWatched: history.updatedAt,
    }));
}

// Get courses with any viewing history
export async function getCoursesWithHistoryService(userId: string) {
    const histories = await prisma.viewingHistory.findMany({
        where: {
            userId,
            isActive: true,
        },
        include: {
            lesson: {
                include: {
                    chapter: {
                        include: {
                            module: {
                                include: {
                                    expertise: {
                                        include: {
                                            skillCategory: {
                                                include: {
                                                    course: {
                                                        include: {
                                                            category: true,
                                                            subCategory: true,
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
        },
        orderBy: {
            updatedAt: "desc",
        },
    });

    // Get unique courses
    const courseMap = new Map();
    histories.forEach((history) => {
        const course = history.lesson.chapter.module.expertise.skillCategory.course;
        if (!courseMap.has(course.id)) {
            courseMap.set(course.id, course);
        }
    });

    return Array.from(courseMap.values());
}