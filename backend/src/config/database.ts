import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || "development";
const mongoUri = process.env.MONGO_URI || (NODE_ENV === "production" ? "" : "mongodb://localhost:27017/acearedb");

if (!mongoUri) {
  throw new Error("MONGO_URI is required in production");
}

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log("✅ MongoDB Disconnected");
  } catch (error) {
    console.error("❌ MongoDB Disconnection Error:", error);
  }
};
