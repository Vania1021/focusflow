import { Request, Response } from "express";
import { Content_outputsContainer } from "../lib/db.config";
import { processVideoInBackground } from "../utils/VideoSummarizer";

export const triggerProcessingVideo = async (req: Request, res: Response) => {
  console.log(`[Video Controller] ${new Date().toISOString()} - Triggering processing for contentId: ${req.params.contentId}`);

  try {
    const { contentId } = req.params;
    // Assuming 'req.user' is populated by your auth middleware
    const userId = (req as any).user?.id; 

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized: User ID missing" });
    }

    // 1️⃣ Fetch the content record from Cosmos DB
    const { resource } = await Content_outputsContainer.item(contentId, userId).read();

    if (!resource) {
      console.warn(`[Video Controller] Content not found: ${contentId}`);
      return res.status(404).json({ message: "Content output not found" });
    }

    // 2️⃣ Check Status to prevent duplicate processing
    if (resource.status === "PROCESSING") {
      console.log(`[Video Controller] Skipped: ${contentId} is already processing.`);
      return res.status(400).json({ message: "Processing already in progress" });
    }
    
    if (resource.status === "READY") {
      console.log(`[Video Controller] Skipped: ${contentId} is already ready.`);
      return res.status(200).json({ 
        message: "Content already processed", 
        contentId 
      });
    }

    // 3️⃣ Update Status to PROCESSING immediately (Optimistic Update)
    await Content_outputsContainer.item(contentId, userId).patch([
      { op: "set", path: "/status", value: "PROCESSING" },
    ]);
    console.log(`[Video Controller] Status updated to PROCESSING for ${contentId}`);

    // 4️⃣ Dispatch Background Job (Fire and Forget - do NOT await this)
    // We pass the inputType and storageRef so the worker knows what to do
    processVideoInBackground({
      contentId,
      userId,
      inputType: resource.inputType, // e.g., 'VIDEO_LOCAL', 'VIDEO_LINK'
      storageRef: resource.rawStorageRef, // e.g., the blob URL
    });

    // 5️⃣ Respond Immediately to the Client
    return res.status(202).json({
      message: "Video processing started",
      contentId,
      status: "PROCESSING"
    });

  } catch (error: any) {
    console.error("❌ VIDEO TRIGGER ERROR:", error);
    return res.status(500).json({ 
        message: "Failed to start processing",
        error: error.message 
    });
  }
};