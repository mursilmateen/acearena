import cloudinary from "../config/cloudinary";
import { AppError } from "../middleware/errorHandler";

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "104857600"); // 100MB default

export class UploadService {
  static async uploadFile(filePath: string, folder: string) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: `acearedb/${folder}`,
        resource_type: "auto",
        timeout: 60000, // 60 second timeout for large files
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        size: result.bytes,
      };
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw new AppError(500, "Failed to upload file to cloud storage");
    }
  }

  static async uploadImage(filePath: string, folder: string) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: `acearedb/${folder}`,
        resource_type: "image",
        quality: "auto",
        fetch_format: "auto",
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        size: result.bytes,
      };
    } catch (error) {
      console.error("Cloudinary image upload error:", error);
      throw new AppError(500, "Failed to upload image to cloud storage");
    }
  }

  static async deleteFile(publicId: string) {
    try {
      await cloudinary.uploader.destroy(publicId);
      return true;
    } catch (error) {
      console.error("Cloudinary delete error:", error);
      throw new AppError(500, "Failed to delete file from cloud storage");
    }
  }

  static validateFileSize(fileSize: number): boolean {
    return fileSize <= MAX_FILE_SIZE;
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }
}
