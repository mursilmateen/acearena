import express from "express";
import { authenticateToken, optionalAuth } from "../middleware/auth";
import {
  createComment,
  getCommentsByGameId,
  deleteComment,
} from "../controllers/commentController";

const router = express.Router({ mergeParams: true });

// POST /games/:gameId/comments - Create a comment
router.post("/", authenticateToken, createComment);

// GET /games/:gameId/comments - Get all comments for a game
router.get("/", optionalAuth, getCommentsByGameId);

// DELETE /games/:gameId/comments/:commentId - Delete a comment
router.delete("/:commentId", authenticateToken, deleteComment);

export default router;
