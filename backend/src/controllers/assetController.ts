import { Response } from "express";
import { AuthenticatedRequest } from "../types/index";
import Asset from "../models/Asset";
import { createAssetSchema } from "../utils/validators";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { UploadService } from "../services/uploadService";
import fs from "fs";

const cleanupTempFile = (filePath?: string) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const isZipArchive = (file: Express.Multer.File): boolean => {
  const lowerFileName = file.originalname.toLowerCase();
  return (
    lowerFileName.endsWith(".zip") ||
    file.mimetype === "application/zip" ||
    file.mimetype === "application/x-zip-compressed"
  );
};

const parseQueryNumber = (value: unknown): number | undefined => {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

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

    if (!isZipArchive(req.file)) {
      cleanupTempFile(req.file.path);
      throw new AppError(400, "Asset package must be a .zip archive");
    }

    if (!UploadService.validateFileSize(req.file.size)) {
      cleanupTempFile(req.file.path);
      throw new AppError(
        413,
        `File too large. Maximum size: ${UploadService.formatFileSize(100 * 1024 * 1024)}`
      );
    }

    // Check if asset exists and belongs to user
    const asset = await Asset.findById(assetId);

    if (!asset) {
      cleanupTempFile(req.file.path);
      throw new AppError(404, "Asset not found");
    }

    if (asset.createdBy.toString() !== req.user.id) {
      cleanupTempFile(req.file.path);
      throw new AppError(403, "You don't have permission to upload files for this asset");
    }

    try {
      const upload = await UploadService.uploadFile(req.file.path, "assets");

      cleanupTempFile(req.file.path);

      asset.fileUrl = upload.url;
      await asset.save();

      res.status(200).json({
        success: true,
        data: asset,
        message: "Asset file uploaded successfully",
      });
    } catch (error) {
      cleanupTempFile(req.file.path);
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

    if (req.file.size > 10 * 1024 * 1024) {
      cleanupTempFile(req.file.path);
      throw new AppError(
        413,
        `File too large. Maximum size: ${UploadService.formatFileSize(10 * 1024 * 1024)}`
      );
    }

    // Check if asset exists and belongs to user
    const asset = await Asset.findById(assetId);

    if (!asset) {
      cleanupTempFile(req.file.path);
      throw new AppError(404, "Asset not found");
    }

    if (asset.createdBy.toString() !== req.user.id) {
      cleanupTempFile(req.file.path);
      throw new AppError(403, "You don't have permission to upload files for this asset");
    }

    try {
      const upload = await UploadService.uploadImage(req.file.path, "assets/thumbnails");

      cleanupTempFile(req.file.path);

      asset.thumbnail = upload.url;
      await asset.save();

      res.status(200).json({
        success: true,
        data: asset,
        message: "Asset thumbnail uploaded successfully",
      });
    } catch (error) {
      cleanupTempFile(req.file.path);
      throw error;
    }
  }
);

export const getAllAssets = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { type, tags, minPrice, maxPrice, search } = req.query;

    const filter: Record<string, any> = {};

    if (typeof type === "string" && type.trim()) {
      filter.type = type;
    }

    if (typeof tags === "string" && tags.trim()) {
      filter.tags = { $in: tags.split(",").map((tag) => tag.trim()).filter(Boolean) };
    }

    const min = parseQueryNumber(minPrice);
    const max = parseQueryNumber(maxPrice);

    if (min !== undefined || max !== undefined) {
      filter.price = {};
      if (min !== undefined) filter.price.$gte = min;
      if (max !== undefined) filter.price.$lte = max;
    }

    if (typeof search === "string" && search.trim()) {
      const query = search.trim();
      filter.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
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
    const asset = await Asset.findById(req.params.id)
      .populate("createdBy", "username avatar bio")
      .exec();

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

    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      throw new AppError(404, "Asset not found");
    }

    if (asset.createdBy.toString() !== req.user.id) {
      throw new AppError(403, "You don't have permission to update this asset");
    }

    const validatedUpdates = createAssetSchema.partial().parse(req.body);

    Object.assign(asset, validatedUpdates);
    await asset.save();

    res.status(200).json({
      success: true,
      data: asset,
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

    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      throw new AppError(404, "Asset not found");
    }

    if (asset.createdBy.toString() !== req.user.id) {
      throw new AppError(403, "You don't have permission to delete this asset");
    }

    if (asset.fileUrl) {
      try {
        const publicId = asset.fileUrl.split("/").pop()?.split(".")[0] || "";
        await UploadService.deleteFile(publicId);
      } catch (error) {
        console.error("Error deleting file from Cloudinary:", error);
      }
    }

    await Asset.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Asset deleted successfully",
    });
  }
);
