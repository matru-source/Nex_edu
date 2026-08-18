import {
  updateUserProfileService,
  updateProfilePhotoService,
  removeProfilePhotoService,
  requestEmailChangeService,
  verifyEmailChangeService,
  changePasswordService,
  getUserStatsService,
  getBillingInfoService,
  createBillingInfoService,
  updateBillingInfoService,
  deleteBillingInfoService,
  setDefaultBillingInfoService,
  userService,
} from "@/services/user.service";
import { errorHandler } from "@/utils/error";
import { Request, Response } from "express";

export async function healthCheck(req: Request, res: Response): Promise<Response> {
  return res.status(200).json({
    success: true,
    message: "Server is up and running",
  });
}

export async function getProfileController(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await userService.getUserById(userId);
    const stats = await getUserStatsService(userId);

    // Remove sensitive data
    const { password, otp, otpExpiry, emailChangeOtp, emailChangeOtpExpiry, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      data: { user: safeUser, stats },
    });
  } catch (err) {
    return errorHandler(err, "Error in getProfileController", res);
  }
}

export async function updateUserProfileController(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const userId = req.user?.id;
    const data = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await updateUserProfileService(userId, data);

    // Remove sensitive data
    const { password, otp, otpExpiry, emailChangeOtp, emailChangeOtpExpiry, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: { user: safeUser },
    });
  } catch (err) {
    return errorHandler(err, "Error in updateUserProfileController", res);
  }
}

export async function updateProfilePhotoController(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const userId = req.user?.id;
    const { photoUrl } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!photoUrl) {
      return res.status(400).json({
        success: false,
        message: "Photo URL is required",
      });
    }

    const user = await updateProfilePhotoService(userId, photoUrl);

    return res.status(200).json({
      success: true,
      message: "Profile photo updated successfully",
      data: { profilePhoto: user.profilePhoto },
    });
  } catch (err) {
    return errorHandler(err, "Error in updateProfilePhotoController", res);
  }
}

export async function removeProfilePhotoController(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await removeProfilePhotoService(userId);

    return res.status(200).json({
      success: true,
      message: "Profile photo removed successfully",
    });
  } catch (err) {
    return errorHandler(err, "Error in removeProfilePhotoController", res);
  }
}

export async function requestEmailChangeController(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const userId = req.user?.id;
    const { newEmail } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await requestEmailChangeService(userId, newEmail);

    return res.status(200).json({
      success: true,
      message: "OTP sent to new email address",
    });
  } catch (err) {
    return errorHandler(err, "Error in requestEmailChangeController", res);
  }
}

export async function verifyEmailChangeController(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const userId = req.user?.id;
    const { newEmail, otp } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await verifyEmailChangeService(userId, newEmail, otp);

    // Remove sensitive data
    const { password, otp: _, otpExpiry, emailChangeOtp, emailChangeOtpExpiry, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      message: "Email changed successfully",
      data: { user: safeUser },
    });
  } catch (err) {
    return errorHandler(err, "Error in verifyEmailChangeController", res);
  }
}

export async function changePasswordController(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await changePasswordService(userId, currentPassword, newPassword);

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    return errorHandler(err, "Error in changePasswordController", res);
  }
}

export async function getUserStatsController(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const stats = await getUserStatsService(userId);

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (err) {
    return errorHandler(err, "Error in getUserStatsController", res);
  }
}

// Billing Info Controllers
export async function getBillingInfoController(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const billingInfo = await getBillingInfoService(userId);

    return res.status(200).json({
      success: true,
      data: billingInfo,
    });
  } catch (err) {
    return errorHandler(err, "Error in getBillingInfoController", res);
  }
}

export async function createBillingInfoController(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const userId = req.user?.id;
    const data = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const billingInfo = await createBillingInfoService(userId, data);

    return res.status(201).json({
      success: true,
      message: "Billing information added successfully",
      data: billingInfo,
    });
  } catch (err) {
    return errorHandler(err, "Error in createBillingInfoController", res);
  }
}

export async function updateBillingInfoController(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const data = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const billingInfo = await updateBillingInfoService(id, userId, data);

    return res.status(200).json({
      success: true,
      message: "Billing information updated successfully",
      data: billingInfo,
    });
  } catch (err) {
    return errorHandler(err, "Error in updateBillingInfoController", res);
  }
}

export async function deleteBillingInfoController(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await deleteBillingInfoService(id, userId);

    return res.status(200).json({
      success: true,
      message: "Billing information deleted successfully",
    });
  } catch (err) {
    return errorHandler(err, "Error in deleteBillingInfoController", res);
  }
}

export async function setDefaultBillingInfoController(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const billingInfo = await setDefaultBillingInfoService(id, userId);

    return res.status(200).json({
      success: true,
      message: "Default billing information updated successfully",
      data: billingInfo,
    });
  } catch (err) {
    return errorHandler(err, "Error in setDefaultBillingInfoController", res);
  }
}