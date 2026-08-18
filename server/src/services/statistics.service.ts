import { prisma } from "@/utils/prisma";

// Get overall statistics
export async function getDashboardStatisticsService() {
    // Total counts
    const [
        totalCourses,
        totalStudents,
        totalPurchases,
        totalChapters,
        totalModules,
        totalLessons,
        totalSkillCategories,
        totalExpertise,
    ] = await Promise.all([
        prisma.course.count({ where: { isActive: true } }),
        prisma.user.count({ where: { role: "STUDENT" } }),
        prisma.purchase.count({ where: { isActive: true } }),
        prisma.chapters.count({ where: { isActive: true } }),
        prisma.module.count({ where: { isActive: true } }),
        prisma.lessons.count({ where: { isActive: true } }),
        prisma.skillCategory.count({ where: { isActive: true } }),
        prisma.expertise.count({ where: { isActive: true } }),
    ]);

    // Total revenue
    const revenueResult = await prisma.purchase.aggregate({
        where: { isActive: true },
        _sum: { amount: true },
    });

    const totalRevenue = revenueResult._sum.amount || 0;

    // Average purchase amount
    const avgPurchaseResult = await prisma.purchase.aggregate({
        where: { isActive: true },
        _avg: { amount: true },
    });

    const averagePurchase = avgPurchaseResult._avg.amount || 0;

    // Purchases by month (last 12 months)
    const purchasesByMonth = await prisma.$queryRaw<Array<{
        month: string;
        count: bigint;
        revenue: number;
    }>>`
    SELECT 
      TO_CHAR("purchaseAt", 'YYYY-MM') as month,
      COUNT(*)::int as count,
      SUM("amount")::float as revenue
    FROM "Purchase"
    WHERE "isActive" = true 
      AND "purchaseAt" >= NOW() - INTERVAL '12 months'
    GROUP BY TO_CHAR("purchaseAt", 'YYYY-MM')
    ORDER BY month ASC
  `;

    // Chapters by price distribution
    const chapterPriceDistribution = await prisma.$queryRaw<Array<{
        price_range: string;
        count: bigint;
    }>>`
    SELECT 
      CASE
        WHEN "price" = 0 THEN 'Free'
        WHEN "price" > 0 AND "price" <= 10 THEN '$1-$10'
        WHEN "price" > 10 AND "price" <= 25 THEN '$11-$25'
        WHEN "price" > 25 AND "price" <= 50 THEN '$26-$50'
        WHEN "price" > 50 AND "price" <= 100 THEN '$51-$100'
        ELSE '$100+'
      END as price_range,
      COUNT(*)::int as count
    FROM "Chapters"
    WHERE "isActive" = true
    GROUP BY 
      CASE
        WHEN "price" = 0 THEN 'Free'
        WHEN "price" > 0 AND "price" <= 10 THEN '$1-$10'
        WHEN "price" > 10 AND "price" <= 25 THEN '$11-$25'
        WHEN "price" > 25 AND "price" <= 50 THEN '$26-$50'
        WHEN "price" > 50 AND "price" <= 100 THEN '$51-$100'
        ELSE '$100+'
      END
    ORDER BY 
      CASE
        WHEN 
          CASE
            WHEN "price" = 0 THEN 'Free'
            WHEN "price" > 0 AND "price" <= 10 THEN '$1-$10'
            WHEN "price" > 10 AND "price" <= 25 THEN '$11-$25'
            WHEN "price" > 25 AND "price" <= 50 THEN '$26-$50'
            WHEN "price" > 50 AND "price" <= 100 THEN '$51-$100'
            ELSE '$100+'
          END = 'Free' THEN 1
        WHEN 
          CASE
            WHEN "price" = 0 THEN 'Free'
            WHEN "price" > 0 AND "price" <= 10 THEN '$1-$10'
            WHEN "price" > 10 AND "price" <= 25 THEN '$11-$25'
            WHEN "price" > 25 AND "price" <= 50 THEN '$26-$50'
            WHEN "price" > 50 AND "price" <= 100 THEN '$51-$100'
            ELSE '$100+'
          END = '$1-$10' THEN 2
        WHEN 
          CASE
            WHEN "price" = 0 THEN 'Free'
            WHEN "price" > 0 AND "price" <= 10 THEN '$1-$10'
            WHEN "price" > 10 AND "price" <= 25 THEN '$11-$25'
            WHEN "price" > 25 AND "price" <= 50 THEN '$26-$50'
            WHEN "price" > 50 AND "price" <= 100 THEN '$51-$100'
            ELSE '$100+'
          END = '$11-$25' THEN 3
        WHEN 
          CASE
            WHEN "price" = 0 THEN 'Free'
            WHEN "price" > 0 AND "price" <= 10 THEN '$1-$10'
            WHEN "price" > 10 AND "price" <= 25 THEN '$11-$25'
            WHEN "price" > 25 AND "price" <= 50 THEN '$26-$50'
            WHEN "price" > 50 AND "price" <= 100 THEN '$51-$100'
            ELSE '$100+'
          END = '$26-$50' THEN 4
        WHEN 
          CASE
            WHEN "price" = 0 THEN 'Free'
            WHEN "price" > 0 AND "price" <= 10 THEN '$1-$10'
            WHEN "price" > 10 AND "price" <= 25 THEN '$11-$25'
            WHEN "price" > 25 AND "price" <= 50 THEN '$26-$50'
            WHEN "price" > 50 AND "price" <= 100 THEN '$51-$100'
            ELSE '$100+'
          END = '$51-$100' THEN 5
        ELSE 6
      END
  `;

    // Top selling courses (by purchase count)
    const topCourses = await prisma.purchase.groupBy({
        by: ["courseId"],
        where: {
            isActive: true,
            courseId: { not: null },
        },
        _count: { id: true },
        _sum: { amount: true },
        orderBy: {
            _count: {
                id: "desc",
            },
        },
        take: 5,
    });

    const topCoursesWithDetails = await Promise.all(
        topCourses.map(async (course) => {
            if (!course.courseId) return null;
            const courseDetails = await prisma.course.findUnique({
                where: { id: course.courseId },
                include: {
                    category: true,
                    subCategory: true,
                },
            });
            return {
                course: courseDetails,
                purchaseCount: course._count.id,
                totalRevenue: course._sum.amount || 0,
            };
        })
    );

    // Student registration by month (last 12 months)
    const studentsByMonth = await prisma.$queryRaw<Array<{
        month: string;
        count: bigint;
    }>>`
    SELECT 
      TO_CHAR("createdAt", 'YYYY-MM') as month,
      COUNT(*)::int as count
    FROM "User"
    WHERE "role" = 'STUDENT'
      AND "createdAt" >= NOW() - INTERVAL '12 months'
    GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
    ORDER BY month ASC
  `;

    // Course creation by month
    const coursesByMonth = await prisma.$queryRaw<Array<{
        month: string;
        count: bigint;
    }>>`
    SELECT 
      TO_CHAR("createdAt", 'YYYY-MM') as month,
      COUNT(*)::int as count
    FROM "Course"
    WHERE "isActive" = true
      AND "createdAt" >= NOW() - INTERVAL '12 months'
    GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
    ORDER BY month ASC
  `;

    // Recent purchases (last 10)
    const recentPurchases = await prisma.purchase.findMany({
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
        take: 10,
    });

    // Students by status/goal
    const studentsByGoal = await prisma.user.groupBy({
        by: ["goal"],
        where: {
            role: "STUDENT",
            goal: { not: null },
        },
        _count: { id: true },
    });

    const studentsByStatus = await prisma.user.groupBy({
        by: ["currentStatus"],
        where: {
            role: "STUDENT",
            currentStatus: { not: null },
        },
        _count: { id: true },
    });

    // Purchase vs Free chapters
    const chaptersStats = await prisma.chapters.aggregate({
        where: { isActive: true },
        _count: { id: true },
        _sum: { price: true },
        _avg: { price: true },
    });

    const freeChapters = await prisma.chapters.count({
        where: { isActive: true, price: 0 },
    });

    const paidChapters = (chaptersStats._count.id || 0) - freeChapters;

    return {
        totals: {
            courses: totalCourses,
            students: totalStudents,
            purchases: totalPurchases,
            chapters: totalChapters,
            modules: totalModules,
            lessons: totalLessons,
            skillCategories: totalSkillCategories,
            expertise: totalExpertise,
        },
        revenue: {
            total: totalRevenue,
            average: averagePurchase,
        },
        purchasesByMonth: purchasesByMonth.map((p) => ({
            month: p.month,
            count: Number(p.count),
            revenue: Number(p.revenue),
        })),
        chapterPriceDistribution: chapterPriceDistribution.map((c) => ({
            range: c.price_range, // ✅ Map price_range back to range for consistency
            count: Number(c.count),
        })),
        topCourses: topCoursesWithDetails.filter((c) => c !== null),
        studentsByMonth: studentsByMonth.map((s) => ({
            month: s.month,
            count: Number(s.count),
        })),
        coursesByMonth: coursesByMonth.map((c) => ({
            month: c.month,
            count: Number(c.count),
        })),
        recentPurchases,
        studentsByGoal: studentsByGoal.map((s) => ({
            goal: s.goal || "Not Specified",
            count: s._count.id,
        })),
        studentsByStatus: studentsByStatus.map((s) => ({
            status: s.currentStatus || "Not Specified",
            count: s._count.id,
        })),
        chapters: {
            total: chaptersStats._count.id || 0,
            free: freeChapters,
            paid: paidChapters,
            totalValue: chaptersStats._sum.price || 0,
            averagePrice: chaptersStats._avg.price || 0,
        },
    };
}