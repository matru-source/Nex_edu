import {
  loginService,
  sendSignupOTPService,
  verifyOTPService,
  resendOTPService,
  resetPasswordService,
  verifyForgetPasswordOTPService,
  sendForgetPasswordOTPService
} from "@/services/auth.service";
import { userService } from "@/services/user.service";
import { LoginRequest, SignupRequest, VerifyOTPRequest, ResendOTPRequest , ForgetPasswordRequest, VerifyForgetPasswordOTPRequest, ResetPasswordRequest } from "@/types/zod";
import { errorHandler } from "@/utils/error";
import { Request, Response } from "express";

export async function loginController(req: Request, res: Response): Promise<Response> {
  try {
    const { email, password } = LoginRequest.parse(req.body);
    const data = await loginService(email, password);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in loginController", res);
  }
}

export async function signupController(req: Request, res: Response): Promise<Response> {
  try {
    const { name, email, password, goal, currentStatus } = SignupRequest.parse(req.body);
    const data = await sendSignupOTPService(name, email, password, goal, currentStatus);

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email. Please verify to complete signup.",
      data: data
    });
  } catch (error) {
    return errorHandler(error, "Error in signupController", res);
  }
}

export async function verifyOTPController(req: Request, res: Response): Promise<Response> {
  try {
    const { email, otp } = VerifyOTPRequest.parse(req.body);
    const data = await verifyOTPService(email, otp);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      data: data
    });
  } catch (error) {
    return errorHandler(error, "Error in verifyOTPController", res);
  }
}

export async function resendOTPController(req: Request, res: Response): Promise<Response> {
  try {
    const { email } = ResendOTPRequest.parse(req.body);
    const data = await resendOTPService(email);

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully",
      data: data
    });
  } catch (error) {
    return errorHandler(error, "Error in resendOTPController", res);
  }
}

export async function me(req: Request, res: Response): Promise<Response> {
  try {
    const user = await userService.getUserById(req.user.id);

    return res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: { user }
    });
  } catch (error) {
    return errorHandler(error, "Error in me controller", res);
  }
}

export async function sendForgetPasswordOTPController(req: Request, res: Response): Promise<Response> {
  try {
    const { email } = ForgetPasswordRequest.parse(req.body);
    const data = await sendForgetPasswordOTPService(email);

    return res.status(200).json({
      success: true,
      message: "If an account exists with this email, an OTP has been sent",
      data: data
    });
  } catch (error) {
    return errorHandler(error, "Error in sendForgetPasswordOTPController", res);
  }
}

export async function verifyForgetPasswordOTPController(req: Request, res: Response): Promise<Response> {
  try {
    const { email, otp } = VerifyForgetPasswordOTPRequest.parse(req.body);
    const data = await verifyForgetPasswordOTPService(email, otp);

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      data: data
    });
  } catch (error) {
    return errorHandler(error, "Error in verifyForgetPasswordOTPController", res);
  }
}

export async function resetPasswordController(req: Request, res: Response): Promise<Response> {
  try {
    const { email, otp, newPassword } = ResetPasswordRequest.parse(req.body);
    const data = await resetPasswordService(email, otp, newPassword);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
      data: data
    });
  } catch (error) {
    return errorHandler(error, "Error in resetPasswordController", res);
  }
}