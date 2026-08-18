import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface CreateContactSubmissionParams {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
}

export const createContactSubmission = async (data: CreateContactSubmissionParams) => {
    return await prisma.contactSubmission.create({
        data: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            subject: data.subject,
            message: data.message,
        },
    });
};

export const getAllContactSubmissions = async (page: number = 1, limit: number = 20) => {
    const skip = (page - 1) * limit;

    const [submissions, total] = await Promise.all([
        prisma.contactSubmission.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        }),
        prisma.contactSubmission.count({
            where: { isActive: true },
        }),
    ]);

    return {
        submissions,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const markContactAsRead = async (id: string) => {
    return await prisma.contactSubmission.update({
        where: { id },
        data: {
            isRead: true,
            readAt: new Date(),
        },
    });
};

export const deleteContactSubmission = async (id: string) => {
    return await prisma.contactSubmission.update({
        where: { id },
        data: { isActive: false },
    });
};
