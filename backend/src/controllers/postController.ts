import { Response } from "express";
import { AuthenticatedRequest } from "../types/index";
import Post from "../models/Post";
import { asyncHandler, AppError } from "../middleware/errorHandler";

export const createPost = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    const { title, content, category } = req.body;

    if (!title || title.trim().length < 5) {
      throw new AppError(400, "Title must be at least 5 characters");
    }

    if (!content || content.trim().length < 10) {
      throw new AppError(400, "Content must be at least 10 characters");
    }

    if (!category || !["Game Development", "Help", "Feedback", "Collaboration"].includes(category)) {
      throw new AppError(400, "Invalid category");
    }

    const post = new Post({
      title: title.trim(),
      content: content.trim(),
      category,
      userId: req.user.id,
      replies: 0,
    });

    await post.save();
    await post.populate("userId", "username avatar");

    res.status(201).json({
      success: true,
      data: post,
      message: "Post created successfully",
    });
  }
);

export const getAllPosts = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { category, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string) || 20));
    const skip = (pageNum - 1) * limitNum;

    let filter: any = {};
    if (category && category !== "All") {
      filter.category = category;
    }

    const posts = await Post.find(filter)
      .populate("userId", "username avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Post.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  }
);

export const getPostById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { postId } = req.params;

    const post = await Post.findById(postId).populate("userId", "username avatar bio");

    if (!post) {
      throw new AppError(404, "Post not found");
    }

    res.status(200).json({
      success: true,
      data: post,
    });
  }
);

export const updatePost = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    const { postId } = req.params;
    const { title, content, category } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      throw new AppError(404, "Post not found");
    }

    // Check ownership
    if (post.userId.toString() !== req.user.id) {
      throw new AppError(403, "Not authorized to update this post");
    }

    if (title) {
      if (title.length < 5) {
        throw new AppError(400, "Title must be at least 5 characters");
      }
      post.title = title.trim();
    }

    if (content) {
      if (content.length < 10) {
        throw new AppError(400, "Content must be at least 10 characters");
      }
      post.content = content.trim();
    }

    if (category) {
      if (!["Game Development", "Help", "Feedback", "Collaboration"].includes(category)) {
        throw new AppError(400, "Invalid category");
      }
      post.category = category;
    }

    await post.save();
    await post.populate("userId", "username avatar");

    res.status(200).json({
      success: true,
      data: post,
      message: "Post updated successfully",
    });
  }
);

export const deletePost = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      throw new AppError(404, "Post not found");
    }

    // Check ownership
    if (post.userId.toString() !== req.user.id) {
      throw new AppError(403, "Not authorized to delete this post");
    }

    await Post.findByIdAndDelete(postId);

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  }
);

export const getPostsByCategory = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!["Game Development", "Help", "Feedback", "Collaboration"].includes(category)) {
      throw new AppError(400, "Invalid category");
    }

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string) || 20));
    const skip = (pageNum - 1) * limitNum;

    const posts = await Post.find({ category })
      .populate("userId", "username avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Post.countDocuments({ category });

    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  }
);

export const getTrendingTopics = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const topics = await Post.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    const formattedTopics = topics.map((topic) => ({
      title: topic._id,
      posts: topic.count,
    }));

    res.status(200).json({
      success: true,
      data: formattedTopics,
    });
  }
);

export const getTopDevelopers = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const developers = await Post.aggregate([
      {
        $group: {
          _id: "$userId",
          postsCount: { $sum: 1 },
        },
      },
      {
        $sort: { postsCount: -1 },
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $project: {
          username: "$userDetails.username",
          avatar: "$userDetails.avatar",
          postsCount: 1,
          specialty: "$userDetails.bio",
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: developers,
    });
  }
);
