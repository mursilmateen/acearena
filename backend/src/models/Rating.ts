import mongoose, { Schema, Document } from "mongoose";

interface IRating extends Document {
  gameId: string;
  userId: string;
  score: number; // 1-5
  createdAt?: Date;
  updatedAt?: Date;
}

const ratingSchema = new Schema<IRating>(
  {
    gameId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    } as any,
    score: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

// Ensure only one rating per user per game
ratingSchema.index({ gameId: 1, userId: 1 }, { unique: true });

const Rating = mongoose.model<IRating>("Rating", ratingSchema);

export default Rating;
export type { IRating };
