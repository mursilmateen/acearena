import { Response } from "express";
import { AuthenticatedRequest } from "../types/index";
import { AuthService } from "../services/authService";
import { registerSchema, loginSchema } from "../utils/validators";
import { asyncHandler, AppError } from "../middleware/errorHandler";

export const register = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    // Validate input
    const validatedData = registerSchema.parse(req.body);

    // Call service
    const result = await AuthService.register(validatedData);

    res.status(201).json({
      success: true,
      data: result,
      message: "User registered successfully",
    });
  }
);

export const login = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    // Validate input
    const validatedData = loginSchema.parse(req.body);

    // Call service
    const result = await AuthService.login(validatedData);

    res.status(200).json({
      success: true,
      data: result,
      message: "Login successful",
    });
  }
);

export const logout = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    // JWT is stateless, just return success
    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  }
);
