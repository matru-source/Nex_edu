import { Router } from "express";
import {
    createContactSubmissionController,
    getAllContactSubmissionsController,
    markContactAsReadController,
    deleteContactSubmissionController,
} from "@/controllers/contact.controller";
import { verifyUser } from "@/middlewares/auth.middleware";

const router = Router();

// Public route - anyone can submit contact form
router.post("/", createContactSubmissionController);

// Admin only routes
router.get("/", verifyUser('ADMIN'), getAllContactSubmissionsController);
router.patch("/:id/read", verifyUser('ADMIN'), markContactAsReadController);
router.delete("/:id", verifyUser('ADMIN'), deleteContactSubmissionController);

export default router;
