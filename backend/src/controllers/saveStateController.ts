import { Response } from "express";
import { AuthenticatedRequest } from "../types/index";
import Game from "../models/Game";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import fs from "fs";
import path from "path";

/**
 * Save game state to backend
 * Stores emulator save states in a dedicated location
 */
export const saveSaveState = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    const { gameId } = req.params;
    const { slot, data, description } = req.body;

    // Validate input
    if (!slot || !data || typeof slot !== "number" || slot < 1 || slot > 5) {
      throw new AppError(400, "Invalid save slot. Must be between 1-5");
    }

    // Check if game exists and belongs to user or is public
    const game = await Game.findById(gameId);
    if (!game) {
      throw new AppError(404, "Game not found");
    }

    try {
      // Create saves directory if it doesn't exist
      const savesDir = path.join(process.cwd(), "saves", gameId);
      if (!fs.existsSync(savesDir)) {
        fs.mkdirSync(savesDir, { recursive: true });
      }

      // Save state to file
      const saveFilePath = path.join(savesDir, `save_${slot}_${req.user.id}.json`);
      const saveData = {
        gameId,
        userId: req.user.id,
        slot,
        data,
        description: description || `Save ${slot}`,
        createdAt: new Date(),
      };

      fs.writeFileSync(saveFilePath, JSON.stringify(saveData, null, 2));

      res.status(200).json({
        success: true,
        data: saveData,
        message: "Save state saved successfully",
      });
    } catch (error) {
      throw new AppError(500, `Failed to save state: ${error}`);
    }
  }
);

/**
 * Load game state from backend
 */
export const loadSaveState = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    const { gameId } = req.params;
    const { slot } = req.query;

    if (!slot || typeof slot !== "string") {
      throw new AppError(400, "Save slot is required");
    }

    const slotNum = parseInt(slot);
    if (isNaN(slotNum) || slotNum < 1 || slotNum > 5) {
      throw new AppError(400, "Invalid save slot. Must be between 1-5");
    }

    try {
      const saveFilePath = path.join(
        process.cwd(),
        "saves",
        gameId,
        `save_${slotNum}_${req.user.id}.json`
      );

      if (!fs.existsSync(saveFilePath)) {
        throw new AppError(404, "Save state not found");
      }

      const saveData = JSON.parse(fs.readFileSync(saveFilePath, "utf-8"));

      res.status(200).json({
        success: true,
        data: saveData,
        message: "Save state loaded successfully",
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, `Failed to load state: ${error}`);
    }
  }
);

/**
 * List all save states for a game
 */
export const listSaveStates = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    const { gameId } = req.params;

    try {
      const savesDir = path.join(process.cwd(), "saves", gameId);

      if (!fs.existsSync(savesDir)) {
        return res.status(200).json({
          success: true,
          data: [],
          message: "No save states found",
        });
      }

      const files = fs.readdirSync(savesDir);
      const userSaves = files
        .filter((file) => file.includes(req.user!.id))
        .map((file) => {
          const data = JSON.parse(
            fs.readFileSync(path.join(savesDir, file), "utf-8")
          );
          return data;
        })
        .sort((a, b) => a.slot - b.slot);

      res.status(200).json({
        success: true,
        data: userSaves,
        message: `Found ${userSaves.length} save states`,
      });
    } catch (error) {
      throw new AppError(500, `Failed to list save states: ${error}`);
    }
  }
);

/**
 * Delete a save state
 */
export const deleteSaveState = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    const { gameId } = req.params;
    const { slot } = req.query;

    if (!slot || typeof slot !== "string") {
      throw new AppError(400, "Save slot is required");
    }

    const slotNum = parseInt(slot);
    if (isNaN(slotNum) || slotNum < 1 || slotNum > 5) {
      throw new AppError(400, "Invalid save slot. Must be between 1-5");
    }

    try {
      const saveFilePath = path.join(
        process.cwd(),
        "saves",
        gameId,
        `save_${slotNum}_${req.user.id}.json`
      );

      if (!fs.existsSync(saveFilePath)) {
        throw new AppError(404, "Save state not found");
      }

      fs.unlinkSync(saveFilePath);

      res.status(200).json({
        success: true,
        message: "Save state deleted successfully",
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, `Failed to delete state: ${error}`);
    }
  }
);
