import { Response } from "express";
import { AuthenticatedRequest } from "../types/index";
import User from "../models/User";
import Game from "../models/Game";
import Asset from "../models/Asset";
import GameJam from "../models/GameJam";
import { updateProfileSchema } from "../utils/validators";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { UploadService } from "../services/uploadService";
import { generateToken } from "../utils/jwt";
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

    const [gamesUploaded, assetsUploaded, jamsJoined] = await Promise.all([
      Game.countDocuments({ createdBy: user._id }),
      Asset.countDocuments({ createdBy: user._id }),
      GameJam.countDocuments({ participants: user._id }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        gamesUploaded,
        assetsUploaded,
        jamsJoined,
      },
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

export const upgradeToDeveloper = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      throw new AppError(404, "User not found");
    }

    if (user.role !== "developer") {
      user.role = "developer";
      await user.save();
    }

    const token = generateToken({
      id: user._id!.toString(),
      email: user.email,
      role: user.role,
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          bio: user.bio || "",
          avatar: user.avatar || null,
          createdAt: user.createdAt,
        },
        token,
      },
      message: "Account upgraded to developer",
    });
  }
);
