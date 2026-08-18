import { AppError } from "@/utils/error/errors";
import { generateJwt } from "@/utils/jwt";
import { prisma } from "@/utils/prisma";
import { User } from "@prisma/client";
import { sendForgetPasswordOTPEmail, sendOTPEmail, sendPasswordResetConfirmationEmail, sendWelcomeEmail } from "@/utils/email/email";

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function loginService(email: string, password: string): Promise<{ user: User, token: string }> {
  const user = await prisma.user.findFirst({
    where: { email, password }
  });

  if (!user) {
    throw new AppError("Invalid email or password", 400);
  }

  if (!user.isActive) {
    throw new AppError("Account is deactivated", 403);
  }

  const token = generateJwt({ id: user.id, email: user.email });
  const cleanUser = { ...user, password: "TryMeAndFail" };

  return { user: cleanUser, token };
}

export async function sendSignupOTPService(
  name: string,
  email: string,
  password: string,
  goal?: string,
  currentStatus?: string
): Promise<{ message: string }> {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new AppError("Email already registered", 400);
  }

  // Generate OTP
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Store signup data temporarily (you might want to use Redis for this in production)
  // For now, we'll create user with emailVerified = false
  await prisma.user.create({
    data: {
      name,
      email,
      password,
      role: 'STUDENT',
      goal: goal || null,
      currentStatus: currentStatus || null,
      emailVerified: false,
      otp,
      otpExpiry,
    }
  });

  // Send OTP email
  await sendOTPEmail(email, otp);

  return { message: "OTP sent to your email" };
}

export async function verifyOTPService(email: string, otp: string): Promise<{ user: User, token: string }> {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.emailVerified) {
    throw new AppError("Email already verified", 400);
  }

  if (!user.otp || user.otp !== otp) {
    throw new AppError("Invalid OTP", 400);
  }

  if (!user.otpExpiry || user.otpExpiry < new Date()) {
    throw new AppError("OTP has expired. Please request a new one", 400);
  }

  // Verify email and clear OTP
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      otp: null,
      otpExpiry: null,
      isActive: true,
    }
  });

  // Send welcome email
  await sendWelcomeEmail(email, user.name);

  // Generate token
  const token = generateJwt({ id: updatedUser.id, email: updatedUser.email });
  const cleanUser = { ...updatedUser, password: "TryMeAndFail" };

  return { user: cleanUser, token };
}

export async function resendOTPService(email: string): Promise<{ message: string }> {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.emailVerified) {
    throw new AppError("Email already verified", 400);
  }

  // Generate new OTP
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      otp,
      otpExpiry,
    }
  });

  await sendOTPEmail(email, otp);

  return { message: "OTP resent to your email" };
}

export async function sendForgetPasswordOTPService(email: string): Promise<{ message: string }> {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    // Don't reveal if user exists for security
    return { message: "If an account exists with this email, an OTP has been sent" };
  }

  if (!user.isActive) {
    throw new AppError("Account is deactivated", 403);
  }

  // Generate OTP
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Store OTP for password reset
  await prisma.user.update({
    where: { id: user.id },
    data: {
      otp,
      otpExpiry,
    }
  });

  // Send OTP email
  await sendForgetPasswordOTPEmail(email, otp);

  return { message: "If an account exists with this email, an OTP has been sent" };
}

export async function verifyForgetPasswordOTPService(email: string, otp: string): Promise<{ verified: boolean }> {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.otp || user.otp !== otp) {
    throw new AppError("Invalid OTP", 400);
  }

  if (!user.otpExpiry || user.otpExpiry < new Date()) {
    throw new AppError("OTP has expired. Please request a new one", 400);
  }

  // OTP is valid, but don't clear it yet - we'll clear it after password reset
  return { verified: true };
}

export async function resetPasswordService(
  email: string,
  otp: string,
  newPassword: string
): Promise<{ message: string }> {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.otp || user.otp !== otp) {
    throw new AppError("Invalid OTP", 400);
  }

  if (!user.otpExpiry || user.otpExpiry < new Date()) {
    throw new AppError("OTP has expired. Please request a new one", 400);
  }

  // Update password and clear OTP
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: newPassword,
      otp: null,
      otpExpiry: null,
    }
  });

  // Send confirmation email
  await sendPasswordResetConfirmationEmail(email, user.name);

  return { message: "Password reset successfully" };
}