import { Router } from "express";
import { verifyUser } from "@/middlewares/auth.middleware";
import {
    createPurchaseController,
    getUserPurchasesController,
    getUserPurchasedChaptersController,
    checkChapterPurchaseStatusController,
    checkCoursePurchaseStatusController,
    getPurchasedCoursesController,
    getUserPurchasesWithHierarchyController,
} from "@/controllers/purchase.controller";

const router = Router();

router.post("/create", verifyUser("STUDENT"), createPurchaseController);
router.get("/my-purchases", verifyUser("STUDENT"), getUserPurchasesController);
router.get("/my-purchases/hierarchy", verifyUser("STUDENT"), getUserPurchasesWithHierarchyController);
router.get("/my-chapters", verifyUser("STUDENT"), getUserPurchasedChaptersController);
router.get("/check/chapter/:chapterId", verifyUser("STUDENT"), checkChapterPurchaseStatusController);
router.get("/check/course/:courseId", verifyUser("STUDENT"), checkCoursePurchaseStatusController);
router.get("/courses", verifyUser("STUDENT"), getPurchasedCoursesController);

export default router;