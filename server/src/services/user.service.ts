import { AppError } from "@/utils/error/errors";
import { prisma } from "@/utils/prisma";
import { User, BillingInfo } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateOTP, sendOTPEmail } from "@/utils/email/email";

export const userService = {
  getUserById: async (id: string) => {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        BillingInfo: {
          where: { isActive: true },
          orderBy: { isDefault: "desc" },
        },
      },
    });
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return user;
  },
};

export async function updateUserProfileService(
  userId: string,
  data: {
    name?: string;
    phone?: string | null;
    bio?: string | null;
    dateOfBirth?: string | null;
    location?: string | null;
    website?: string | null;
    linkedinUrl?: string | null;
    twitterUrl?: string | null;
    goal?: string | null;
    currentStatus?: string | null;
  }
): Promise<User> {
  const updateData: any = {};
  
  if (data.name !== undefined) updateData.name = data.name;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.bio !== undefined) updateData.bio = data.bio;
  if (data.dateOfBirth !== undefined) {
    updateData.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : null;
  }
  if (data.location !== undefined) updateData.location = data.location;
  if (data.website !== undefined) updateData.website = data.website;
  if (data.linkedinUrl !== undefined) updateData.linkedinUrl = data.linkedinUrl;
  if (data.twitterUrl !== undefined) updateData.twitterUrl = data.twitterUrl;
  if (data.goal !== undefined) updateData.goal = data.goal;
  if (data.currentStatus !== undefined) updateData.currentStatus = data.currentStatus;

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  return user;
}

export async function updateProfilePhotoService(
  userId: string,
  photoUrl: string
): Promise<User> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { profilePhoto: photoUrl },
  });

  return user;
}

export async function removeProfilePhotoService(userId: string): Promise<User> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { profilePhoto: null },
  });

  return user;
}

export async function requestEmailChangeService(
  userId: string,
  newEmail: string
): Promise<void> {
  // Check if email is already taken
  const existingUser = await prisma.user.findUnique({
    where: { email: newEmail },
  });

  if (existingUser) {
    throw new AppError("Email is already in use", 400);
  }

  // Generate OTP
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Update user with new email and OTP
  await prisma.user.update({
    where: { id: userId },
    data: {
      newEmail,
      emailChangeOtp: otp,
      emailChangeOtpExpiry: otpExpiry,
    },
  });

  // Send OTP email
  await sendOTPEmail(newEmail, otp);
}

export async function verifyEmailChangeService(
  userId: string,
  newEmail: string,
  otp: string
): Promise<User> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.newEmail !== newEmail) {
    throw new AppError("Email mismatch", 400);
  }

  if (user.emailChangeOtp !== otp) {
    throw new AppError("Invalid OTP", 400);
  }

  if (!user.emailChangeOtpExpiry || user.emailChangeOtpExpiry < new Date()) {
    throw new AppError("OTP has expired", 400);
  }

  // Update email and clear OTP fields
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      email: newEmail,
      newEmail: null,
      emailChangeOtp: null,
      emailChangeOtpExpiry: null,
      emailVerified: true,
    },
  });

  return updatedUser;
}

export async function changePasswordService(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Verify current password - compare plain text (consistent with login)
  if (user.password !== currentPassword) {
    throw new AppError("Current password is incorrect", 400);
  }

  // Store new password as plain text (consistent with signup/reset)
  await prisma.user.update({
    where: { id: userId },
    data: { password: newPassword },
  });
}

export async function getUserStatsService(userId: string) {
  const [purchases, completedLessons, quizAttempts] = await Promise.all([
    prisma.purchase.count({
      where: { userId, isActive: true },
    }),
    prisma.viewingHistory.count({
      where: { userId, isCompleted: true, isActive: true },
    }),
    prisma.quizAttempt.count({
      where: { userId, status: "COMPLETED", isActive: true },
    }),
  ]);

  // Calculate total learning hours (approximate)
  const viewingHistory = await prisma.viewingHistory.findMany({
    where: { userId, isActive: true },
    select: { duration: true },
  });

  const totalSeconds = viewingHistory.reduce((sum, vh) => sum + vh.duration, 0);
  const totalHours = Math.round((totalSeconds / 3600) * 100) / 100;

  return {
    coursesEnrolled: purchases,
    lessonsCompleted: completedLessons,
    quizzesCompleted: quizAttempts,
    totalLearningHours: totalHours,
  };
}

// Billing Info Services
export async function getBillingInfoService(userId: string): Promise<BillingInfo[]> {
  return await prisma.billingInfo.findMany({
    where: { userId, isActive: true },
    orderBy: { isDefault: "desc" },
  });
}

export async function createBillingInfoService(
  userId: string,
  data: {
    fullName: string;
    email: string;
    phone?: string | null;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    state?: string | null;
    postalCode: string;
    country: string;
    cardLast4?: string | null;
    cardBrand?: string | null;
    cardExpiryMonth?: number | null;
    cardExpiryYear?: number | null;
    isDefault?: boolean;
  }
): Promise<BillingInfo> {
  // If this is set as default, unset other defaults
  if (data.isDefault) {
    await prisma.billingInfo.updateMany({
      where: { userId, isActive: true },
      data: { isDefault: false },
    });
  }

  return await prisma.billingInfo.create({
    data: {
      userId,
      ...data,
    },
  });
}

export async function updateBillingInfoService(
  billingId: string,
  userId: string,
  data: Partial<{
    fullName: string;
    email: string;
    phone: string | null;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string | null;
    postalCode: string;
    country: string;
    cardLast4: string | null;
    cardBrand: string | null;
    cardExpiryMonth: number | null;
    cardExpiryYear: number | null;
    isDefault: boolean;
  }>
): Promise<BillingInfo> {
  // Verify ownership
  const billing = await prisma.billingInfo.findFirst({
    where: { id: billingId, userId, isActive: true },
  });

  if (!billing) {
    throw new AppError("Billing info not found", 404);
  }

  // If setting as default, unset other defaults
  if (data.isDefault) {
    await prisma.billingInfo.updateMany({
      where: { userId, id: { not: billingId }, isActive: true },
      data: { isDefault: false },
    });
  }

  return await prisma.billingInfo.update({
    where: { id: billingId },
    data,
  });
}

export async function deleteBillingInfoService(
  billingId: string,
  userId: string
): Promise<void> {
  const billing = await prisma.billingInfo.findFirst({
    where: { id: billingId, userId, isActive: true },
  });

  if (!billing) {
    throw new AppError("Billing info not found", 404);
  }

  await prisma.billingInfo.update({
    where: { id: billingId },
    data: { isActive: false },
  });
}

export async function setDefaultBillingInfoService(
  billingId: string,
  userId: string
): Promise<BillingInfo> {
  const billing = await prisma.billingInfo.findFirst({
    where: { id: billingId, userId, isActive: true },
  });

  if (!billing) {
    throw new AppError("Billing info not found", 404);
  }

  // Unset other defaults
  await prisma.billingInfo.updateMany({
    where: { userId, id: { not: billingId }, isActive: true },
    data: { isDefault: false },
  });

  // Set this as default
  return await prisma.billingInfo.update({
    where: { id: billingId },
    data: { isDefault: true },
  });
}