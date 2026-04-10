import mongoose, { Schema, Document } from "mongoose";

interface IPost extends Document {
  title: string;
  content: string;
  category: "Game Development" | "Help" | "Feedback" | "Collaboration";
  userId: mongoose.Schema.Types.ObjectId;
  replies: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const postSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 150,
    },
    content: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 5000,
    },
    category: {
      type: String,
      enum: ["Game Development", "Help", "Feedback", "Collaboration"],
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    } as any,
    replies: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// Index for better query performance
postSchema.index({ category: 1, createdAt: -1 });

const Post = mongoose.model<IPost>("Post", postSchema);

export default Post;
export type { IPost };
