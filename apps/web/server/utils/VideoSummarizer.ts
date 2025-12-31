import fs from "fs";
import path from "path";
import os from "os";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import { Content_outputsContainer } from "../lib/db.config";
import { downloadBlobToFilePath, uploadToBlob } from "../utils/blobDownloadHelper";

// Initialize Gemini Clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY as string);

interface ProcessVideoParams {
  contentId: string;
  userId: string;
  inputType: string;
  storageRef: string; // URL or Blob Name
}

/**
 * Helper: Uploads file to Google AI and waits for processing to complete
 */
async function uploadToGemini(filePath: string, mimeType: string) {
  console.log(`[Gemini Upload] Uploading ${filePath}...`);
  
  const uploadResult = await fileManager.uploadFile(filePath, {
    mimeType,
    displayName: path.basename(filePath),
  });

  const fileUri = uploadResult.file.uri;
  console.log(`[Gemini Upload] Uploaded as ${fileUri}`);

  // Wait for file to be active (processing takes a few seconds)
  let file = await fileManager.getFile(uploadResult.file.name);
  while (file.state === FileState.PROCESSING) {
    console.log("[Gemini Upload] Processing video...");
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Sleep 2s
    file = await fileManager.getFile(uploadResult.file.name);
  }

  if (file.state === FileState.FAILED) {
    throw new Error("Video processing failed by Google AI.");
  }

  console.log(`[Gemini Upload] Video is READY.`);
  return file;
}

// --- MAIN WORKER FUNCTION ---
// 🔥 This is the function your controller is looking for!
export const processVideoInBackground = async ({ contentId, userId, inputType, storageRef }: ProcessVideoParams) => {
  console.log(`[Video Worker] Processing ${inputType} | ID: ${contentId}`);
  let tempFilePath: string | null = null;
  let googleFile: any = null;

  try {
    let summary = "";
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // ---------------------------------------------------------
    // SCENARIO 1: LOCAL VIDEO FILE (The Main Feature)
    // ---------------------------------------------------------
    if (inputType === "VIDEO_LOCAL") {
      // 1. Download from Azure to Temp
      const tempDir = os.tmpdir();
      // Ensure we treat it as mp4 for compatibility, or extract real extension
      const ext = path.extname(storageRef) || ".mp4"; 
      tempFilePath = path.join(tempDir, `vid_${contentId}${ext}`);

      console.log(`[Video Worker] Downloading from Azure...`);
      await downloadBlobToFilePath(storageRef, tempFilePath);

      // 2. Upload to Gemini (It "watches" the video here)
      googleFile = await uploadToGemini(tempFilePath, "video/mp4");

      // 3. Prompt with Video + Instructions
      console.log("[Gemini] Analyzing Video (Visuals + Audio)...");
      const result = await model.generateContent([
        {
          fileData: {
            mimeType: googleFile.mimeType,
            fileUri: googleFile.uri,
          },
        },
        { text: `
            You are an expert study assistant. Watch this video and generate a "Bionic Reading" summary.
            
            Guidelines:
            1. Analyze both the AUDIO (what is said) and the VISUALS (slides, code, diagrams on screen).
            2. If code or diagrams are shown, describe them in the summary.
            3. Use Markdown.
            4. Bold the first few letters of key words (Bionic Reading style).
            5. Structure with clear headers.
        ` },
      ]);

      summary = result.response.text();
    } 
    
    // ---------------------------------------------------------
    // SCENARIO 2: TEXT INPUT (Fallback)
    // ---------------------------------------------------------
    else if (inputType === "VIDEO_TEXT") {
       throw new Error("Text input should route to Text Summarizer, not Video.");
    }
    else if (inputType === "VIDEO_LINK") {
      throw new Error("Direct Link processing not yet implemented. Please upload the file.");
    }

    if (!summary) throw new Error("No summary generated.");

    // ---------------------------------------------------------
    // STEP 4: SAVE RESULT
    // ---------------------------------------------------------
    const outputBlobName = `processed/${userId}/${contentId}_summary.json`;

    await uploadToBlob(outputBlobName, JSON.stringify({
      summary: summary,
      aiModel: "Gemini 1.5 Flash (Multimodal)",
      generatedAt: new Date().toISOString()
    }));

    // Update DB
    await Content_outputsContainer.item(contentId, userId).patch([
      { op: "set", path: "/status", value: "READY" },
      { op: "set", path: "/processedBlobName", value: outputBlobName },
      { op: "set", path: "/outputFormat", value: "bionic" }
    ]);

    console.log(`[Video Worker] ✅ Success!`);

  } catch (error: any) {
    console.error(`[Video Worker] ❌ Error:`, error);
    
    await Content_outputsContainer.item(contentId, userId).patch([
      { op: "set", path: "/status", value: "FAILED" },
      { op: "set", path: "/errorMessage", value: error.message }
    ]);
  } finally {
    // CLEANUP
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    if (googleFile) {
        try {
            await fileManager.deleteFile(googleFile.name);
        } catch (e) {
            console.error("Failed to delete Google file:", e);
        }
    }
  }
};