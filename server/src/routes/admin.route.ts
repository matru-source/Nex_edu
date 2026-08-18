import { Router } from "express";
import { verifyUser } from "@/middlewares/auth.middleware";
import {
    getAllStudentsController,
    getAllPurchasesController,
    getStudentDetailsController,
    toggleUserBlockController,
} from "@/controllers/admin.controller";

const router = Router();

router.get(
    "/students",
    verifyUser("ADMIN"),
    getAllStudentsController
);

router.get(
    "/students/:id",
    verifyUser("ADMIN"),
    getStudentDetailsController
);

router.patch(
    "/students/:id/block",
    verifyUser("ADMIN"),
    toggleUserBlockController
);

router.get(
    "/purchases",
    verifyUser("ADMIN"),
    getAllPurchasesController
);

export default router;