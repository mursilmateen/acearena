import { Response } from "express";
import { AuthenticatedRequest } from "../types/index";
import User from "../models/User";
import { updateProfileSchema } from "../utils/validators";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { UploadService } from "../services/uploadService";
import fs from "fs";

export const getProfile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      throw new AppError(404, "User not found");
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  }
);

export const updateProfile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    // Validate input
    const validatedData = updateProfileSchema.parse(req.body);

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      validatedData,
      { new: true }
    ).select("-password");

    if (!user) {
      throw new AppError(404, "User not found");
    }

    res.status(200).json({
      success: true,
      data: user,
      message: "Profile updated successfully",
    });
  }
);

export const uploadAvatar = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    if (!req.file) {
      throw new AppError(400, "No file provided");
    }

    // Upload to Cloudinary
    const upload = await UploadService.uploadImage(req.file.path, "avatars");

    // Delete temp file
    fs.unlinkSync(req.file.path);

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: upload.url },
      { new: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      data: user,
      message: "Avatar uploaded successfully",
    });
  }
);
