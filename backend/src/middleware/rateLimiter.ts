import rateLimit from "express-rate-limit";

const isProduction = process.env.NODE_ENV === "production";

// General API rate limiter - 100 requests per 15 minutes per IP
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Keep auth stricter in production but less disruptive for local testing
export const authLimiter = rateLimit({
  windowMs: isProduction ? 15 * 60 * 1000 : 5 * 60 * 1000,
  max: isProduction ? 5 : 100,
  message: isProduction
    ? "Too many authentication attempts, please try again after 15 minutes"
    : "Too many authentication attempts, please try again after 5 minutes",
  skipSuccessfulRequests: true, // Don't count successful requests
  standardHeaders: true,
  legacyHeaders: false,
});

// Moderate rate limiter for comment/post creation - 30 requests per 15 minutes per IP
export const contentCreationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 30 requests per windowMs
  message: "Too many requests to create content, please try again later",
  skipSuccessfulRequests: false,
  standardHeaders: true,
  legacyHeaders: false,
});
