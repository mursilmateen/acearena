import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || "development";
const requiredCloudinaryVars = ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"];
const missingCloudinaryVars = requiredCloudinaryVars.filter((key) => !process.env[key]?.trim());

if (NODE_ENV === "production" && missingCloudinaryVars.length > 0) {
  throw new Error(`Missing required Cloudinary environment variables: ${missingCloudinaryVars.join(", ")}`);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
  secure: true,
});

export default cloudinary;
