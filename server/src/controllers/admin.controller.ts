import { Request, Response } from "express";
import { errorHandler } from "@/utils/error";
import {
    getAllStudentsService,
    getAllPurchasesService,
    getStudentDetailsService,
    toggleUserBlockService,
} from "@/services/admin.service";

export async function getAllStudentsController(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const result = await getAllStudentsService();

        return res.status(200).json({
            success: true,
            message: "Students retrieved successfully",
            ...result,
        });
    } catch (err) {
        return errorHandler(err, "Error in getAllStudentsController", res);
    }
}

export async function getStudentDetailsController(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const { id } = req.params;
        const result = await getStudentDetailsService(id);

        return res.status(200).json({
            success: true,
            message: "Student details retrieved successfully",
            data: result,
        });
    } catch (err) {
        return errorHandler(err, "Error in getStudentDetailsController", res);
    }
}

export async function toggleUserBlockController(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const { id } = req.params;
        const result = await toggleUserBlockService(id);

        return res.status(200).json({
            ...result,
        });
    } catch (err) {
        return errorHandler(err, "Error in toggleUserBlockController", res);
    }
}

export async function getAllPurchasesController(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const result = await getAllPurchasesService();

        return res.status(200).json({
            success: true,
            message: "Purchases retrieved successfully",
            ...result,
        });
    } catch (err) {
        return errorHandler(err, "Error in getAllPurchasesController", res);
    }
}