import {
    createUserService,
    getUsersService,
    getUserByIdService,
    updateUserService,
    deleteUserService,
} from "@/services/userManagement.service";
import { errorHandler } from "@/utils/error";
import { Request, Response } from "express";

export async function createUserController(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const adminId = req.user?.id;

        if (!adminId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const { user, generatedPassword } = await createUserService(
            req.body,
            adminId
        );

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            data: {
                user,
                ...(generatedPassword && {
                    password: generatedPassword,
                    message: "Password was auto-generated and sent via email"
                }),
            },
        });
    } catch (err) {
        return errorHandler(err, "Error in createUserController", res);
    }
}

export async function getUsersController(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const { role, isActive, page, limit } = req.query;

        const filters: any = {};
        if (role) filters.role = role;
        if (isActive !== undefined) {
            filters.isActive = isActive === 'true';
        }
        if (page) filters.page = parseInt(page as string) || 1;
        if (limit) filters.limit = parseInt(limit as string) || 10;

        const result = await getUsersService(filters);

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (err) {
        return errorHandler(err, "Error in getUsersController", res);
    }
}

export async function getUserByIdController(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const { userId } = req.params;

        const user = await getUserByIdService(userId);

        return res.status(200).json({
            success: true,
            data: user,
        });
    } catch (err) {
        return errorHandler(err, "Error in getUserByIdController", res);
    }
}

export async function updateUserController(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const adminId = req.user?.id;
        const { userId } = req.params;

        if (!adminId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const user = await updateUserService(userId, req.body, adminId);

        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: user,
        });
    } catch (err) {
        return errorHandler(err, "Error in updateUserController", res);
    }
}

export async function deleteUserController(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const { userId } = req.params;

        await deleteUserService(userId);

        return res.status(200).json({
            success: true,
            message: "User deleted successfully", // Changed from "deactivated"
        });
    } catch (err) {
        return errorHandler(err, "Error in deleteUserController", res);
    }
}