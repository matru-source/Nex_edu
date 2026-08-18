import { Request, Response } from "express";
import { errorHandler } from "@/utils/error";
import { getDashboardStatisticsService } from "@/services/statistics.service";

export async function getDashboardStatisticsController(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const statistics = await getDashboardStatisticsService();

        return res.status(200).json({
            success: true,
            message: "Dashboard statistics retrieved successfully",
            data: statistics,
        });
    } catch (err) {
        return errorHandler(
            err,
            "Error in getDashboardStatisticsController",
            res
        );
    }
}