import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { authenticateToken } from "../middleware/auth";
import { apiLimiter } from "../middleware/rateLimiter";
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  upgradeToDeveloper,
} from "../controllers/profileController";

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

router.get("/", apiLimiter, authenticateToken, getProfile);
router.put("/", apiLimiter, authenticateToken, updateProfile);
router.post("/avatar", apiLimiter, authenticateToken, upload.single("avatar"), uploadAvatar);
router.post("/upgrade-developer", apiLimiter, authenticateToken, upgradeToDeveloper);

export default router;
