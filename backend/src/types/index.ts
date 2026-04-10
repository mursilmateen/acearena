import { Request } from "express";

export interface IUser {
  _id?: string;
  username: string;
  email: string;
  password: string;
  role: "player" | "developer";
  avatar?: string;
  bio?: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    website?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IGame {
  _id?: string;
  title: string;
  description: string;
  tags: string[];
  price: number;
  thumbnail?: string;
  fileUrl?: string;
  gameFormat?: "html5" | "webgl" | "zip" | "exe" | "dmg" | "apk" | "nes" | "snes" | "other";
  isWebBased?: boolean;
  supportedEmulator?: "nesjs" | "snes9x" | "dosbox" | "none";
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAsset {
  _id?: string;
  title: string;
  description: string;
  type: "2D" | "3D" | "audio" | "music" | "plugin" | "other";
  tags: string[];
  price: number;
  fileUrl?: string;
  thumbnail?: string;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IGameJam {
  _id?: string;
  title: string;
  description?: string;
  theme: string;
  startDate: Date;
  deadline: Date;
  rules?: string[];
  createdBy: string;
  participants: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
