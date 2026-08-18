import { AppError } from "@/utils/error/errors";
import { prisma } from "@/utils/prisma";
import { User, UserRole } from "@prisma/client";
import { generatePasswordFromName } from "@/utils/passwordGenerator";
import { sendUserCreatedEmail } from "@/utils/email/email";

export interface CreateUserData {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    phone?: string;
    isActive?: boolean;
}

export interface UpdateUserData {
    name?: string;
    email?: string;
    role?: UserRole;
    phone?: string;
    isActive?: boolean;
}

export async function createUserService(
    data: CreateUserData,
    createdBy: string
): Promise<{ user: User; generatedPassword: string }> {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
    });

    if (existingUser) {
        throw new AppError("Email is already in use", 400);
    }

    // Generate password if not provided
    const password = data.password || generatePasswordFromName(data.name);
    const generatedPassword = data.password ? "" : password;

    // Create user
    const user = await prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            password: password,
            role: data.role,
            phone: data.phone,
            isActive: data.isActive ?? true,
            createdBy: createdBy,
            emailVerified: true, // Admin-created users are pre-verified
        },
    });

    // Send welcome email with credentials
    try {
        await sendUserCreatedEmail(
            user.email,
            user.name,
            password,
            user.role
        );
    } catch (emailError) {
        // Log error but don't fail user creation
        console.error("Failed to send user creation email:", emailError);
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
        user: userWithoutPassword as User,
        generatedPassword,
    };
}

export async function getUsersService(
    filters: {
        role?: UserRole;
        isActive?: boolean;
        page?: number;
        limit?: number;
    }
): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.role) {
        where.role = filters.role;
    }
    if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
    }

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                createdBy: true,
                updatedBy: true,
                emailVerified: true,
                profilePhoto: true,
            },
        }),
        prisma.user.count({ where }),
    ]);

    return {
        users: users as User[],
        total,
        page,
        limit,
    };
}

export async function getUserByIdService(userId: string): Promise<User> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            createdBy: true,
            updatedBy: true,
            emailVerified: true,
            profilePhoto: true,
        },
    });

    if (!user) {
        throw new AppError("User not found", 404);
    }

    return user as User;
}

export async function updateUserService(
    userId: string,
    data: UpdateUserData,
    updatedBy: string
): Promise<User> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!existingUser) {
        throw new AppError("User not found", 404);
    }

    // Check if email is being changed and if it's already taken
    if (data.email && data.email !== existingUser.email) {
        const emailTaken = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (emailTaken) {
            throw new AppError("Email is already in use", 400);
        }
    }

    // Update user
    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            ...data,
            updatedBy: updatedBy,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            createdBy: true,
            updatedBy: true,
            emailVerified: true,
            profilePhoto: true,
        },
    });

    return user as User;
}

export async function deleteUserService(userId: string): Promise<void> {
    // Check if user exists
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new AppError("User not found", 404);
    }

    // Hard delete - permanently delete the user
    await prisma.user.delete({
        where: { id: userId },
    });
}