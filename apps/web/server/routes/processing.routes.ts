import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware";
import { triggerPDFProcessing } from "../controllers/textsummarizer.controller";

const router = Router();

/**
 * Trigger PDF processing
 * POST /api/process/pdf/:contentId
 */
router.post(
  "/pdf/:contentId",
  protectRoute,
  triggerPDFProcessing
);

export default router;
