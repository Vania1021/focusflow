import fs from "fs";
import path from "path";
import os from "os";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import { Content_outputsContainer } from "../lib/db.config";
import { downloadBlobToFilePath, uploadToBlob } from "../utils/blobDownloadHelper";
import { getUserPreferences } from "../utils/getUserPreference";
import { processTextWorker } from "./process.text.worker";
import { OutputStyle } from "../types/textprocessing";

// Initialize Gemini Clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY as string);

interface ProcessVideoParams {
  contentId: string;
  userId: string;
  outputStyle: OutputStyle;
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

  // const fileUri = uploadResult.file.uri;
  // console.log(`[Gemini Upload] Uploaded as ${fileUri}`);

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
export const processVideoInBackground = async ({ contentId, userId, outputStyle, inputType, storageRef }: ProcessVideoParams) => {
  console.log(`[Video Worker] Processing ${inputType} | ID: ${contentId}`);
  let tempFilePath: string | null = null;
  let googleFile: any = null;

  try {
    let summary = "";
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
 const normalizedType = inputType.toUpperCase();

    if (normalizedType === "VIDEO" || normalizedType === "VIDEO_LOCAL") {
      // 1️⃣ Download video from Azure Blob
      const tempDir = os.tmpdir();
      const ext = path.extname(storageRef) || ".mp4";
      tempFilePath = path.join(tempDir, `video_${contentId}${ext}`);

      console.log("[Video Worker] Downloading from Blob...");
      await downloadBlobToFilePath(storageRef, tempFilePath);

      // 2️⃣ Upload to Gemini
      googleFile = await uploadToGemini(tempFilePath, "video/mp4");

      // 3️⃣ Generate summary
      console.log("[Gemini] Generating summary...");
      const result = await model.generateContent([
        {
          fileData: {
            mimeType: googleFile.mimeType,
            fileUri: googleFile.uri,
          },
        },
        {
          text: `
You are an expert ADHD-friendly study assistant.

Analyze BOTH:
• Audio (spoken explanation)
• Visuals (slides, diagrams, code, text on screen)

Produce a concise summary with:
1. Clear Markdown headers
2. Bullet points
3. Explain any diagrams or code shown
4. Preserves all key concepts, definitions, and examples
5. Concise but complete

Output ONLY markdown text.
`,
        },
      ]);

      // 4️⃣ SAFE GEMINI RESPONSE EXTRACTION (CRITICAL FIX)
      const response = result.response;
      let extractedText = "";

      for (const candidate of response.candidates ?? []) {
        for (const part of candidate.content.parts ?? []) {
          if (part.text) {
            extractedText += part.text + "\n";
          }
        }
      }

      summary = extractedText.trim();
    } else {
      throw new Error(`Unsupported inputType: ${inputType}`);
    }

    if (!summary) {
      throw new Error("No summary generated from Gemini");
    }

    const preferences = await getUserPreferences(userId);


    await processTextWorker({
      contentId,
      userId,
      outputStyle,
      text: summary,
      preferences,
    });


    console.log(`[Video Worker] Worker dispatched for ${contentId}`);
  } catch (error: any) {
    console.error("[Video Worker] ❌ Failed:", error.message);

    await Content_outputsContainer.item(contentId, userId).patch([
      { op: "set", path: "/status", value: "FAILED" },
      { op: "set", path: "/errorMessage", value: error.message },
    ]);
  } finally {
    // 🧹 Cleanup
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    if (googleFile) {
      try {
        await fileManager.deleteFile(googleFile.name);
      } catch {}
    }
  }

};
