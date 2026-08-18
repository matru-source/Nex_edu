import {
    loginController,
    signupController,
    verifyOTPController,
    resendOTPController,
    me,
    sendForgetPasswordOTPController,
    verifyForgetPasswordOTPController,
    resetPasswordController
} from "@/controllers/auth.controller";
import { verifyUser } from "@/middlewares/auth.middleware";
import validateInput from "@/middlewares/inputValidation.middleware";
import {
    SignupRequest,
    VerifyOTPRequest,
    ResendOTPRequest,
    ForgetPasswordRequest,
    VerifyForgetPasswordOTPRequest,
    ResetPasswordRequest
} from "@/types/zod";
import { Router } from "express";

const router = Router();

router.post("/login", loginController);
router.post("/signup", validateInput(SignupRequest), signupController);
router.post("/verify-otp", validateInput(VerifyOTPRequest), verifyOTPController);
router.post("/resend-otp", validateInput(ResendOTPRequest), resendOTPController);
router.post("/forget-password", validateInput(ForgetPasswordRequest), sendForgetPasswordOTPController);
router.post("/verify-forget-password-otp", validateInput(VerifyForgetPasswordOTPRequest), verifyForgetPasswordOTPController);
router.post("/reset-password", validateInput(ResetPasswordRequest), resetPasswordController);
router.get("/me", verifyUser("ALL"), me);

export default router;