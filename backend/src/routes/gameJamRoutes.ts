import express from "express";
import { authenticateToken, optionalAuth } from "../middleware/auth";
import { apiLimiter } from "../middleware/rateLimiter";
import {
  createGameJam,
  getAllGameJams,
  getGameJamById,
  joinGameJam,
  leaveGameJam,
  updateGameJam,
  deleteGameJam,
} from "../controllers/gameJamController";

const router = express.Router();

router.post("/", apiLimiter, authenticateToken, createGameJam);
router.get("/", apiLimiter, optionalAuth, getAllGameJams);
router.get("/:id", apiLimiter, optionalAuth, getGameJamById);
router.post("/:id/join", apiLimiter, authenticateToken, joinGameJam);
router.post("/:id/leave", apiLimiter, authenticateToken, leaveGameJam);
router.put("/:id", apiLimiter, authenticateToken, updateGameJam);
router.delete("/:id", apiLimiter, authenticateToken, deleteGameJam);

export default router;
