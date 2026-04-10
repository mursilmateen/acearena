import { Response } from "express";
import { AuthenticatedRequest } from "../types/index";
import GameJam from "../models/GameJam";
import { createGameJamSchema } from "../utils/validators";
import { asyncHandler, AppError } from "../middleware/errorHandler";

export const createGameJam = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    // Validate input
    const validatedData = createGameJamSchema.parse(req.body);

    // Create game jam
    const gameJam = new GameJam({
      ...validatedData,
      createdBy: req.user.id,
      participants: [req.user.id],
    });

    await gameJam.save();

    res.status(201).json({
      success: true,
      data: gameJam,
      message: "Game jam created successfully",
    });
  }
);

export const getAllGameJams = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { search, ongoing } = req.query;

    let filter: any = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { theme: { $regex: search, $options: "i" } },
      ];
    }

    if (ongoing === "true") {
      filter.deadline = { $gt: new Date() };
    }

    const gameJams = await GameJam.find(filter)
      .populate("createdBy", "username avatar")
      .populate("participants", "username avatar")
      .exec();

    res.status(200).json({
      success: true,
      data: gameJams,
    });
  }
);

export const getGameJamById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const gameJam = await GameJam.findById(id)
      .populate("createdBy", "username avatar bio")
      .populate("participants", "username avatar")
      .exec();

    if (!gameJam) {
      throw new AppError(404, "Game jam not found");
    }

    res.status(200).json({
      success: true,
      data: gameJam,
    });
  }
);

export const joinGameJam = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    const { id } = req.params;

    // Find game jam
    const gameJam = await GameJam.findById(id);

    if (!gameJam) {
      throw new AppError(404, "Game jam not found");
    }

    // Check if user is already a participant
    if (gameJam.participants.includes(req.user.id as any)) {
      throw new AppError(400, "You are already a participant");
    }

    // Add user to participants
    gameJam.participants.push(req.user.id as any);
    await gameJam.save();

    res.status(200).json({
      success: true,
      data: gameJam,
      message: "Joined game jam successfully",
    });
  }
);

export const leaveGameJam = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    const { id } = req.params;

    // Find game jam
    const gameJam = await GameJam.findById(id);

    if (!gameJam) {
      throw new AppError(404, "Game jam not found");
    }

    // Check if user is a participant
    if (!gameJam.participants.includes(req.user!.id as any)) {
      throw new AppError(400, "You are not a participant in this jam");
    }

    // Remove user from participants
    gameJam.participants = gameJam.participants.filter(
      (id) => id.toString() !== req.user!.id
    );
    await gameJam.save();

    res.status(200).json({
      success: true,
      data: gameJam,
      message: "Left game jam successfully",
    });
  }
);

export const updateGameJam = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    const { id } = req.params;

    // Find game jam
    const gameJam = await GameJam.findById(id);

    if (!gameJam) {
      throw new AppError(404, "Game jam not found");
    }

    // Check if user is the creator
    if (gameJam.createdBy.toString() !== req.user.id) {
      throw new AppError(403, "You don't have permission to update this jam");
    }

    const validatedData = createGameJamSchema.parse(req.body);

    // Update game jam
    const updatedGameJam = await GameJam.findByIdAndUpdate(id, validatedData, { new: true });

    res.status(200).json({
      success: true,
      data: updatedGameJam,
      message: "Game jam updated successfully",
    });
  }
);

export const deleteGameJam = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    const { id } = req.params;

    // Find game jam
    const gameJam = await GameJam.findById(id);

    if (!gameJam) {
      throw new AppError(404, "Game jam not found");
    }

    // Check if user is the creator
    if (gameJam.createdBy.toString() !== req.user.id) {
      throw new AppError(403, "You don't have permission to delete this jam");
    }

    await GameJam.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Game jam deleted successfully",
    });
  }
);
