import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { authenticateToken, optionalAuth, requireDeveloper } from "../middleware/auth";
import { apiLimiter } from "../middleware/rateLimiter";
import {
  createAsset,
  uploadAssetFile,
  uploadAssetThumbnail,
  getAllAssets,
  getAssetById,
  getUserAssets,
  updateAsset,
  deleteAsset,
} from "../controllers/assetController";

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

router.post("/", apiLimiter, authenticateToken, requireDeveloper, createAsset);
router.post("/:assetId/file", apiLimiter, authenticateToken, requireDeveloper, upload.single("file"), uploadAssetFile);
router.post(
  "/:assetId/thumbnail",
  apiLimiter,
  authenticateToken,
  requireDeveloper,
  upload.single("thumbnail"),
  uploadAssetThumbnail
);
router.get("/my-assets", apiLimiter, authenticateToken, requireDeveloper, getUserAssets);
router.get("/", apiLimiter, optionalAuth, getAllAssets);
router.get("/:id", apiLimiter, optionalAuth, getAssetById);
router.put("/:id", apiLimiter, authenticateToken, requireDeveloper, updateAsset);
router.delete("/:id", apiLimiter, authenticateToken, requireDeveloper, deleteAsset);

export default router;
