import { AppError } from "@/utils/error/errors";
import { prisma } from "@/utils/prisma";
import { Purchase, Chapters, CourseStatus } from "@prisma/client";

export async function createPurchaseService(
    userId: string,
    chapterId: string,
    amount: number
): Promise<Purchase> {
    // Check if chapter exists and is published
    const chapter = await prisma.chapters.findUnique({
        where: { id: chapterId },
    });

    if (!chapter) {
        throw new AppError("Chapter not found", 404);
    }

    if (chapter.status !== CourseStatus.PUBLISHED) {
        throw new AppError("Chapter is not available for purchase", 400);
    }

    // Check if user already purchased this chapter
    const existingPurchase = await prisma.purchase.findFirst({
        where: {
            userId: userId,
            chapterId: chapterId,
            isActive: true,
        },
    });

    if (existingPurchase) {
        throw new AppError("Chapter already purchased", 400);
    }

    // Verify the amount matches chapter price
    if (chapter.price !== amount) {
        throw new AppError("Amount mismatch with chapter price", 400);
    }

    // Get courseId from chapter
    const chapterWithModule = await prisma.chapters.findUnique({
        where: { id: chapterId },
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
    });

    const courseId = chapterWithModule?.module.expertise.skillCategory.course.id;

    // Create purchase
    const purchase = await prisma.purchase.create({
        data: {
            userId,
            chapterId,
            amount,
            courseId: courseId || null,
        },
    });

    return purchase;
}

export async function getUserPurchasesService(userId: string) {
    const purchases = await prisma.purchase.findMany({
        where: {
            userId: userId,
            isActive: true,
        },
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
        orderBy: {
            purchaseAt: "desc",
        },
    });

    return purchases;
}

export async function getUserPurchasedChaptersService(
    userId: string
): Promise<string[]> {
    const purchases = await prisma.purchase.findMany({
        where: {
            userId: userId,
            isActive: true,
        },
        select: {
            chapterId: true,
        },
    });

    return purchases.map((p) => p.chapterId);
}

export async function checkChapterPurchaseStatusService(
    userId: string,
    chapterId: string
): Promise<boolean> {
    const purchase = await prisma.purchase.findFirst({
        where: {
            userId: userId,
            chapterId: chapterId,
            isActive: true,
        },
    });

    return !!purchase;
}

export async function getChapterByIdService(chapterId: string): Promise<Chapters> {
    const chapter = await prisma.chapters.findUnique({
        where: { id: chapterId },
    });

    if (!chapter) {
        throw new AppError("Chapter not found", 404);
    }

    return chapter;
}

// ✅ Add function to check if user has any purchase for a course
export async function checkCoursePurchaseStatusService(
    userId: string,
    courseId: string
): Promise<boolean> {
    const purchase = await prisma.purchase.findFirst({
        where: {
            userId: userId,
            courseId: courseId,
            isActive: true,
        },
    });

    return !!purchase;
}

// ✅ Get purchased chapters for a specific course
export async function getCoursePurchasedChaptersService(
    userId: string,
    courseId: string
): Promise<string[]> {
    const purchases = await prisma.purchase.findMany({
        where: {
            userId: userId,
            courseId: courseId,
            isActive: true,
        },
        select: {
            chapterId: true,
        },
    });

    return purchases.map((p) => p.chapterId);
}

export async function getPurchasedCoursesService(userId: string) {
    const purchases = await prisma.purchase.findMany({
        where: {
            userId: userId,
            isActive: true,
        },
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
        orderBy: {
            purchaseAt: "desc",
        },
    });

    // Group by course
    const courseMap = new Map();

    purchases.forEach((purchase) => {
        const course = purchase.chapter.module.expertise.skillCategory.course;
        if (!courseMap.has(course.id)) {
            courseMap.set(course.id, {
                course,
                chapters: [],
                purchasedAt: purchase.purchaseAt,
            });
        }
        const courseData = courseMap.get(course.id);
        courseData.chapters.push(purchase.chapter);
        // Keep the most recent purchase date
        if (new Date(purchase.purchaseAt) > new Date(courseData.purchasedAt)) {
            courseData.purchasedAt = purchase.purchaseAt;
        }
    });

    return Array.from(courseMap.values()).map((data) => ({
        ...data.course,
        purchasedChapters: data.chapters.length,
        purchasedAt: data.purchasedAt,
    }));
}

// ✅ Get purchases with full course hierarchy for hierarchical view
export async function getUserPurchasesWithHierarchyService(userId: string) {
    const purchases = await prisma.purchase.findMany({
        where: {
            userId: userId,
            isActive: true,
        },
        include: {
            chapter: {
                include: {
                    Lessons: {
                        include: {
                            Video: true,
                        },
                        orderBy: {
                            order: "asc",
                        },
                    },
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
        orderBy: {
            purchaseAt: "desc",
        },
    });

    // Store purchased chapter IDs for filtering
    const purchasedChapterIds = new Set(purchases.map(p => p.chapterId));

    // Group by course with full hierarchy
    const courseMap = new Map<string, {
        course: typeof purchases[0]['chapter']['module']['expertise']['skillCategory']['course'];
        skillCategories: Map<string, {
            skillCategory: typeof purchases[0]['chapter']['module']['expertise']['skillCategory'];
            expertises: Map<string, {
                expertise: typeof purchases[0]['chapter']['module']['expertise'];
                modules: Map<string, {
                    module: typeof purchases[0]['chapter']['module'];
                    chapters: typeof purchases[0]['chapter'][];
                }>;
            }>;
        }>;
        totalChapters: number;
        purchasedAt: Date;
    }>();

    purchases.forEach((purchase) => {
        const chapter = purchase.chapter;
        const module = chapter.module;
        const expertise = module.expertise;
        const skillCategory = expertise.skillCategory;
        const course = skillCategory.course;

        // Initialize course
        if (!courseMap.has(course.id)) {
            courseMap.set(course.id, {
                course,
                skillCategories: new Map(),
                totalChapters: 0,
                purchasedAt: purchase.purchaseAt,
            });
        }
        const courseData = courseMap.get(course.id)!;

        // Initialize skill category
        if (!courseData.skillCategories.has(skillCategory.id)) {
            courseData.skillCategories.set(skillCategory.id, {
                skillCategory,
                expertises: new Map(),
            });
        }
        const skillCategoryData = courseData.skillCategories.get(skillCategory.id)!;

        // Initialize expertise
        if (!skillCategoryData.expertises.has(expertise.id)) {
            skillCategoryData.expertises.set(expertise.id, {
                expertise,
                modules: new Map(),
            });
        }
        const expertiseData = skillCategoryData.expertises.get(expertise.id)!;

        // Initialize module
        if (!expertiseData.modules.has(module.id)) {
            expertiseData.modules.set(module.id, {
                module,
                chapters: [],
            });
        }
        const moduleData = expertiseData.modules.get(module.id)!;

        // Add chapter if not already added
        if (!moduleData.chapters.some(c => c.id === chapter.id)) {
            moduleData.chapters.push(chapter);
            courseData.totalChapters++;
        }

        // Update most recent purchase date
        if (new Date(purchase.purchaseAt) > new Date(courseData.purchasedAt)) {
            courseData.purchasedAt = purchase.purchaseAt;
        }
    });

    // Convert maps to arrays
    return Array.from(courseMap.values()).map((courseData) => ({
        ...courseData.course,
        purchasedAt: courseData.purchasedAt,
        totalPurchasedChapters: courseData.totalChapters,
        SkillCategory: Array.from(courseData.skillCategories.values()).map((scData) => ({
            ...scData.skillCategory,
            Expertise: Array.from(scData.expertises.values()).map((expData) => ({
                ...expData.expertise,
                Module: Array.from(expData.modules.values()).map((modData) => ({
                    ...modData.module,
                    Chapters: modData.chapters.sort((a, b) => a.order - b.order),
                })),
            })),
        })),
    }));
}