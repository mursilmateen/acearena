import mongoose, { Schema, Document } from "mongoose";
import { IGameJam } from "../types/index";

type GameJamDocument = IGameJam & Document;

const gameJamSchema = new Schema<GameJamDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    theme: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    rules: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    } as any,
    participants: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    } as any,
  },
  { timestamps: true }
);

const GameJam = mongoose.model<GameJamDocument>("GameJam", gameJamSchema);

export default GameJam;
