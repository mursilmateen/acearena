import express from "express";
import { register, login, logout } from "../controllers/authController";
import { authLimiter } from "../middleware/rateLimiter";

const router = express.Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", logout);

export default router;
