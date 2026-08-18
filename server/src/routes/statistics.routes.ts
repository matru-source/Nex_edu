import { Router } from "express";
import { verifyUser } from "@/middlewares/auth.middleware";
import { getDashboardStatisticsController } from "@/controllers/statistics.controller";

const router = Router();

router.get(
    "/dashboard",
    verifyUser("ADMIN"),
    getDashboardStatisticsController
);

export default router;