import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || "development";
const cloudinaryUrl = process.env.CLOUDINARY_URL?.trim();
const hasCloudinaryTriplet = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME?.trim() && process.env.CLOUDINARY_API_KEY?.trim() && process.env.CLOUDINARY_API_SECRET?.trim()
);

if (NODE_ENV === "production" && !cloudinaryUrl && !hasCloudinaryTriplet) {
  throw new Error(
    "Missing Cloudinary credentials. Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
  );
}

if (cloudinaryUrl) {
  try {
    const parsedUrl = new URL(cloudinaryUrl);

    cloudinary.config({
      cloud_name: parsedUrl.hostname,
      api_key: decodeURIComponent(parsedUrl.username),
      api_secret: decodeURIComponent(parsedUrl.password),
      secure: true,
    });
  } catch {
    throw new Error("Invalid CLOUDINARY_URL format. Expected: cloudinary://<api_key>:<api_secret>@<cloud_name>");
  }
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
    api_key: process.env.CLOUDINARY_API_KEY || "",
    api_secret: process.env.CLOUDINARY_API_SECRET || "",
    secure: true,
  });
}

export default cloudinary;
