import { Request, Response } from 'express';
import {
    createMaterialService,
    getMaterialsByLevelService,
    getMaterialsByCoursePathService,
    getMaterialByIdService,
    updateMaterialService,
    deleteMaterialService,
    getMaterialsByTypeService,
    getRequiredMaterialsService,
} from '@/services/material.service';
import { errorHandler } from '@/utils/error';
import { CreateMaterialRequestParams, UpdateMaterialRequestParams, GetMaterialsByLevelRequestParams } from '@/types/zod';

export async function createMaterialController(req: Request, res: Response): Promise<Response> {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
        }

        const data: CreateMaterialRequestParams = req.body;
        const material = await createMaterialService(data, userId);

        return res.status(201).json({
            success: true,
            message: "Material created successfully",
            data: material
        });
    } catch (error) {
        return errorHandler(error, "Error in createMaterialController", res);
    }
}

export async function getMaterialsByLevelController(req: Request, res: Response): Promise<Response> {
    try {
        const params: GetMaterialsByLevelRequestParams = req.query;
        const materials = await getMaterialsByLevelService(params);

        return res.status(200).json({
            success: true,
            message: "Materials retrieved successfully",
            data: materials
        });
    } catch (error) {
        return errorHandler(error, "Error in getMaterialsByLevelController", res);
    }
}

export async function getMaterialsByCoursePathController(req: Request, res: Response): Promise<Response> {
    try {
        const { courseId } = req.params;
        const { skillCategoryId, expertiseId, moduleId, chapterId, lessonId } = req.query;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "Course ID is required"
            });
        }

        const materials = await getMaterialsByCoursePathService(
            courseId,
            skillCategoryId as string,
            expertiseId as string,
            moduleId as string,
            chapterId as string,
            lessonId as string
        );

        return res.status(200).json({
            success: true,
            message: "Materials retrieved successfully",
            data: materials
        });
    } catch (error) {
        return errorHandler(error, "Error in getMaterialsByCoursePathController", res);
    }
}

export async function getMaterialByIdController(req: Request, res: Response): Promise<Response> {
    try {
        const { materialId } = req.params;

        if (!materialId) {
            return res.status(400).json({
                success: false,
                message: "Material ID is required"
            });
        }

        const material = await getMaterialByIdService(materialId);

        if (!material) {
            return res.status(404).json({
                success: false,
                message: "Material not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Material retrieved successfully",
            data: material
        });
    } catch (error) {
        return errorHandler(error, "Error in getMaterialByIdController", res);
    }
}

export async function updateMaterialController(req: Request, res: Response): Promise<Response> {
    try {
        const { materialId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
        }

        if (!materialId) {
            return res.status(400).json({
                success: false,
                message: "Material ID is required"
            });
        }

        const data: UpdateMaterialRequestParams = req.body;
        const material = await updateMaterialService(materialId, data, userId);

        return res.status(200).json({
            success: true,
            message: "Material updated successfully",
            data: material
        });
    } catch (error) {
        return errorHandler(error, "Error in updateMaterialController", res);
    }
}

export async function deleteMaterialController(req: Request, res: Response): Promise<Response> {
    try {
        const { materialId } = req.params;

        if (!materialId) {
            return res.status(400).json({
                success: false,
                message: "Material ID is required"
            });
        }

        await deleteMaterialService(materialId);

        return res.status(200).json({
            success: true,
            message: "Material deleted successfully"
        });
    } catch (error) {
        return errorHandler(error, "Error in deleteMaterialController", res);
    }
}

export async function getMaterialsByTypeController(req: Request, res: Response): Promise<Response> {
    try {
        const { materialType } = req.params;

        if (!materialType) {
            return res.status(400).json({
                success: false,
                message: "Material type is required"
            });
        }

        const materials = await getMaterialsByTypeService(materialType as any);

        return res.status(200).json({
            success: true,
            message: "Materials retrieved successfully",
            data: materials
        });
    } catch (error) {
        return errorHandler(error, "Error in getMaterialsByTypeController", res);
    }
}

export async function getRequiredMaterialsController(req: Request, res: Response): Promise<Response> {
    try {
        const { courseId, skillCategoryId, expertiseId, moduleId, chapterId, lessonId } = req.query;

        const materials = await getRequiredMaterialsService(
            courseId as string,
            skillCategoryId as string,
            expertiseId as string,
            moduleId as string,
            chapterId as string,
            lessonId as string
        );

        return res.status(200).json({
            success: true,
            message: "Required materials retrieved successfully",
            data: materials
        });
    } catch (error) {
        return errorHandler(error, "Error in getRequiredMaterialsController", res);
    }
}