import mongoose, { Schema, Document } from "mongoose";
import { IGameBuild } from "../types/index";

type GameBuildDocument = IGameBuild & Document;

const gameBuildSchema = new Schema<GameBuildDocument>(
  {
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
      required: true,
      index: true,
    } as any,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    } as any,
    originalFileName: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["processing", "ready", "failed"],
      default: "processing",
      index: true,
    },
    entryFile: {
      type: String,
      default: null,
    },
    playablePath: {
      type: String,
      default: null,
    },
    storagePath: {
      type: String,
      default: null,
    },
    archivePath: {
      type: String,
      default: null,
    },
    downloadPath: {
      type: String,
      default: null,
    },
    sizeBytes: {
      type: Number,
      default: 0,
    },
    fileCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: false,
      index: true,
    },
    activatedAt: {
      type: Date,
      default: null,
    },
    errorMessage: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

gameBuildSchema.index({ game: 1, createdAt: -1 });

gameBuildSchema.index({ game: 1, isActive: 1 });

const GameBuild = mongoose.model<GameBuildDocument>("GameBuild", gameBuildSchema);

export default GameBuild;
