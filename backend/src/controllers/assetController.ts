import { Response } from "express";
import { AuthenticatedRequest } from "../types/index";
import Asset from "../models/Asset";
import { createAssetSchema } from "../utils/validators";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { UploadService } from "../services/uploadService";
import fs from "fs";

export const createAsset = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    // Validate input
    const validatedData = createAssetSchema.parse(req.body);

    // Create asset
    const asset = new Asset({
      ...validatedData,
      createdBy: req.user.id,
    });

    await asset.save();

    res.status(201).json({
      success: true,
      data: asset,
      message: "Asset created successfully",
    });
  }
);

export const uploadAssetFile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    const { assetId } = req.params;

    if (!req.file) {
      throw new AppError(400, "No file provided");
    }

    // Validate file size (100MB default)
    if (!UploadService.validateFileSize(req.file.size)) {
      fs.unlinkSync(req.file.path);
      throw new AppError(
        413,
        `File too large. Maximum size: ${UploadService.formatFileSize(100 * 1024 * 1024)}`
      );
    }

    // Check if asset exists and belongs to user
    const asset = await Asset.findById(assetId);

    if (!asset) {
      fs.unlinkSync(req.file.path);
      throw new AppError(404, "Asset not found");
    }

    if (asset.createdBy.toString() !== req.user.id) {
      fs.unlinkSync(req.file.path);
      throw new AppError(403, "You don't have permission to upload files for this asset");
    }

    try {
      // Upload to Cloudinary
      const upload = await UploadService.uploadFile(req.file.path, "assets");

      // Delete temp file
      fs.unlinkSync(req.file.path);

      // Update asset
      asset.fileUrl = upload.url;
      await asset.save();

      res.status(200).json({
        success: true,
        data: asset,
        message: "Asset file uploaded successfully",
      });
    } catch (error) {
      // Clean up temp file on error
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      throw error;
    }
  }
);

export const uploadAssetThumbnail = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    const { assetId } = req.params;

    if (!req.file) {
      throw new AppError(400, "No file provided");
    }

    // Validate file size (smaller limit for thumbnails)
    if (!UploadService.validateFileSize(req.file.size)) {
      fs.unlinkSync(req.file.path);
      throw new AppError(
        413,
        `File too large. Maximum size: ${UploadService.formatFileSize(10 * 1024 * 1024)}`
      );
    }

    // Check if asset exists and belongs to user
    const asset = await Asset.findById(assetId);

    if (!asset) {
      fs.unlinkSync(req.file.path);
      throw new AppError(404, "Asset not found");
    }

    if (asset.createdBy.toString() !== req.user.id) {
      fs.unlinkSync(req.file.path);
      throw new AppError(403, "You don't have permission to upload files for this asset");
    }

    try {
      // Upload to Cloudinary
      const upload = await UploadService.uploadImage(req.file.path, "assets/thumbnails");

      // Delete temp file
      fs.unlinkSync(req.file.path);

      // Update asset
      asset.thumbnailUrl = upload.url;
      await asset.save();

      res.status(200).json({
        success: true,
        data: asset,
        message: "Asset thumbnail uploaded successfully",
      });
    } catch (error) {
      // Clean up temp file on error
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      throw error;
    }
  }
);

export const getAllAssets = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const assets = await Asset.find().populate("createdBy", "username avatar");
  res.status(200).json({
    success: true,
    data: assets,
  });
});

export const getAssetById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const asset = await Asset.findById(req.params.id).populate("createdBy", "username avatar");

  if (!asset) {
    throw new AppError(404, "Asset not found");
  }

  res.status(200).json({
    success: true,
    data: asset,
  });
});

export const getUserAssets = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    const assets = await Asset.find({ createdBy: req.user.id });

    res.status(200).json({
      success: true,
      data: assets,
    });
  }
);

export const updateAsset = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new AppError(401, "Not authenticated");
  }

  const asset = await Asset.findById(req.params.id);

  if (!asset) {
    throw new AppError(404, "Asset not found");
  }

  if (asset.createdBy.toString() !== req.user.id) {
    throw new AppError(403, "You don't have permission to update this asset");
  }

  Object.assign(asset, req.body);
  await asset.save();

  res.status(200).json({
    success: true,
    data: asset,
    message: "Asset updated successfully",
  });
});

export const deleteAsset = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new AppError(401, "Not authenticated");
  }

  const asset = await Asset.findById(req.params.id);

  if (!asset) {
    throw new AppError(404, "Asset not found");
  }

  if (asset.createdBy.toString() !== req.user.id) {
    throw new AppError(403, "You don't have permission to delete this asset");
  }

  // Delete from Cloudinary if URLs exist
  if (asset.fileUrl) {
    try {
      await UploadService.deleteFile(asset.fileUrl.split("/").pop()?.split(".")[0] || "");
    } catch (error) {
      console.error("Error deleting file from Cloudinary:", error);
    }
  }

  await Asset.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Asset deleted successfully",
  });
});

export const getAllAssets = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { type, tags, minPrice, maxPrice, search } = req.query;

    let filter: any = {};

    if (type) {
      filter.type = type;
    }

    if (tags) {
      filter.tags = { $in: (tags as string).split(",") };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const assets = await Asset.find(filter).populate("createdBy", "username avatar").exec();

    res.status(200).json({
      success: true,
      data: assets,
    });
  }
);

export const getAssetById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const asset = await Asset.findById(id).populate("createdBy", "username avatar bio").exec();

    if (!asset) {
      throw new AppError(404, "Asset not found");
    }

    res.status(200).json({
      success: true,
      data: asset,
    });
  }
);

export const updateAsset = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    const { id } = req.params;

    // Check if asset exists and belongs to user
    const asset = await Asset.findById(id);

    if (!asset) {
      throw new AppError(404, "Asset not found");
    }

    if (asset.createdBy.toString() !== req.user.id) {
      throw new AppError(403, "You don't have permission to update this asset");
    }

    const validatedData = createAssetSchema.parse(req.body);

    // Update asset
    const updatedAsset = await Asset.findByIdAndUpdate(id, validatedData, { new: true });

    res.status(200).json({
      success: true,
      data: updatedAsset,
      message: "Asset updated successfully",
    });
  }
);

export const getUserAssets = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    const assets = await Asset.find({ createdBy: req.user.id }).populate("createdBy", "username avatar").exec();

    res.status(200).json({
      success: true,
      data: assets,
    });
  }
);

export const deleteAsset = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    const { id } = req.params;

    // Check if asset exists and belongs to user
    const asset = await Asset.findById(id);

    if (!asset) {
      throw new AppError(404, "Asset not found");
    }

    if (asset.createdBy.toString() !== req.user.id) {
      throw new AppError(403, "You don't have permission to delete this asset");
    }

    await Asset.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Asset deleted successfully",
    });
  }
);
