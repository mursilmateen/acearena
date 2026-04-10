import jwt from "jsonwebtoken";
import { JWTPayload } from "../types/index";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET: string = (process.env.JWT_SECRET || "your_secret_key") as string;
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
