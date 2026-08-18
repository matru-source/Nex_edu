import { Router } from "express";
import {
    healthCheck,
    getProfileController,
    updateUserProfileController,
    updateProfilePhotoController,
    removeProfilePhotoController,
    requestEmailChangeController,
    verifyEmailChangeController,
    changePasswordController,
    getUserStatsController,
    getBillingInfoController,
    createBillingInfoController,
    updateBillingInfoController,
    deleteBillingInfoController,
    setDefaultBillingInfoController,
} from "@controllers/user.controller";
import { verifyUser } from "@/middlewares/auth.middleware";
import validateInput from "@/middlewares/inputValidation.middleware";
import {
    UpdateProfileRequest,
    ChangeEmailRequestSchema,
    VerifyEmailChangeOTPRequest,
    ChangePasswordRequest,
    CreateBillingInfoRequest,
    UpdateBillingInfoRequest,
} from "@/types/zod";

const router = Router();

router.get("/health", healthCheck);

// Profile routes
router.get("/profile", verifyUser("ALL"), getProfileController);
router.put("/profile", verifyUser("ALL"), validateInput(UpdateProfileRequest), updateUserProfileController);
router.post("/profile/photo", verifyUser("ALL"), updateProfilePhotoController);
router.delete("/profile/photo", verifyUser("ALL"), removeProfilePhotoController);

// Email change routes
router.post("/email/change-request", verifyUser("ALL"), validateInput(ChangeEmailRequestSchema), requestEmailChangeController);
router.post("/email/verify-otp", verifyUser("ALL"), validateInput(VerifyEmailChangeOTPRequest), verifyEmailChangeController);

// Password change route
router.post("/password/change", verifyUser("ALL"), validateInput(ChangePasswordRequest), changePasswordController);

// Stats route
router.get("/stats", verifyUser("ALL"), getUserStatsController);

// Billing info routes
router.get("/billing", verifyUser("ALL"), getBillingInfoController);
router.post("/billing", verifyUser("ALL"), validateInput(CreateBillingInfoRequest), createBillingInfoController);
router.put("/billing/:id", verifyUser("ALL"), validateInput(UpdateBillingInfoRequest), updateBillingInfoController);
router.delete("/billing/:id", verifyUser("ALL"), deleteBillingInfoController);
router.put("/billing/:id/set-default", verifyUser("ALL"), setDefaultBillingInfoController);

export default router;