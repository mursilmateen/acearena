import { z } from "zod";

// Auth Validation
export const registerSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["player", "developer"]).default("player"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Profile Validation
export const updateProfileSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  bio: z.string().max(500).optional(),
  socialLinks: z
    .object({
      twitter: z.string().optional(),
      github: z.string().optional(),
      website: z.string().optional(),
    })
    .optional(),
});

// Game Validation
export const createGameSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10),
  tags: z.array(z.string()).default([]),
  price: z.number().min(0).default(0),
  gameFormat: z.enum(["html5", "webgl", "zip", "exe", "dmg", "apk", "nes", "snes", "other"]).default("other"),
  isWebBased: z.boolean().default(false),
  supportedEmulator: z.enum(["nesjs", "snes9x", "dosbox", "none"]).default("none"),
});

// Asset Validation
export const createAssetSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10),
  type: z.enum(["2D", "3D", "audio", "music", "plugin", "other"]),
  tags: z.array(z.string()).default([]),
  price: z.number().min(0).default(0),
});

// Game Jam Validation
export const createGameJamSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(1000).optional(),
  theme: z.string().min(3),
  startDate: z.string().datetime(),
  deadline: z.string().datetime(),
  rules: z.array(z.string()).optional(),
});

// Type exports for TypeScript
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateGameInput = z.infer<typeof createGameSchema>;
export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type CreateGameJamInput = z.infer<typeof createGameJamSchema>;
