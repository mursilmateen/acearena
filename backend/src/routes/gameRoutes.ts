import express from "express";
import multer from "multer";
import { authenticateToken, optionalAuth } from "../middleware/auth";
import { apiLimiter } from "../middleware/rateLimiter";
import {
  createGame,
  uploadGameFile,
  uploadGameThumbnail,
  getAllGames,
  getGameById,
  getUserGames,
  updateGame,
  deleteGame,
} from "../controllers/gameController";
import saveStateRoutes from "./saveStateRoutes";
import commentRoutes from "./commentRoutes";
import ratingRoutes from "./ratingRoutes";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

const router = express.Router();

router.post("/", apiLimiter, authenticateToken, createGame);
router.post("/:gameId/file", apiLimiter, authenticateToken, upload.single("file"), uploadGameFile);
router.post(
  "/:gameId/thumbnail",
  apiLimiter,
  authenticateToken,
  upload.single("thumbnail"),
  uploadGameThumbnail
);
router.use("/:gameId/save-state", apiLimiter, saveStateRoutes);
router.use("/:gameId/comments", apiLimiter, commentRoutes);
router.use("/:gameId/ratings", apiLimiter, ratingRoutes);
router.get("/my-games", apiLimiter, authenticateToken, getUserGames);
router.get("/", apiLimiter, optionalAuth, getAllGames);
router.get("/:id", apiLimiter, optionalAuth, getGameById);
router.put("/:id", apiLimiter, authenticateToken, updateGame);
router.delete("/:id", apiLimiter, authenticateToken, deleteGame);

export default router;
