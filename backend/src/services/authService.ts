import User from "../models/User";
import { hashPassword, comparePassword } from "../utils/helpers";
import { generateToken } from "../utils/jwt";
import { AppError } from "../middleware/errorHandler";
import { RegisterInput, LoginInput } from "../utils/validators";

export class AuthService {
  static async register(data: RegisterInput) {
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: data.email }, { username: data.username }],
    });

    if (existingUser) {
      throw new AppError(409, "User already exists with that email or username");
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const user = new User({
      username: data.username,
      email: data.email,
      password: hashedPassword,
      role: data.role,
    });

    try {
      await user.save();
    } catch (error: any) {
      // Handle MongoDB duplicate key error
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new AppError(409, `${field} already exists`);
      }
      throw error;
    }

    // Generate token
    const token = generateToken({
      id: user._id!.toString(),
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        bio: user.bio || '',
        avatar: user.avatar || null,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  static async login(data: LoginInput) {
    // Find user
    const user = await User.findOne({ email: data.email });

    if (!user) {
      throw new AppError(401, "Invalid email or password");
    }

    // Compare password
    const isPasswordValid = await comparePassword(data.password, user.password);

    if (!isPasswordValid) {
      throw new AppError(401, "Invalid email or password");
    }

    // Generate token
    const token = generateToken({
      id: user._id!.toString(),
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        bio: user.bio || '',
        avatar: user.avatar || null,
        createdAt: user.createdAt,
      },
      token,
    };
  }
}
