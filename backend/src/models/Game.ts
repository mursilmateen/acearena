import mongoose, { Schema, Document } from "mongoose";
import { IGame } from "../types/index";

type GameDocument = IGame & Document;

const gameSchema = new Schema<GameDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    thumbnail: {
      type: String,
      default: null,
    },
    fileUrl: {
      type: String,
      default: null,
    },
    gameFormat: {
      type: String,
      enum: ["html5", "webgl", "zip", "exe", "dmg", "apk", "nes", "snes", "other"],
      default: "other",
    },
    isWebBased: {
      type: Boolean,
      default: false,
    },
    supportedEmulator: {
      type: String,
      enum: ["nesjs", "snes9x", "dosbox", "none"],
      default: "none",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    } as any,
  },
  { timestamps: true }
);

const Game = mongoose.model<GameDocument>("Game", gameSchema);

export default Game;
