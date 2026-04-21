import { Response } from "express";
import { AuthenticatedRequest } from "../types/index";
import Game from "../models/Game";
import GameBuild from "../models/GameBuild";
import { createGameSchema } from "../utils/validators";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { UploadService } from "../services/uploadService";
import { GameBuildService } from "../services/gameBuildService";
import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";

const UPLOADS_ROOT = path.resolve(process.cwd(), "uploads");

const cleanupTempFile = (filePath?: string) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const isZipArchive = (file: Express.Multer.File): boolean => {
  const lowerFileName = file.originalname.toLowerCase();
  return (
    lowerFileName.endsWith(".zip") ||
    file.mimetype === "application/zip" ||
    file.mimetype === "application/x-zip-compressed"
  );
};

const isArchivePackage = (fileName: string): boolean => {
  const lowerFileName = fileName.toLowerCase();
  return (
    lowerFileName.endsWith(".zip") ||
    lowerFileName.endsWith(".7z") ||
    lowerFileName.endsWith(".rar") ||
    lowerFileName.endsWith(".tar") ||
    lowerFileName.endsWith(".tar.gz") ||
    lowerFileName.endsWith(".tgz")
  );
};

const buildPublicUrl = (req: AuthenticatedRequest, relativePath: string): string => {
  const configuredBaseUrl = (process.env.PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "").trim();
  const baseUrl = configuredBaseUrl || `${req.protocol}://${req.get("host")}`;
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  const normalizedRelativePath = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
  return `${normalizedBaseUrl}${normalizedRelativePath}`;
};

const normalizeStoragePath = (value: string): string => value.replace(/\\/g, "/").replace(/^\/+/, "");

const ensureDirectory = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const sanitizeFileName = (value: string): string =>
  value
    .trim()
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, "-");

const persistDownloadableGameFile = (
  file: Express.Multer.File,
  gameId: string
): {
  publicPath: string;
  relativePath: string;
  absolutePath: string;
} => {
  const gameFilesDir = path.join(UPLOADS_ROOT, "game-files", gameId);
  ensureDirectory(gameFilesDir);

  const sourceName = file.originalname || file.filename || "game-package";
  const normalizedName = sanitizeFileName(path.basename(sourceName)) || "game-package";
  const storedFileName = `${Date.now()}-${normalizedName}`;
  const destinationPath = path.join(gameFilesDir, storedFileName);

  fs.copyFileSync(file.path, destinationPath);

  const relativePath = path.relative(UPLOADS_ROOT, destinationPath).split(path.sep).join("/");
  return {
    publicPath: `/${relativePath}`,
    relativePath,
    absolutePath: destinationPath,
  };
};

const resolveLocalDownloadPath = (target: string): string | null => {
  let pathname = target;

  if (target.startsWith("http://") || target.startsWith("https://")) {
    try {
      pathname = new URL(target).pathname;
    } catch {
      return null;
    }
  }

  if (!pathname.startsWith("/game-files/")) {
    return null;
  }

  const uploadsRoot = path.resolve(UPLOADS_ROOT);
  const resolvedPath = path.resolve(UPLOADS_ROOT, normalizeStoragePath(pathname));
  const isInsideUploadsRoot = resolvedPath === uploadsRoot || resolvedPath.startsWith(`${uploadsRoot}${path.sep}`);

  if (!isInsideUploadsRoot) {
    return null;
  }

  return resolvedPath;
};

const resolveBuildDirectoryFromPlayableUrl = (target: string): string | null => {
  let pathname = target;

  if (target.startsWith("http://") || target.startsWith("https://")) {
    try {
      pathname = new URL(target).pathname;
    } catch {
      return null;
    }
  }

  const match = pathname.match(/^\/game-builds\/([^/]+)\/([^/]+)\//i);
  if (!match) {
    return null;
  }

  const gameIdSegment = decodeURIComponent(match[1]);
  const buildIdSegment = decodeURIComponent(match[2]);
  const buildDirectoryPath = path.resolve(UPLOADS_ROOT, "game-builds", gameIdSegment, buildIdSegment);
  const allowedRoot = path.resolve(UPLOADS_ROOT, "game-builds");
  const isInsideAllowedRoot =
    buildDirectoryPath === allowedRoot || buildDirectoryPath.startsWith(`${allowedRoot}${path.sep}`);

  if (!isInsideAllowedRoot) {
    return null;
  }

  return buildDirectoryPath;
};

const deriveBuildDownloadPath = (build: {
  downloadPath?: string | null;
  storagePath?: string | null;
}): string | null => {
  if (build.downloadPath) {
    return build.downloadPath;
  }

  if (build.storagePath) {
    const normalizedStoragePath = normalizeStoragePath(build.storagePath);
    return `/${normalizedStoragePath}/source.zip`;
  }

  return null;
};

const resolveBuildArchivePath = (build: {
  archivePath?: string | null;
  storagePath?: string | null;
}): string | null => {
  if (build.archivePath) {
    return path.resolve(UPLOADS_ROOT, normalizeStoragePath(build.archivePath));
  }

  if (build.storagePath) {
    return path.resolve(UPLOADS_ROOT, normalizeStoragePath(build.storagePath), "source.zip");
  }

  return null;
};

const resolveBuildDirectoryPath = (build: {
  storagePath?: string | null;
}): string | null => {
  if (!build.storagePath) {
    return null;
  }

  return path.resolve(UPLOADS_ROOT, normalizeStoragePath(build.storagePath));
};

const createDownloadArchiveFromBuildDirectory = (buildDirectoryPath: string, buildId: string): string => {
  const temporaryArchiveDir = path.join(UPLOADS_ROOT, "tmp-downloads");
  ensureDirectory(temporaryArchiveDir);

  const archiveFileName = `${sanitizeFileName(buildId)}-${Date.now()}.zip`;
  const archivePath = path.join(temporaryArchiveDir, archiveFileName);
  const zip = new AdmZip();
  zip.addLocalFolder(buildDirectoryPath);
  zip.writeZip(archivePath);

  return archivePath;
};

const toDownloadFilename = (title: string, extension = ".zip"): string => {
  const normalized = (title || "game")
    .replace(/[^a-zA-Z0-9-_ ]+/g, "")
    .trim()
    .replace(/\s+/g, "-");

  const safeExtension = (extension || ".zip").startsWith(".") ? extension : `.${extension}`;

  return `${normalized || "game"}${safeExtension}`;
};

export const createGame = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    // Validate input
    const validatedData = createGameSchema.parse(req.body);

    // Create game
    const game = new Game({
      ...validatedData,
      createdBy: req.user.id,
    });

    await game.save();

    res.status(201).json({
      success: true,
      data: game,
      message: "Game created successfully",
    });
  }
);

export const uploadGameFile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    const { gameId } = req.params;

    if (!req.file) {
      throw new AppError(400, "No file provided");
    }

    // Check if game exists and belongs to user
    const game = await Game.findById(gameId);

    if (!game) {
      throw new AppError(404, "Game not found");
    }

    if (game.createdBy.toString() !== req.user.id) {
      throw new AppError(403, "You don't have permission to upload files for this game");
    }

    if (isArchivePackage(req.file.originalname) && !isZipArchive(req.file)) {
      throw new AppError(
        400,
        "Archive upload rejected: only .zip browser builds are supported. Upload an exported HTML5/WebGL .zip archive that includes index.html and all required assets."
      );
    }

    try {
      if (isZipArchive(req.file)) {
        const createdBuild = await GameBuild.create({
          game: game._id,
          createdBy: req.user.id,
          originalFileName: req.file.originalname,
          status: "processing",
        });

        try {
          const deployment = GameBuildService.deployZipBuild({
            zipFilePath: req.file.path,
            gameId: game._id.toString(),
            buildId: createdBuild._id.toString(),
          });

          const sourceArchivePath = path.resolve(UPLOADS_ROOT, deployment.storagePath, "source.zip");
          fs.copyFileSync(req.file.path, sourceArchivePath);

          const archivePath = path
            .relative(UPLOADS_ROOT, sourceArchivePath)
            .split(path.sep)
            .join("/");
          const downloadPath = `${deployment.publicBasePath}/source.zip`;

          await GameBuild.updateMany({ game: game._id }, { isActive: false });

          createdBuild.status = "ready";
          createdBuild.entryFile = deployment.entryFile;
          createdBuild.playablePath = deployment.playablePath;
          createdBuild.storagePath = deployment.storagePath;
          createdBuild.archivePath = archivePath;
          createdBuild.downloadPath = downloadPath;
          createdBuild.sizeBytes = deployment.totalSizeBytes;
          createdBuild.fileCount = deployment.fileCount;
          createdBuild.isActive = true;
          createdBuild.activatedAt = new Date();
          createdBuild.errorMessage = null;
          await createdBuild.save();

          game.fileUrl = buildPublicUrl(req, deployment.playablePath);
          game.downloadUrl = buildPublicUrl(req, downloadPath);
          game.gameFormat = "html5";
          game.isWebBased = true;
          game.supportedEmulator = "none";
          game.activeBuild = createdBuild._id.toString() as any;
          await game.save();

          res.status(200).json({
            success: true,
            data: {
              game,
              build: createdBuild,
            },
            message: "Game build uploaded and deployed successfully",
          });
          return;
        } catch (error) {
          createdBuild.status = "failed";
          createdBuild.errorMessage = error instanceof Error ? error.message : "Build deployment failed";
          createdBuild.isActive = false;
          await createdBuild.save();

          if (error instanceof AppError && /index\.html|no html entry file/i.test(error.message)) {
            throw new AppError(
              400,
              "Archive upload rejected: no browser-ready web build detected. Upload an exported HTML5/WebGL build archive that includes index.html and all required assets."
            );
          }

          throw error;
        }
      }

      // Persist non-archive game files locally for reliable large-file downloads.
      const storedFile = persistDownloadableGameFile(req.file, game._id.toString());
      const publicDownloadUrl = buildPublicUrl(req, storedFile.publicPath);
      await GameBuild.updateMany({ game: game._id }, { isActive: false, activatedAt: null });

      game.fileUrl = publicDownloadUrl;
      game.downloadUrl = publicDownloadUrl;
      game.isWebBased = false;
      game.supportedEmulator = game.supportedEmulator || "none";
      game.activeBuild = null as any;
      await game.save();

      res.status(200).json({
        success: true,
        data: game,
        message: "Game file uploaded successfully",
      });
    } finally {
      cleanupTempFile(req.file.path);
    }
  }
);

export const uploadGameThumbnail = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    const { gameId } = req.params;

    if (!req.file) {
      throw new AppError(400, "No file provided");
    }

    // Check if game exists and belongs to user
    const game = await Game.findById(gameId);

    if (!game) {
      throw new AppError(404, "Game not found");
    }

    if (game.createdBy.toString() !== req.user.id) {
      throw new AppError(403, "You don't have permission to upload files for this game");
    }

    // Upload to Cloudinary
    const upload = await UploadService.uploadImage(req.file.path, "games/thumbnails");

    // Delete temp file
    cleanupTempFile(req.file.path);

    // Update game
    game.thumbnail = upload.url;
    await game.save();

    res.status(200).json({
      success: true,
      data: game,
      message: "Thumbnail uploaded successfully",
    });
  }
);

export const getAllGames = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { tags, minPrice, maxPrice, search } = req.query;

    let filter: any = {
      fileUrl: { $exists: true, $ne: null },
      thumbnail: { $exists: true, $ne: null },
    };

    if (tags) {
      filter.tags = { $in: (tags as string).split(",") };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const games = await Game.find(filter).populate("createdBy", "username avatar").exec();

    res.status(200).json({
      success: true,
      data: games,
    });
  }
);

export const getGameById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const game = await Game.findById(id)
      .populate("createdBy", "username avatar bio")
      .populate("activeBuild")
      .exec();

    if (!game) {
      throw new AppError(404, "Game not found");
    }

    res.status(200).json({
      success: true,
      data: game,
    });
  }
);

export const getGameBuilds = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    const { gameId } = req.params;

    const game = await Game.findById(gameId);

    if (!game) {
      throw new AppError(404, "Game not found");
    }

    if (game.createdBy.toString() !== req.user.id) {
      throw new AppError(403, "You don't have permission to view builds for this game");
    }

    const builds = await GameBuild.find({ game: gameId }).sort({ createdAt: -1 }).exec();

    res.status(200).json({
      success: true,
      data: builds,
    });
  }
);

export const activateGameBuild = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    const { gameId, buildId } = req.params;

    const game = await Game.findById(gameId);

    if (!game) {
      throw new AppError(404, "Game not found");
    }

    if (game.createdBy.toString() !== req.user.id) {
      throw new AppError(403, "You don't have permission to activate builds for this game");
    }

    const build = await GameBuild.findOne({ _id: buildId, game: gameId }).exec();

    if (!build) {
      throw new AppError(404, "Build not found for this game");
    }

    if (build.status !== "ready" || !build.playablePath) {
      throw new AppError(400, "Only ready builds can be activated");
    }

    await GameBuild.updateMany({ game: gameId }, { isActive: false, activatedAt: null });

    build.isActive = true;
    build.activatedAt = new Date();

    const buildDownloadPath = deriveBuildDownloadPath(build);
    if (buildDownloadPath && !build.downloadPath) {
      build.downloadPath = buildDownloadPath;
    }

    await build.save();

    game.activeBuild = build._id.toString() as any;
    game.fileUrl = buildPublicUrl(req, build.playablePath);
    game.downloadUrl = buildDownloadPath ? buildPublicUrl(req, buildDownloadPath) : game.fileUrl;
    game.gameFormat = "html5";
    game.isWebBased = true;
    game.supportedEmulator = "none";
    await game.save();

    res.status(200).json({
      success: true,
      data: {
        game,
        build,
      },
      message: "Build activated successfully",
    });
  }
);

export const downloadGame = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const game = await Game.findById(id).exec();

    if (!game) {
      throw new AppError(404, "Game not found");
    }

    if (game.activeBuild) {
      const build = await GameBuild.findById(game.activeBuild).exec();
      if (build) {
        const archivePath = resolveBuildArchivePath(build);
        if (archivePath && fs.existsSync(archivePath)) {
          res.download(archivePath, toDownloadFilename(game.title, ".zip"));
          return;
        }

        const buildDirectoryPath = resolveBuildDirectoryPath(build);
        if (buildDirectoryPath && fs.existsSync(buildDirectoryPath)) {
          const generatedArchivePath = createDownloadArchiveFromBuildDirectory(
            buildDirectoryPath,
            build._id?.toString() || "build"
          );

          res.download(generatedArchivePath, toDownloadFilename(game.title, ".zip"), () => {
            if (fs.existsSync(generatedArchivePath)) {
              fs.rmSync(generatedArchivePath, { force: true });
            }
          });
          return;
        }
      }
    }

    const target = game.downloadUrl || game.fileUrl;
    if (!target) {
      throw new AppError(404, "Download file not available");
    }

    const localFilePath = resolveLocalDownloadPath(target);
    if (localFilePath && fs.existsSync(localFilePath)) {
      const fileExtension = path.extname(localFilePath) || ".zip";
      res.download(localFilePath, toDownloadFilename(game.title, fileExtension));
      return;
    }

    const legacyBuildDirectory = resolveBuildDirectoryFromPlayableUrl(target);
    if (legacyBuildDirectory && fs.existsSync(legacyBuildDirectory)) {
      const generatedArchivePath = createDownloadArchiveFromBuildDirectory(
        legacyBuildDirectory,
        game._id?.toString() || "build"
      );

      res.download(generatedArchivePath, toDownloadFilename(game.title, ".zip"), () => {
        if (fs.existsSync(generatedArchivePath)) {
          fs.rmSync(generatedArchivePath, { force: true });
        }
      });
      return;
    }

    const destination = target.startsWith("http://") || target.startsWith("https://")
      ? target
      : buildPublicUrl(req, target);

    res.redirect(302, destination);
  }
);

export const updateGame = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    const { id } = req.params;

    // Check if game exists and belongs to user
    const game = await Game.findById(id);

    if (!game) {
      throw new AppError(404, "Game not found");
    }

    if (game.createdBy.toString() !== req.user.id) {
      throw new AppError(403, "You don't have permission to update this game");
    }

    const validatedData = createGameSchema.parse(req.body);

    // Update game
    const updatedGame = await Game.findByIdAndUpdate(id, validatedData, { new: true });

    res.status(200).json({
      success: true,
      data: updatedGame,
      message: "Game updated successfully",
    });
  }
);

export const getUserGames = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    const games = await Game.find({ createdBy: req.user.id }).populate("createdBy", "username avatar").exec();

    res.status(200).json({
      success: true,
      data: games,
    });
  }
);

export const deleteGame = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    const { id } = req.params;

    // Check if game exists and belongs to user
    const game = await Game.findById(id);

    if (!game) {
      throw new AppError(404, "Game not found");
    }

    if (game.createdBy.toString() !== req.user.id) {
      throw new AppError(403, "You don't have permission to delete this game");
    }

    await GameBuild.deleteMany({ game: id });
    GameBuildService.deleteGameBuildDirectory(id);
    const gameFilesDir = path.join(UPLOADS_ROOT, "game-files", id);
    if (fs.existsSync(gameFilesDir)) {
      fs.rmSync(gameFilesDir, { recursive: true, force: true });
    }
    await Game.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Game deleted successfully",
    });
  }
);
