import jwt from "jsonwebtoken";
import { JWTPayload } from "../types/index";
import dotenv from "dotenv";

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || "development";
const JWT_SECRET: string = (process.env.JWT_SECRET || (NODE_ENV === "production" ? "" : "dev_only_change_me")) as string;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is required in production");
}

if (NODE_ENV !== "production" && JWT_SECRET === "dev_only_change_me") {
  console.warn("⚠️ Using fallback JWT secret for development. Set JWT_SECRET in .env.");
}

const JWT_EXPIRY: string = (process.env.JWT_EXPIRY || "15m") as string;

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload as any, JWT_SECRET as any, { expiresIn: JWT_EXPIRY } as any);
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

export const decodeToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};
