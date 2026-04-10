import express from "express";
import { authenticateToken, optionalAuth } from "../middleware/auth";
import {
  submitRating,
  getRatingsByGameId,
  getUserRatingForGame,
  deleteRating,
} from "../controllers/ratingController";

const router = express.Router({ mergeParams: true });

// POST /games/:gameId/ratings - Submit/update a rating
router.post("/", authenticateToken, submitRating);

// GET /games/:gameId/ratings - Get all ratings for a game
router.get("/", optionalAuth, getRatingsByGameId);

// GET /games/:gameId/ratings/me - Get user's rating for game
router.get("/me", optionalAuth, getUserRatingForGame);

// DELETE /games/:gameId/ratings - Delete user's rating
router.delete("/", authenticateToken, deleteRating);

export default router;
