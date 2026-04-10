import express from "express";
import multer from "multer";
import { authenticateToken } from "../middleware/auth";
import { apiLimiter } from "../middleware/rateLimiter";
import {
  getProfile,
  updateProfile,
  uploadAvatar,
} from "../controllers/profileController";

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

router.get("/", apiLimiter, authenticateToken, getProfile);
router.put("/", apiLimiter, authenticateToken, updateProfile);
router.post("/avatar", apiLimiter, authenticateToken, upload.single("avatar"), uploadAvatar);

export default router;
