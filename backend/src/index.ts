import express, { Application, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { connectDB, disconnectDB } from "./config/database";
import { errorHandler } from "./middleware/errorHandler";

// Routes
import authRoutes from "./routes/authRoutes";
import profileRoutes from "./routes/profileRoutes";
import gameRoutes from "./routes/gameRoutes";
import assetRoutes from "./routes/assetRoutes";
import gameJamRoutes from "./routes/gameJamRoutes";
import postRoutes from "./routes/postRoutes";

dotenv.config();

const app: Application = express();
const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV === "production";
const PORT = Number(process.env.PORT) || (isProduction ? 8080 : 5000);

const hasMongoUri = Boolean(
  process.env.MONGO_URI?.trim() ||
  process.env.MONGODB_URI?.trim() ||
  process.env.MONGO_URL?.trim() ||
  process.env.MONGODB_URL?.trim()
);

const hasCloudinaryCredentials = Boolean(
  process.env.CLOUDINARY_URL?.trim() ||
  (process.env.CLOUDINARY_CLOUD_NAME?.trim() && process.env.CLOUDINARY_API_KEY?.trim() && process.env.CLOUDINARY_API_SECRET?.trim())
);

const requiredEnvVars = ["JWT_SECRET"];
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]?.trim());

if (!hasMongoUri) {
  missingEnvVars.push("MONGO_URI|MONGODB_URI|MONGO_URL|MONGODB_URL");
}

if (!hasCloudinaryCredentials) {
  missingEnvVars.push("CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME+CLOUDINARY_API_KEY+CLOUDINARY_API_SECRET");
}

if (isProduction && missingEnvVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnvVars.join(", ")}`);
  process.exit(1);
}

const normalizeOrigin = (origin: string): string => origin.trim().replace(/\/+$/, "");

const parseOrigins = (value?: string): string[] =>
  (value || "")
    .split(",")
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean);

const allowedOrigins = new Set<string>([
  ...parseOrigins(process.env.FRONTEND_URLS),
  ...parseOrigins(process.env.FRONTEND_URL),
  ...parseOrigins(process.env.CORS_ORIGIN),
]);

if (!isProduction && allowedOrigins.size === 0) {
  allowedOrigins.add("http://localhost:3000");
}

if (isProduction && allowedOrigins.size === 0) {
  console.error("❌ Missing CORS configuration. Set FRONTEND_URL, FRONTEND_URLS, or CORS_ORIGIN.");
  process.exit(1);
}

app.set("trust proxy", 1);

// Security Middleware
app.use(helmet());

// CORS Configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(normalizeOrigin(origin))) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Request Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} (${req.ip})`);
  next();
});
app.use(morgan("combined"));

// Body Parsing
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

const gameBuildsRoot = path.resolve(process.cwd(), "uploads", "game-builds");
if (!fs.existsSync(gameBuildsRoot)) {
  fs.mkdirSync(gameBuildsRoot, { recursive: true });
}

const gameFilesRoot = path.resolve(process.cwd(), "uploads", "game-files");
if (!fs.existsSync(gameFilesRoot)) {
  fs.mkdirSync(gameFilesRoot, { recursive: true });
}

const readLeadingBytes = (filePath: string, byteCount: number): Buffer | null => {
  try {
    const descriptor = fs.openSync(filePath, "r");
    const chunk = Buffer.alloc(byteCount);
    const bytesRead = fs.readSync(descriptor, chunk, 0, byteCount, 0);
    fs.closeSync(descriptor);
    return chunk.subarray(0, bytesRead);
  } catch {
    return null;
  }
};

const setGameBuildAssetHeaders = (res: Response, filePath: string): void => {
  const lowerFilePath = filePath.toLowerCase();

  if (lowerFilePath.endsWith(".wasm")) {
    res.setHeader("Content-Type", "application/wasm");
  }

  if (lowerFilePath.endsWith(".data") || lowerFilePath.endsWith(".pck")) {
    res.setHeader("Content-Type", "application/octet-stream");
  }

  if (
    lowerFilePath.endsWith(".js") ||
    lowerFilePath.endsWith(".mjs") ||
    lowerFilePath.endsWith(".loader.js") ||
    lowerFilePath.endsWith(".framework.js")
  ) {
    res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  }

  if (lowerFilePath.endsWith(".unityweb")) {
    const originalExtensionPath = lowerFilePath.slice(0, -".unityweb".length);

    if (originalExtensionPath.endsWith(".wasm")) {
      res.setHeader("Content-Type", "application/wasm");
    } else if (
      originalExtensionPath.endsWith(".js") ||
      originalExtensionPath.endsWith(".loader.js") ||
      originalExtensionPath.endsWith(".framework.js")
    ) {
      res.setHeader("Content-Type", "application/javascript; charset=utf-8");
    } else {
      res.setHeader("Content-Type", "application/octet-stream");
    }

    const headerBytes = readLeadingBytes(filePath, 2);
    const looksLikeGzip = Boolean(headerBytes && headerBytes.length === 2 && headerBytes[0] === 0x1f && headerBytes[1] === 0x8b);
    res.setHeader("Content-Encoding", looksLikeGzip ? "gzip" : "br");
  }
};

app.use(
  "/game-builds",
  express.static(gameBuildsRoot, {
    index: false,
    setHeaders: (res, filePath) => {
      res.removeHeader("Content-Security-Policy");
      res.removeHeader("X-Frame-Options");
      res.setHeader("X-Content-Type-Options", "nosniff");
      setGameBuildAssetHeaders(res, filePath);
      if (filePath.toLowerCase().endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache");
      } else {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
    },
  })
);

app.use(
  "/game-files",
  express.static(gameFilesRoot, {
    index: false,
    setHeaders: (res) => {
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    },
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/jams", gameJamRoutes);
app.use("/api/posts", postRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Error handler (must be last)
app.use(errorHandler);

let server: ReturnType<typeof app.listen> | null = null;

const listenOnPort = (port: number): Promise<ReturnType<typeof app.listen>> =>
  new Promise((resolve, reject) => {
    const candidateServer = app.listen(port, "0.0.0.0");

    const handleListening = () => {
      candidateServer.removeListener("error", handleError);
      resolve(candidateServer);
    };

    const handleError = (error: NodeJS.ErrnoException) => {
      candidateServer.removeListener("listening", handleListening);
      reject(error);
    };

    candidateServer.once("listening", handleListening);
    candidateServer.once("error", handleError);
  });

// Start server
const startServer = async () => {
  try {
    await connectDB();

    const maxAttempts = isProduction ? 1 : 20;
    let selectedPort = PORT;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        server = await listenOnPort(selectedPort);
        break;
      } catch (error) {
        const listenError = error as NodeJS.ErrnoException;

        if (!isProduction && listenError.code === "EADDRINUSE" && attempt < maxAttempts) {
          console.warn(`⚠️ Port ${selectedPort} is already in use. Retrying on ${selectedPort + 1}...`);
          selectedPort += 1;
          continue;
        }

        throw error;
      }
    }

    if (!server) {
      throw new Error(`No available port found in range ${PORT}-${selectedPort}.`);
    }

    console.log(`✅ Server running on port ${selectedPort}`);
    console.log(`📍 Environment: ${NODE_ENV}`);
    console.log(`🌐 CORS enabled for: ${Array.from(allowedOrigins).join(", ")}`);
  } catch (error) {
    console.error("❌ Failed to start server", error);
    process.exit(1);
  }
};

const gracefulShutdown = async (signal: NodeJS.Signals) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  try {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server?.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });
    }

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error("❌ Graceful shutdown failed", error);
    process.exit(1);
  }
};

process.on("SIGINT", () => {
  void gracefulShutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void gracefulShutdown("SIGTERM");
});

startServer();

export default app;
