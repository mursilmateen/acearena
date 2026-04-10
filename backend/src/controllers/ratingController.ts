import { Response } from "express";
import { AuthenticatedRequest } from "../types/index";
import Rating from "../models/Rating";
import { asyncHandler, AppError } from "../middleware/errorHandler";

export const submitRating = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    const { gameId } = req.params;
    const { score } = req.body;

    if (!score || typeof score !== "number") {
      throw new AppError(400, "Rating score is required");
    }

    if (score < 1 || score > 5 || !Number.isInteger(score)) {
      throw new AppError(400, "Rating must be an integer between 1 and 5");
    }

    // Find existing rating or create new one
    let rating = await Rating.findOne({
      gameId,
      userId: req.user.id,
    });

    let isUpdate = false;

    if (rating) {
      // Update existing rating
      isUpdate = true;
      rating.score = score;
      await rating.save();
    } else {
      // Create new rating
      rating = new Rating({
        gameId,
        userId: req.user.id,
        score,
      });
      await rating.save();
    }

    res.status(201).json({
      success: true,
      data: rating,
      message: isUpdate ? "Rating updated successfully" : "Rating created successfully",
    });
  }
);

export const getRatingsByGameId = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { gameId } = req.params;

    const ratings = await Rating.find({ gameId })
      .populate("userId", "username avatar")
      .sort({ createdAt: -1 });

    if (ratings.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          ratings: [],
          averageRating: 0,
          totalRatings: 0,
          distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        },
      });
    }

    // Calculate statistics
    const totalScore = ratings.reduce((sum, r) => sum + r.score, 0);
    const averageRating = totalScore / ratings.length;
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>;
    
    ratings.forEach((r) => {
      distribution[r.score as keyof typeof distribution]++;
    });

    res.status(200).json({
      success: true,
      data: {
        ratings,
        averageRating: parseFloat(averageRating.toFixed(1)),
        totalRatings: ratings.length,
        distribution,
      },
    });
  }
);

export const getUserRatingForGame = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(200).json({
        success: true,
        data: null,
      });
    }

    const { gameId } = req.params;

    const rating = await Rating.findOne({
      gameId,
      userId: req.user.id,
    });

    res.status(200).json({
      success: true,
      data: rating,
    });
  }
);

export const deleteRating = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    const { gameId } = req.params;

    const rating = await Rating.findOne({
      gameId,
      userId: req.user.id,
    });

    if (!rating) {
      throw new AppError(404, "Rating not found");
    }

    await Rating.findByIdAndDelete(rating._id);

    res.status(200).json({
      success: true,
      message: "Rating deleted successfully",
    });
  }
);
