import mongoose, { Schema, Document } from "mongoose";
import { IAsset } from "../types/index";

type AssetDocument = IAsset & Document;

const assetSchema = new Schema<AssetDocument>(
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
    type: {
      type: String,
      enum: ["2D", "3D", "audio", "music", "plugin", "other"],
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
    fileUrl: {
      type: String,
      default: null,
    },
    thumbnail: {
      type: String,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    } as any,
  },
  { timestamps: true }
);

const Asset = mongoose.model<AssetDocument>("Asset", assetSchema);

export default Asset;
