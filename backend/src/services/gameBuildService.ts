import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import { AppError } from "../middleware/errorHandler";

const MAX_ARCHIVE_BYTES = parseInt(process.env.MAX_GAME_BUILD_ARCHIVE_SIZE || "262144000", 10); // 250MB
const MAX_UNCOMPRESSED_BYTES = parseInt(process.env.MAX_GAME_BUILD_UNCOMPRESSED_SIZE || "1073741824", 10); // 1GB
const MAX_FILES = parseInt(process.env.MAX_GAME_BUILD_FILE_COUNT || "6000", 10);

const blockedExtensions = new Set([".exe", ".dll", ".bat", ".cmd", ".ps1", ".sh", ".php", ".cgi"]);
const runtimeArtifactExtensions = [".wasm", ".pck", ".data", ".unityweb", ".js", ".mjs"];

export const GAME_BUILDS_ROOT = path.resolve(process.cwd(), "uploads", "game-builds");

interface DeployZipBuildInput {
  zipFilePath: string;
  gameId: string;
  buildId: string;
}

interface DeployZipBuildResult {
  storagePath: string;
  publicBasePath: string;
  playablePath: string;
  entryFile: string;
  totalSizeBytes: number;
  fileCount: number;
}

const ensureDir = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const removeDirIfExists = (dirPath: string) => {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
};

const normalizeEntryPath = (entryName: string): string => {
  const unixPath = entryName.replace(/\\/g, "/").trim();

  if (!unixPath || unixPath.startsWith("/")) {
    throw new AppError(400, "Build archive contains invalid absolute paths");
  }

  const normalized = path.posix.normalize(unixPath);

  if (normalized === "." || normalized === ".." || normalized.startsWith("../")) {
    throw new AppError(400, "Build archive contains unsafe relative paths");
  }

  if (normalized.includes("\0")) {
    throw new AppError(400, "Build archive contains invalid file names");
  }

  return normalized;
};

const isBlockedFile = (relativePath: string): boolean => {
  const extension = path.extname(relativePath).toLowerCase();
  return blockedExtensions.has(extension);
};

const walkFiles = (root: string): string[] => {
  const results: string[] = [];

  const walk = (dirPath: string) => {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else {
        results.push(fullPath);
      }
    }
  };

  walk(root);

  return results;
};

const toRelativePosixPath = (fullPath: string, buildRoot: string): string =>
  path.relative(buildRoot, fullPath).split(path.sep).join("/");

const stripQueryAndHash = (value: string): string => value.split(/[?#]/, 1)[0].trim();

const isExternalReference = (value: string): boolean =>
  /^(?:[a-z]+:)?\/\//i.test(value) ||
  value.startsWith("data:") ||
  value.startsWith("blob:") ||
  value.startsWith("mailto:") ||
  value.startsWith("javascript:");

const hasRuntimeArtifact = (relativePath: string): boolean => {
  const lowerPath = relativePath.toLowerCase();
  return runtimeArtifactExtensions.some((extension) => lowerPath.endsWith(extension));
};

const extractLocalAssetReferences = (html: string): string[] => {
  const references = new Set<string>();

  const htmlAttributeRegex = /\b(?:src|href)\s*=\s*["']([^"']+)["']/gi;
  const assetConfigRegex =
    /\b(?:dataUrl|frameworkUrl|codeUrl|wasmUrl|pckUrl|mainPack)\s*[:=]\s*["']([^"']+)["']/gi;

  for (const regex of [htmlAttributeRegex, assetConfigRegex]) {
    let match: RegExpExecArray | null;
    while ((match = regex.exec(html)) !== null) {
      const rawReference = (match[1] || "").trim();
      if (!rawReference || isExternalReference(rawReference)) {
        continue;
      }

      const cleanedReference = stripQueryAndHash(rawReference);
      if (!cleanedReference || cleanedReference === "." || cleanedReference === "#") {
        continue;
      }

      references.add(cleanedReference);
    }
  }

  return Array.from(references);
};

const scoreEntryCandidate = (entryFile: string, allRelativeFiles: string[], buildRoot: string): number => {
  let score = 0;
  const lowerEntry = entryFile.toLowerCase();

  if (lowerEntry === "index.html") {
    score += 1000;
  }

  const depth = entryFile.split("/").length;
  score -= depth * 10;

  const entryDirectory = path.posix.dirname(entryFile);
  const directoryPrefix = entryDirectory === "." ? "" : `${entryDirectory}/`;

  const relatedFiles = allRelativeFiles.filter((candidate) => {
    if (candidate === entryFile) {
      return false;
    }

    if (!directoryPrefix) {
      return !candidate.includes("/");
    }

    return candidate.startsWith(directoryPrefix);
  });

  const runtimeArtifactCount = relatedFiles.filter(hasRuntimeArtifact).length;
  score += Math.min(runtimeArtifactCount, 10) * 50;

  try {
    const entryAbsolutePath = path.resolve(buildRoot, entryFile.split("/").join(path.sep));
    const html = fs.readFileSync(entryAbsolutePath, "utf8");
    const references = extractLocalAssetReferences(html);

    score += references.length * 5;
    if (references.some((reference) => hasRuntimeArtifact(reference))) {
      score += 120;
    }

    if (references.some((reference) => reference.startsWith("/"))) {
      score -= 200;
    }
  } catch {
    score -= 500;
  }

  return score;
};

const validateEntryFile = (buildRoot: string, entryFile: string, extractedRelativeFiles: Set<string>): void => {
  const entryAbsolutePath = path.resolve(buildRoot, entryFile.split("/").join(path.sep));
  let html: string;

  try {
    html = fs.readFileSync(entryAbsolutePath, "utf8");
  } catch {
    throw new AppError(400, "Build archive entry file could not be read as UTF-8 HTML");
  }

  const references = extractLocalAssetReferences(html);
  const entryDirectory = path.posix.dirname(entryFile);

  const absoluteReferences = references.filter((reference) => reference.startsWith("/"));
  if (absoluteReferences.length > 0) {
    throw new AppError(
      400,
      "Build archive entry file uses absolute asset paths. Use relative paths so assets load from the deployed build folder."
    );
  }

  const missingReferences: string[] = [];

  for (const reference of references) {
    const resolvedReference = path.posix.normalize(path.posix.join(entryDirectory, reference));

    if (!resolvedReference || resolvedReference === "." || resolvedReference === ".." || resolvedReference.startsWith("../")) {
      throw new AppError(400, "Build archive contains unsafe relative asset paths in index.html");
    }

    if (!extractedRelativeFiles.has(resolvedReference)) {
      missingReferences.push(reference);
    }
  }

  if (missingReferences.length > 0) {
    const sampleMissingFiles = missingReferences.slice(0, 5).join(", ");
    throw new AppError(400, `Build archive is missing required assets referenced by index.html: ${sampleMissingFiles}`);
  }
};

const selectEntryFile = (allFiles: string[], buildRoot: string): string => {
  const relativeFiles = allFiles.map((filePath) => toRelativePosixPath(filePath, buildRoot));
  const indexFiles = relativeFiles.filter((filePath) => path.posix.basename(filePath).toLowerCase() === "index.html");

  if (indexFiles.length === 0) {
    throw new AppError(400, "Build archive must include index.html to be playable in browser");
  }

  const sorted = indexFiles.sort((a, b) => {
    const scoreDifference = scoreEntryCandidate(b, relativeFiles, buildRoot) - scoreEntryCandidate(a, relativeFiles, buildRoot);

    if (scoreDifference !== 0) {
      return scoreDifference;
    }

    const aDepth = a.split("/").length;
    const bDepth = b.split("/").length;

    if (aDepth !== bDepth) return aDepth - bDepth;

    return a.localeCompare(b);
  });

  return sorted[0];
};

const encodeRelativePath = (relativePath: string): string =>
  relativePath
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");

export class GameBuildService {
  static deployZipBuild(input: DeployZipBuildInput): DeployZipBuildResult {
    const { zipFilePath, gameId, buildId } = input;

    if (!fs.existsSync(zipFilePath)) {
      throw new AppError(400, "Uploaded build archive could not be found");
    }

    const archiveStats = fs.statSync(zipFilePath);

    if (archiveStats.size > MAX_ARCHIVE_BYTES) {
      throw new AppError(413, "Build archive exceeds maximum allowed size");
    }

    ensureDir(GAME_BUILDS_ROOT);

    const gameDir = path.join(GAME_BUILDS_ROOT, gameId);
    const buildDir = path.join(gameDir, buildId);

    removeDirIfExists(buildDir);
    ensureDir(buildDir);

    const zip = new AdmZip(zipFilePath);
    const entries = zip.getEntries();

    if (entries.length === 0) {
      removeDirIfExists(buildDir);
      throw new AppError(400, "Uploaded build archive is empty");
    }

    let fileCount = 0;
    let uncompressedSizeBytes = 0;

    try {
      for (const entry of entries) {
        if (entry.isDirectory) {
          continue;
        }

        const normalizedPath = normalizeEntryPath(entry.entryName);

        if (normalizedPath.startsWith("__MACOSX/")) {
          continue;
        }

        if (isBlockedFile(normalizedPath)) {
          throw new AppError(400, `Blocked file type detected in build: ${normalizedPath}`);
        }

        const targetPath = path.resolve(buildDir, normalizedPath);

        if (!targetPath.startsWith(path.resolve(buildDir) + path.sep) && targetPath !== path.resolve(buildDir)) {
          throw new AppError(400, "Build archive contains unsafe extraction paths");
        }

        const fileBuffer = entry.getData();

        uncompressedSizeBytes += fileBuffer.length;
        fileCount += 1;

        if (fileCount > MAX_FILES) {
          throw new AppError(413, "Build archive contains too many files");
        }

        if (uncompressedSizeBytes > MAX_UNCOMPRESSED_BYTES) {
          throw new AppError(413, "Build archive uncompressed size exceeds allowed limit");
        }

        ensureDir(path.dirname(targetPath));
        fs.writeFileSync(targetPath, fileBuffer);
      }
    } catch (error) {
      removeDirIfExists(buildDir);
      throw error;
    }

    const extractedFiles = walkFiles(buildDir);

    if (extractedFiles.length === 0) {
      removeDirIfExists(buildDir);
      throw new AppError(400, "Build archive did not contain deployable files");
    }

    const extractedRelativeFiles = new Set(extractedFiles.map((filePath) => toRelativePosixPath(filePath, buildDir)));

    const entryFile = selectEntryFile(extractedFiles, buildDir);
    validateEntryFile(buildDir, entryFile, extractedRelativeFiles);
    const publicBasePath = `/game-builds/${encodeURIComponent(gameId)}/${encodeURIComponent(buildId)}`;
    const playablePath = `${publicBasePath}/${encodeRelativePath(entryFile)}`;

    return {
      storagePath: path.relative(path.resolve(process.cwd(), "uploads"), buildDir).split(path.sep).join("/"),
      publicBasePath,
      playablePath,
      entryFile,
      totalSizeBytes: uncompressedSizeBytes,
      fileCount,
    };
  }

  static deleteBuildDirectory(gameId: string, buildId: string): void {
    const buildDir = path.join(GAME_BUILDS_ROOT, gameId, buildId);
    removeDirIfExists(buildDir);
  }

  static deleteGameBuildDirectory(gameId: string): void {
    const gameDir = path.join(GAME_BUILDS_ROOT, gameId);
    removeDirIfExists(gameDir);
  }
}
