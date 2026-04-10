import express, { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import {
  saveSaveState,
  loadSaveState,
  listSaveStates,
  deleteSaveState,
} from "../controllers/saveStateController";

const router: Router = express.Router({ mergeParams: true });

/**
 * Save state routes
 * POST /api/games/:gameId/save-state - Save game state
 * GET /api/games/:gameId/save-state - List save states
 * GET /api/games/:gameId/save-state?slot=1 - Load specific save state
 * DELETE /api/games/:gameId/save-state?slot=1 - Delete save state
 */

router.post("/", authenticateToken, saveSaveState);
router.get("/", authenticateToken, listSaveStates);
router.get("/load", authenticateToken, loadSaveState);
router.delete("/", authenticateToken, deleteSaveState);

export default router;
