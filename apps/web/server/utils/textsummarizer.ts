import axios from "axios";
import { uploadToBlob } from "../lib/blob.config";
import { Content_outputsContainer ,   PreferencesContainer} from "../lib/db.config";
import { summarizeText, generateBionicJSON } from "./PdfSummarizer";
import { downloadBlobAsBuffer } from "./blobDownloadHelper";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",
  generationConfig: { 
    responseMimeType: "application/json" // 🔥 forces valid JSON
  }
});

export interface TextProcessInput {
  contentId: string;
  userId: string;
  textBuffer: Buffer;
  preferences: any | null;
}

const getUserPreferences = async (userId: string) => {
  try {
    const { resource } = await PreferencesContainer.item(userId, userId).read();
    return resource ?? null;
  } catch {
    return null;
  }
};

export const processTextInBackground = async ({
  contentId,
  userId,
  initialResource,
}: {
  contentId: string;
  userId: string;
  initialResource?: any;
}) => {
  try {
    let resource = initialResource;

    if (!resource) {
       console.log(`[Text Worker] No initial resource, fetching from DB...`);
       const response = await Content_outputsContainer.item(contentId, userId).read();
       resource = response.resource;
    } else {
       console.log(`[Text Worker] Using resource passed from controller.`);
    }

    console.log("[Text Worker] DB Read returned successfully.");
    console.log(`[Text Worker] [DEBUG] DB read complete. Resource found: ${!!resource}`);

    if (!resource) {
      console.error(`[Text Worker] Content record not found for contentId: ${contentId}`);
      throw new Error("Content not found");
    }
    // console.log(`[Text Worker] Using rawStorageRef: ${resource.rawStorageRef}`);
    let textBuffer: Buffer;
    
    // Check if rawStorageRef is a URL (starts with http)
    if (resource.rawStorageRef.trim().startsWith("http")) {
      console.log(`[Text Worker] Downloading blob: ${resource.rawStorageRef}`);
      textBuffer = await downloadBlobAsBuffer(resource.rawStorageRef);
      console.log(`[Text Worker] Download complete. Buffer size: ${textBuffer.length}`);
    } else {
      console.log(`[Text Worker] Using raw text from record.`);
      textBuffer = Buffer.from(resource.rawStorageRef);
      console.log(`[Text Worker] Raw text buffer created. Size: ${textBuffer.length}`);
    }

    const preferences = await getUserPreferences(userId);


    await processTextToBionic({
      contentId,
      userId,
      textBuffer,
      preferences,
    });
  } catch (err: any) {
    console.error(`[Text Worker] FATAL ERROR in background job for ${contentId}:`, err);
    await Content_outputsContainer
      .item(contentId, userId)
      .patch([
        { op: "set", path: "/status", value: "FAILED" },
        { op: "set", path: "/errorMessage", value: err.message },
      ]);
  }
};

export const processTextToBionic = async ({
  contentId,
  userId,
  textBuffer,
  preferences,
}: TextProcessInput) => {
  try {

    // Summarize
    console.time(`[Text Processing] ${contentId}`);
    console.log(`[Text] [${new Date().toISOString()}] Summarizing text...`);
    const summary = await summarizeText(textBuffer.toString(),preferences);

    // Generate Bionic JSON
    console.log(`[Text] [${new Date().toISOString()}] Generating Bionic JSON...`);
    const bionicJSON = await generateBionicJSON(summary,preferences);

    // Upload processed JSON to Blob
    console.log(`[Text] Uploading to Blob...`);
    const processedFile = {
      buffer: Buffer.from(JSON.stringify(bionicJSON)),
      originalname: `${contentId}-bionic.json`,
      mimetype: "application/json",
    } as Express.Multer.File;

    const { storageRef, blobName } = await uploadToBlob(
      processedFile,
      "text"
    );
    console.log(`[Text] [${new Date().toISOString()}] Upload finished.`);

    // Update Cosmos DB
    console.log(`[Text] Updating Cosmos DB...`);
    const { resource } =
      await Content_outputsContainer.item(contentId, userId).read();

    if (!resource) {
      throw new Error("Content output not found");
    }

    Object.assign(resource, {
      processedStorageRef: storageRef,
      processedBlobName: blobName,
      processedContainerName: "content-processed",
      outputFormat: "BIONIC_TEXT",
      status: "READY",
      processedAt: new Date().toISOString(),
      usedPreferences: {
        detailLevel: preferences?.detailLevel,
        preferredOutput: preferences?.preferredOutput,
        adhdLevel: preferences?.aiEvaluation?.adhdLevel,
      },
    });

    await Content_outputsContainer
      .item(contentId, userId)
      .replace(resource);
    
    console.log(`[Text] [${new Date().toISOString()}] Process completed for contentId: ${contentId}`);
    console.timeEnd(`[Text Processing] ${contentId}`);


    return resource;
  } catch (error: any) {
    console.error("[Text Processing Error]", error.message);

    await Content_outputsContainer
      .item(contentId, userId)
      .patch([
        { op: "set", path: "/status", value: "FAILED" },
        {
          op: "set",
          path: "/errorMessage",
          value: error.message || "Text processing failed",
        },
      ]);

    throw error;
  }
};
