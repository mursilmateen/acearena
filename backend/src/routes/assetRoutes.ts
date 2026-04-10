import express from "express";
import multer from "multer";
import { authenticateToken, optionalAuth } from "../middleware/auth";
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

router.post("/", apiLimiter, authenticateToken, createAsset);
router.post("/:assetId/file", apiLimiter, authenticateToken, upload.single("file"), uploadAssetFile);
router.post(
  "/:assetId/thumbnail",
  apiLimiter,
  authenticateToken,
  upload.single("thumbnail"),
  uploadAssetThumbnail
);
router.get("/my-assets", apiLimiter, authenticateToken, getUserAssets);
router.get("/", apiLimiter, optionalAuth, getAllAssets);
router.get("/:id", apiLimiter, optionalAuth, getAssetById);
router.put("/:id", apiLimiter, authenticateToken, updateAsset);
router.delete("/:id", apiLimiter, authenticateToken, deleteAsset);

export default router;
