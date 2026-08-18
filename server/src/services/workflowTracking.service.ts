import { prisma } from "@/utils/prisma";
import { WorkflowAction, EntityType, CourseStatus } from "@prisma/client";

export async function logWorkflowEventService(params: {
    entityType: EntityType;
    entityId: string;
    statusFrom?: CourseStatus;
    statusTo?: CourseStatus;
    action: WorkflowAction;
    performedBy: string;
    performedByName: string;
    metadata?: any;
}) {
    const workflowHistory = await prisma.workflowHistory.create({
        data: {
            entityType: params.entityType,
            entityId: params.entityId,
            statusFrom: params.statusFrom,
            statusTo: params.statusTo,
            action: params.action,
            performedBy: params.performedBy,
            performedByName: params.performedByName,
            metadata: params.metadata,
        },
    });

    return workflowHistory;
}

export async function getWorkflowHistoryService(params: {
    entityType: EntityType;
    entityId: string;
}) {
    const history = await prisma.workflowHistory.findMany({
        where: {
            entityType: params.entityType,
            entityId: params.entityId,
        },
        orderBy: {
            createdAt: 'desc',
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
    });

    return history;
}

export async function getAllWorkflowsService(filters: {
    entityType?: EntityType;
    status?: CourseStatus;
    contributorId?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
}) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.entityType) {
        where.entityType = filters.entityType;
    }

    if (filters.status) {
        where.statusTo = filters.status;
    }

    if (filters.contributorId) {
        where.performedBy = filters.contributorId;
    }

    if (filters.startDate || filters.endDate) {
        where.createdAt = {};
        if (filters.startDate) {
            where.createdAt.gte = filters.startDate;
        }
        if (filters.endDate) {
            where.createdAt.lte = filters.endDate;
        }
    }

    const [workflows, total] = await Promise.all([
        prisma.workflowHistory.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
            },
        }),
        prisma.workflowHistory.count({ where }),
    ]);

    return {
        workflows,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}

export async function getWorkflowStatsService() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get counts by status
    const [
        courseDraftCount,
        chapterDraftCount,
        lessonDraftCount,
        courseSubmittedCount,
        chapterSubmittedCount,
        lessonSubmittedCount,
        courseApprovedCount,
        chapterApprovedCount,
        lessonApprovedCount,
        coursePublishedCount,
        chapterPublishedCount,
        lessonPublishedCount,
        courseRejectedCount,
        chapterRejectedCount,
        lessonRejectedCount,
        recentSubmissions,
        recentApprovals,
        recentRejections,
    ] = await Promise.all([
        prisma.course.count({ where: { status: CourseStatus.DRAFT } }),
        prisma.chapters.count({ where: { status: CourseStatus.DRAFT } }),
        prisma.lessons.count({ where: { status: CourseStatus.DRAFT } }),
        prisma.course.count({ where: { status: CourseStatus.SUBMITTED } }),
        prisma.chapters.count({ where: { status: CourseStatus.SUBMITTED } }),
        prisma.lessons.count({ where: { status: CourseStatus.SUBMITTED } }),
        prisma.course.count({ where: { status: CourseStatus.APPROVED } }),
        prisma.chapters.count({ where: { status: CourseStatus.APPROVED } }),
        prisma.lessons.count({ where: { status: CourseStatus.APPROVED } }),
        prisma.course.count({ where: { status: CourseStatus.PUBLISHED } }),
        prisma.chapters.count({ where: { status: CourseStatus.PUBLISHED } }),
        prisma.lessons.count({ where: { status: CourseStatus.PUBLISHED } }),
        prisma.course.count({ where: { status: CourseStatus.REJECTED } }),
        prisma.chapters.count({ where: { status: CourseStatus.REJECTED } }),
        prisma.lessons.count({ where: { status: CourseStatus.REJECTED } }),
        prisma.workflowHistory.count({
            where: {
                action: WorkflowAction.SUBMITTED,
                createdAt: { gte: thirtyDaysAgo },
            },
        }),
        prisma.workflowHistory.count({
            where: {
                action: WorkflowAction.APPROVED,
                createdAt: { gte: thirtyDaysAgo },
            },
        }),
        prisma.workflowHistory.count({
            where: {
                action: WorkflowAction.REJECTED,
                createdAt: { gte: thirtyDaysAgo },
            },
        }),
    ]);

    const totalDraft = courseDraftCount + chapterDraftCount + lessonDraftCount;
    const totalSubmitted = courseSubmittedCount + chapterSubmittedCount + lessonSubmittedCount;
    const totalApproved = courseApprovedCount + chapterApprovedCount + lessonApprovedCount;
    const totalPublished = coursePublishedCount + chapterPublishedCount + lessonPublishedCount;
    const totalRejected = courseRejectedCount + chapterRejectedCount + lessonRejectedCount;

    // Get top contributors
    const topContributors = await prisma.workflowHistory.groupBy({
        by: ['performedBy', 'performedByName'],
        where: {
            action: WorkflowAction.SUBMITTED,
            createdAt: { gte: thirtyDaysAgo },
        },
        _count: {
            id: true,
        },
        orderBy: {
            _count: {
                id: 'desc',
            },
        },
        take: 5,
    });

    // Calculate average time in each stage (simplified)
    const avgTimeSubmittedToApproved = await calculateAverageTime(
        CourseStatus.SUBMITTED,
        CourseStatus.APPROVED
    );
    const avgTimeApprovedToPublished = await calculateAverageTime(
        CourseStatus.APPROVED,
        CourseStatus.PUBLISHED
    );

    return {
        statusCounts: {
            draft: totalDraft,
            submitted: totalSubmitted,
            approved: totalApproved,
            published: totalPublished,
            rejected: totalRejected,
        },
        recentActivity: {
            submissions: recentSubmissions,
            approvals: recentApprovals,
            rejections: recentRejections,
        },
        topContributors: topContributors.map((c) => ({
            id: c.performedBy,
            name: c.performedByName,
            submissions: c._count.id,
        })),
        averageTimes: {
            submittedToApproved: avgTimeSubmittedToApproved,
            approvedToPublished: avgTimeApprovedToPublished,
        },
    };
}

async function calculateAverageTime(
    fromStatus: CourseStatus,
    toStatus: CourseStatus
): Promise<number> {
    // Get workflows where status changed from -> to
    const workflows = await prisma.workflowHistory.findMany({
        where: {
            statusFrom: fromStatus,
            statusTo: toStatus,
        },
        select: {
            createdAt: true,
            entityType: true,
            entityId: true,
        },
    });

    if (workflows.length === 0) return 0;

    // For each workflow, find the previous status change
    let totalTime = 0;
    let count = 0;

    for (const workflow of workflows) {
        const previousWorkflow = await prisma.workflowHistory.findFirst({
            where: {
                entityType: workflow.entityType,
                entityId: workflow.entityId,
                statusTo: fromStatus,
                createdAt: { lt: workflow.createdAt },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        if (previousWorkflow) {
            const timeDiff =
                workflow.createdAt.getTime() - previousWorkflow.createdAt.getTime();
            totalTime += timeDiff;
            count++;
        }
    }

    // Return average in hours
    return count > 0 ? totalTime / count / (1000 * 60 * 60) : 0;
}

export async function getEntityDetailsService(
    entityType: EntityType,
    entityId: string
) {
    let entity: any = null;

    switch (entityType) {
        case EntityType.COURSE:
            entity = await prisma.course.findUnique({
                where: { id: entityId },
                include: {
                    category: true,
                    subCategory: true,
                },
            });
            break;
        case EntityType.CHAPTER:
            entity = await prisma.chapters.findUnique({
                where: { id: entityId },
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
            break;
        case EntityType.LESSON:
            entity = await prisma.lessons.findUnique({
                where: { id: entityId },
                include: {
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
            });
            break;
    }

    return entity;
}