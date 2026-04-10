import { Response } from "express";
import { AuthenticatedRequest } from "../types/index";
import Comment from "../models/Comment";
import { asyncHandler, AppError } from "../middleware/errorHandler";

export const createComment = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    const { gameId } = req.params;
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      throw new AppError(400, "Comment text is required");
    }

    if (text.length > 1000) {
      throw new AppError(400, "Comment must be less than 1000 characters");
    }

    const comment = new Comment({
      gameId,
      userId: req.user.id,
      text: text.trim(),
    });

    await comment.save();
    await comment.populate("userId", "username avatar");

    res.status(201).json({
      success: true,
      data: comment,
      message: "Comment created successfully",
    });
  }
);

export const getCommentsByGameId = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { gameId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string) || 20));
    const skip = (pageNum - 1) * limitNum;

    const comments = await Comment.find({ gameId })
      .populate("userId", "username avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Comment.countDocuments({ gameId });

    res.status(200).json({
      success: true,
      data: comments,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  }
);

export const deleteComment = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new AppError(404, "Comment not found");
    }

    // Check ownership
    if (comment.userId.toString() !== req.user.id) {
      throw new AppError(403, "Not authorized to delete this comment");
    }

    await Comment.findByIdAndDelete(commentId);

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  }
);
