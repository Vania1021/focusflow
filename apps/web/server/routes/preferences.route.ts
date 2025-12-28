import { Router } from "express";
import { saveUserPreferences } from "../controllers/preferences.controller";
import { protectRoute } from "../middleware/auth.middleware";

const router = Router();

// Endpoint: POST /api/preferences/save
router.post("/save", protectRoute, saveUserPreferences);

export default router;