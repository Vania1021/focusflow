import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware";
import { uploadFile, getDownloadUrl, getBlobContent } from "../controllers/blobStorage.controller";
import multer from "multer";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * UPLOAD file to blob
 * POST /api/storage/upload
 */
router.post("/upload", protectRoute, upload.single("file"), uploadFile);

/**
 * POST download URL (SAS token)
 * POST /api/storage/download_url
 */
router.post("/download_url", protectRoute, getDownloadUrl);

/**
 * POST get blob content
 * POST /api/storage/content
 */
router.post("/content", protectRoute, getBlobContent);

export default router;
