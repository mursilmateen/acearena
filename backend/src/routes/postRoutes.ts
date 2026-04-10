import express from "express";
import { authenticateToken, optionalAuth } from "../middleware/auth";
import {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostsByCategory,
  getTrendingTopics,
  getTopDevelopers,
} from "../controllers/postController";

const router = express.Router();

// POST operations
router.post("/", authenticateToken, createPost);

// GET operations
router.get("/trending/topics", optionalAuth, getTrendingTopics);
router.get("/trending/developers", optionalAuth, getTopDevelopers);
router.get("/category/:category", optionalAuth, getPostsByCategory);
router.get("/", optionalAuth, getAllPosts);
router.get("/:postId", optionalAuth, getPostById);

// PUT operations
router.put("/:postId", authenticateToken, updatePost);

// DELETE operations
router.delete("/:postId", authenticateToken, deletePost);

export default router;
