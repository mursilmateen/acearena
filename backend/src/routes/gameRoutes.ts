import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { authenticateToken, optionalAuth, requireDeveloper } from "../middleware/auth";
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
  getGameBuilds,
  activateGameBuild,
  downloadGame,
} from "../controllers/gameController";
import saveStateRoutes from "./saveStateRoutes";
import commentRoutes from "./commentRoutes";
import ratingRoutes from "./ratingRoutes";

const uploadsDir = path.resolve(process.cwd(), "uploads");

const ensureUploadsDir = () => {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureUploadsDir();
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

const router = express.Router();

router.post("/", apiLimiter, authenticateToken, requireDeveloper, createGame);
router.post("/:gameId/file", apiLimiter, authenticateToken, requireDeveloper, upload.single("file"), uploadGameFile);
router.get("/:gameId/builds", apiLimiter, authenticateToken, requireDeveloper, getGameBuilds);
router.post("/:gameId/builds/:buildId/activate", apiLimiter, authenticateToken, requireDeveloper, activateGameBuild);
router.post(
  "/:gameId/thumbnail",
  apiLimiter,
  authenticateToken,
  requireDeveloper,
  upload.single("thumbnail"),
  uploadGameThumbnail
);
router.use("/:gameId/save-state", apiLimiter, saveStateRoutes);
router.use("/:gameId/comments", apiLimiter, commentRoutes);
router.use("/:gameId/ratings", apiLimiter, ratingRoutes);
router.get("/my-games", apiLimiter, authenticateToken, requireDeveloper, getUserGames);
router.get("/", apiLimiter, optionalAuth, getAllGames);
router.get("/:id/download", apiLimiter, optionalAuth, downloadGame);
router.get("/:id", apiLimiter, optionalAuth, getGameById);
router.put("/:id", apiLimiter, authenticateToken, requireDeveloper, updateGame);
router.delete("/:id", apiLimiter, authenticateToken, requireDeveloper, deleteGame);

export default router;
