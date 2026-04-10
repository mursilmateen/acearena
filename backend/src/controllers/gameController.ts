import { Response } from "express";
import { AuthenticatedRequest } from "../types/index";
import Game from "../models/Game";
import { createGameSchema } from "../utils/validators";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { UploadService } from "../services/uploadService";
import fs from "fs";

export const createGame = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    // Validate input
    const validatedData = createGameSchema.parse(req.body);

    // Create game
    const game = new Game({
      ...validatedData,
      createdBy: req.user.id,
    });

    await game.save();

    res.status(201).json({
      success: true,
      data: game,
      message: "Game created successfully",
    });
  }
);

export const uploadGameFile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    const { gameId } = req.params;

    if (!req.file) {
      throw new AppError(400, "No file provided");
    }

    // Check if game exists and belongs to user
    const game = await Game.findById(gameId);

    if (!game) {
      throw new AppError(404, "Game not found");
    }

    if (game.createdBy.toString() !== req.user.id) {
      throw new AppError(403, "You don't have permission to upload files for this game");
    }

    // Upload to Cloudinary
    const upload = await UploadService.uploadFile(req.file.path, "games");

    // Delete temp file
    fs.unlinkSync(req.file.path);

    // Update game
    game.fileUrl = upload.url;
    await game.save();

    res.status(200).json({
      success: true,
      data: game,
      message: "Game file uploaded successfully",
    });
  }
);

export const uploadGameThumbnail = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    const { gameId } = req.params;

    if (!req.file) {
      throw new AppError(400, "No file provided");
    }

    // Check if game exists and belongs to user
    const game = await Game.findById(gameId);

    if (!game) {
      throw new AppError(404, "Game not found");
    }

    if (game.createdBy.toString() !== req.user.id) {
      throw new AppError(403, "You don't have permission to upload files for this game");
    }

    // Upload to Cloudinary
    const upload = await UploadService.uploadImage(req.file.path, "games/thumbnails");

    // Delete temp file
    fs.unlinkSync(req.file.path);

    // Update game
    game.thumbnail = upload.url;
    await game.save();

    res.status(200).json({
      success: true,
      data: game,
      message: "Thumbnail uploaded successfully",
    });
  }
);

export const getAllGames = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { tags, minPrice, maxPrice, search } = req.query;

    let filter: any = {};

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

    const games = await Game.find(filter).populate("createdBy", "username avatar").exec();

    res.status(200).json({
      success: true,
      data: games,
    });
  }
);

export const getGameById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const game = await Game.findById(id).populate("createdBy", "username avatar bio").exec();

    if (!game) {
      throw new AppError(404, "Game not found");
    }

    res.status(200).json({
      success: true,
      data: game,
    });
  }
);

export const updateGame = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    const { id } = req.params;

    // Check if game exists and belongs to user
    const game = await Game.findById(id);

    if (!game) {
      throw new AppError(404, "Game not found");
    }

    if (game.createdBy.toString() !== req.user.id) {
      throw new AppError(403, "You don't have permission to update this game");
    }

    const validatedData = createGameSchema.parse(req.body);

    // Update game
    const updatedGame = await Game.findByIdAndUpdate(id, validatedData, { new: true });

    res.status(200).json({
      success: true,
      data: updatedGame,
      message: "Game updated successfully",
    });
  }
);

export const getUserGames = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    const games = await Game.find({ createdBy: req.user.id }).populate("createdBy", "username avatar").exec();

    res.status(200).json({
      success: true,
      data: games,
    });
  }
);

export const deleteGame = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    const { id } = req.params;

    // Check if game exists and belongs to user
    const game = await Game.findById(id);

    if (!game) {
      throw new AppError(404, "Game not found");
    }

    if (game.createdBy.toString() !== req.user.id) {
      throw new AppError(403, "You don't have permission to delete this game");
    }

    await Game.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Game deleted successfully",
    });
  }
);
