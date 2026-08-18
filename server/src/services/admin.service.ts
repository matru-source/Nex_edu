import { prisma } from "@/utils/prisma";

// Get all students with statistics
export async function getAllStudentsService() {
    // Get all students with their purchase counts and total spent
    const students = await prisma.user.findMany({
        where: {
            role: "STUDENT",
        },
        select: {
            id: true,
            name: true,
            email: true,
            goal: true,
            currentStatus: true,
            emailVerified: true,
            isBlocked: true,
            profilePhoto: true,
            createdAt: true,
            Purchase: {
                where: { isActive: true },
                select: {
                    amount: true,
                },
            },
            _count: {
                select: {
                    Purchase: {
                        where: { isActive: true },
                    },
                    QuizAttempt: true,
                    ViewingHistory: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    // Calculate total spent for each student
    const studentsWithStats = students.map((student) => {
        const totalSpent = student.Purchase.reduce(
            (sum, purchase) => sum + purchase.amount,
            0
        );
        return {
            id: student.id,
            name: student.name,
            email: student.email,
            goal: student.goal,
            currentStatus: student.currentStatus,
            emailVerified: student.emailVerified,
            isBlocked: student.isBlocked,
            profilePhoto: student.profilePhoto,
            createdAt: student.createdAt.toISOString(),
            _count: student._count,
            totalSpent,
        };
    });

    // Calculate statistics
    const total = students.length;
    const verified = students.filter((s) => s.emailVerified).length;
    const unverified = total - verified;
    const withPurchases = students.filter(
        (s) => s.Purchase.length > 0
    ).length;

    const allPurchases = await prisma.purchase.findMany({
        where: { isActive: true },
        select: { amount: true },
    });

    const totalRevenue = allPurchases.reduce(
        (sum, p) => sum + p.amount,
        0
    );

    const averageSpent =
        withPurchases > 0 ? totalRevenue / withPurchases : 0;
    const purchaseRatio = total > 0 ? (withPurchases / total) * 100 : 0;

    return {
        data: studentsWithStats,
        statistics: {
            total,
            verified,
            unverified,
            withPurchases,
            totalRevenue,
            averageSpent,
            purchaseRatio,
        },
    };
}

// Get student details by ID
export async function getStudentDetailsService(userId: string) {
    const student = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            BillingInfo: {
                where: { isActive: true },
            },
            Purchase: {
                where: { isActive: true },
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
                },
                orderBy: { purchaseAt: 'desc' }
            },
            QuizAttempt: {
                include: {
                    quiz: true
                },
                orderBy: { startedAt: 'desc' }
            },
            ViewingHistory: {
                where: { isActive: true },
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
                orderBy: { updatedAt: 'desc' },
                take: 20 // Recent activity
            }
        }
    });

    if (!student) {
        throw new Error("Student not found");
    }

    // Calculate course progress
    // This is a simplified calculation. Ideally, we should compute this based on total lessons vs completed lessons per course.
    const courseProgress = new Map<string, { title: string, completedLessons: number, totalLessons: number }>();

    // Group viewing history by course
    student.ViewingHistory.forEach(history => {
        const course = history.lesson.chapter.module.expertise.skillCategory.course;
        if (!courseProgress.has(course.id)) {
            courseProgress.set(course.id, {
                title: course.title,
                completedLessons: 0,
                totalLessons: 0 // We would need another query to get total lessons count per course efficiently
            });
        }
        if (history.isCompleted) {
            const current = courseProgress.get(course.id)!;
            current.completedLessons++;
        }
    });

    return {
        ...student,
        courseProgress: Array.from(courseProgress.entries()).map(([id, data]) => ({ id, ...data }))
    };
}

// Toggle user block status
export async function toggleUserBlockService(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { isBlocked: true }
    });

    if (!user) {
        throw new Error("User not found");
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { isBlocked: !user.isBlocked },
        select: { id: true, isBlocked: true }
    });

    return {
        success: true,
        isBlocked: updatedUser.isBlocked,
        message: updatedUser.isBlocked ? "User has been blocked" : "User has been unblocked"
    };
}


// Get all purchases with statistics
export async function getAllPurchasesService() {
    // Get all purchases with related data
    const purchases = await prisma.purchase.findMany({
        where: { isActive: true },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            chapter: {
                include: {
                    module: {
                        include: {
                            expertise: {
                                include: {
                                    skillCategory: {
                                        include: {
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
        orderBy: {
            purchaseAt: "desc",
        },
    });

    // Format purchases
    const formattedPurchases = purchases.map((purchase) => ({
        id: purchase.id,
        amount: purchase.amount,
        purchaseAt: purchase.purchaseAt.toISOString(),
        user: purchase.user,
        chapter: purchase.chapter,
    }));

    // Calculate statistics
    const total = purchases.length;
    const totalRevenue = purchases.reduce((sum, p) => sum + p.amount, 0);
    const averagePurchase = total > 0 ? totalRevenue / total : 0;

    // Today's revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayPurchases = purchases.filter(
        (p) => new Date(p.purchaseAt) >= today
    );
    const todayRevenue = todayPurchases.reduce(
        (sum, p) => sum + p.amount,
        0
    );

    // This month's revenue
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisMonthPurchases = purchases.filter(
        (p) => new Date(p.purchaseAt) >= thisMonthStart
    );
    const thisMonthRevenue = thisMonthPurchases.reduce(
        (sum, p) => sum + p.amount,
        0
    );

    // Last month's revenue
    const lastMonthStart = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1
    );
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    const lastMonthPurchases = purchases.filter(
        (p) =>
            new Date(p.purchaseAt) >= lastMonthStart &&
            new Date(p.purchaseAt) <= lastMonthEnd
    );
    const lastMonthRevenue = lastMonthPurchases.reduce(
        (sum, p) => sum + p.amount,
        0
    );

    // Calculate growth percentages
    const revenueGrowth =
        lastMonthRevenue > 0
            ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
            : 0;

    const purchaseGrowth =
        lastMonthPurchases.length > 0
            ? ((thisMonthPurchases.length - lastMonthPurchases.length) /
                lastMonthPurchases.length) *
            100
            : 0;

    return {
        data: formattedPurchases,
        statistics: {
            total,
            totalRevenue,
            averagePurchase,
            todayRevenue,
            thisMonthRevenue,
            lastMonthRevenue,
            revenueGrowth,
            purchaseGrowth,
        },
    };
}