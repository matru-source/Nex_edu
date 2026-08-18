import { Router } from "express";
import { verifyUser } from "@/middlewares/auth.middleware";
import {
    getAllQuestionsForAdminController,
    deleteQuestionController,
    deleteReplyController,
    createAdminReplyController,
    blockUserController,
    unblockUserController,
    getAllBlocksController,
    getUserBlocksController,
    checkUserBlockedController,
    getFaqStatsController,
} from "@/controllers/faq-admin.controller";

const router = Router();

// All routes require ADMIN role
router.get("/questions", verifyUser("ADMIN"), getAllQuestionsForAdminController);
router.get("/stats", verifyUser("ADMIN"), getFaqStatsController);
router.delete("/question/:id", verifyUser("ADMIN"), deleteQuestionController);
router.delete("/reply/:id", verifyUser("ADMIN"), deleteReplyController);
router.post("/reply", verifyUser("ADMIN"), createAdminReplyController);
router.post("/block", verifyUser("ADMIN"), blockUserController);
router.delete("/block/:id", verifyUser("ADMIN"), unblockUserController);
router.get("/blocks", verifyUser("ADMIN"), getAllBlocksController);
router.get("/blocks/user/:userId", verifyUser("ADMIN"), getUserBlocksController);

// This endpoint can be accessed by any authenticated user to check their own block status
router.get("/check-blocked", verifyUser("ALL"), checkUserBlockedController);

export default router;
